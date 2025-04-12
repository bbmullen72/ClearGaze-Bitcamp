import mediapipe as mp
import cv2
import numpy as np
from typing import Tuple, List, Dict
import matplotlib.pyplot as plt
import io
import base64
from fastapi import UploadFile
import time
from scipy import signal
from scipy.stats import norm

class VideoProcessor:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Define iris landmarks
        self.LEFT_IRIS = [474, 475, 476, 477]
        self.RIGHT_IRIS = [469, 470, 471, 472]
        
        # Define eye horizontal landmarks
        self.L_H_LEFT = [33]
        self.L_H_RIGHT = [133]
        self.R_H_LEFT = [362]
        self.R_H_RIGHT = [263]
        
        # Initialize tracking variables
        self.eye_positions = []
        self.time_points = []
        self.start_time = None
        
        # Nystagmus detection parameters
        self.velocity_threshold = 50.0  # pixels/second
        self.velocity_variation_threshold = 0.3  # 30% variation allowed
        self.min_distance_mm = 300  # Minimum distance from camera in mm
        self.max_distance_mm = 800  # Maximum distance from camera in mm
        self.focal_length = 700  # Camera focal length in pixels
        self.real_face_width_mm = 150  # Average face width in mm

    async def process_frame(self, file: UploadFile) -> dict:
        """Process a single frame and extract eye-related data."""
        try:
            # Read the uploaded file
            contents = await file.read()
            nparr = np.frombuffer(contents, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                raise ValueError("Could not decode image")
            
            # Convert to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img_h, img_w = frame.shape[:2]
            
            # Process with MediaPipe
            results = self.face_mesh.process(rgb_frame)
            
            if not results.multi_face_landmarks:
                raise ValueError("No face detected in the frame")
            
            # Extract landmarks
            mesh_points = np.array([np.multiply([p.x, p.y], [img_w, img_h]).astype(int) 
                                  for p in results.multi_face_landmarks[0].landmark])
            
            # Get iris positions
            (l_cx, l_cy), l_radius = cv2.minEnclosingCircle(mesh_points[self.LEFT_IRIS])
            (r_cx, r_cy), r_radius = cv2.minEnclosingCircle(mesh_points[self.RIGHT_IRIS])
            
            # Calculate eye positions
            left_eye = np.array([l_cx, l_cy], dtype=np.int32)
            right_eye = np.array([r_cx, r_cy], dtype=np.int32)
            
            # Calculate face width and distance
            face_width = self._calculate_face_width(mesh_points)
            distance = self._estimate_distance(face_width)
            
            # Validate distance
            if not self._validate_distance(distance):
                raise ValueError(f"Please move closer to the camera. Current distance: {distance:.1f}mm")
            
            # Track eye positions over time
            if self.start_time is None:
                self.start_time = time.time()
            
            current_time = time.time() - self.start_time
            self.eye_positions.append((left_eye, right_eye))
            self.time_points.append(current_time)
            
            # Calculate movement metrics if we have enough data points
            metrics = {}
            if len(self.eye_positions) > 2:
                metrics = self._calculate_movement_metrics()
            
            # Analyze eye color if movement is suspicious
            if metrics.get('nystagmus_metrics', {}).get('confidence', 0) > 0.5:
                eye_color_analysis = self._analyze_eye_color(frame, left_eye, right_eye, l_radius, r_radius)
                metrics['eye_color_analysis'] = eye_color_analysis
            
            # Generate visualization
            visualization = self._generate_visualization(frame, left_eye, right_eye, mesh_points, metrics)
            
            return {
                "left_eye": left_eye.tolist(),
                "right_eye": right_eye.tolist(),
                "frame_size": [img_w, img_h],
                "landmarks": mesh_points.tolist(),
                "visualization": visualization,
                "metrics": metrics,
                "distance_mm": distance
            }
            
        except Exception as e:
            raise Exception(f"Error processing frame: {str(e)}")

    def _calculate_face_width(self, mesh_points: np.ndarray) -> float:
        """Calculate face width in pixels."""
        left_cheek = mesh_points[234]  # Left cheek landmark
        right_cheek = mesh_points[454]  # Right cheek landmark
        return np.linalg.norm(right_cheek - left_cheek)

    def _estimate_distance(self, face_width_pixels: float) -> float:
        """Estimate distance from camera in millimeters."""
        if face_width_pixels == 0:
            return float('inf')
        return (self.focal_length * self.real_face_width_mm) / face_width_pixels

    def _validate_distance(self, distance: float) -> bool:
        """Validate if user is at appropriate distance from camera."""
        return self.min_distance_mm <= distance <= self.max_distance_mm

    def _analyze_eye_color(self, frame: np.ndarray, left_eye: np.ndarray, right_eye: np.ndarray,
                          left_radius: float, right_radius: float) -> Dict:
        """Analyze eye color for potential redness or irritation."""
        # Extract eye regions
        left_eye_region = frame[int(left_eye[1]-left_radius):int(left_eye[1]+left_radius),
                              int(left_eye[0]-left_radius):int(left_eye[0]+left_radius)]
        right_eye_region = frame[int(right_eye[1]-right_radius):int(right_eye[1]+right_radius),
                               int(right_eye[0]-right_radius):int(right_eye[0]+right_radius)]
        
        # Calculate average color in BGR
        left_avg_color = np.mean(left_eye_region, axis=(0,1))
        right_avg_color = np.mean(right_eye_region, axis=(0,1))
        
        # Check for redness (high red component relative to blue and green)
        left_redness = left_avg_color[2] / (left_avg_color[0] + left_avg_color[1] + 1e-6)
        right_redness = right_avg_color[2] / (right_avg_color[0] + right_avg_color[1] + 1e-6)
        
        return {
            'left_eye_redness': left_redness,
            'right_eye_redness': right_redness,
            'is_red': left_redness > 0.4 or right_redness > 0.4
        }

    def _calculate_movement_metrics(self) -> Dict:
        """Calculate movement metrics focusing on velocity analysis."""
        metrics = {}
        
        # Calculate velocities
        velocities = self.calculate_velocity(self.eye_positions, self.time_points)
        metrics['velocities'] = velocities
        
        # Analyze velocity consistency
        velocity_analysis = self._analyze_velocity_consistency(velocities)
        metrics['velocity_analysis'] = velocity_analysis
        
        # Detect nystagmus based on velocity patterns
        nystagmus_metrics = self.detect_nystagmus(velocities, velocity_analysis)
        metrics['nystagmus_metrics'] = nystagmus_metrics
        
        return metrics

    def calculate_velocity(self, eye_positions: List[Tuple], time_points: List[float]) -> List[Tuple]:
        """Calculate eye movement velocities."""
        velocities = []
        for i in range(1, len(eye_positions) - 1):
            delta_time = time_points[i + 1] - time_points[i - 1]
            left_eye_velocity = (eye_positions[i + 1][0][0] - eye_positions[i - 1][0][0]) / delta_time
            right_eye_velocity = (eye_positions[i + 1][1][0] - eye_positions[i - 1][1][0]) / delta_time
            velocities.append((left_eye_velocity, right_eye_velocity))
        return velocities

    def _analyze_velocity_consistency(self, velocities: List[Tuple]) -> Dict:
        """Analyze consistency of eye movement velocities."""
        if len(velocities) < 3:
            return {'is_consistent': False, 'variation': 0.0}
        
        # Calculate average velocity
        left_velocities = [v[0] for v in velocities]
        right_velocities = [v[1] for v in velocities]
        
        left_avg = np.mean(np.abs(left_velocities))
        right_avg = np.mean(np.abs(right_velocities))
        
        # Calculate velocity variation
        left_variation = np.std(left_velocities) / (left_avg + 1e-6)
        right_variation = np.std(right_velocities) / (right_avg + 1e-6)
        
        # Check if velocities are consistent
        is_consistent = (left_variation < self.velocity_variation_threshold and 
                        right_variation < self.velocity_variation_threshold)
        
        return {
            'is_consistent': is_consistent,
            'left_variation': left_variation,
            'right_variation': right_variation,
            'left_avg_velocity': left_avg,
            'right_avg_velocity': right_avg
        }

    def detect_nystagmus(self, velocities: List[Tuple], velocity_analysis: Dict) -> Dict:
        """Detect nystagmus based on velocity patterns."""
        metrics = {
            'velocity_based': False,
            'consistency_based': False,
            'confidence': 0.0
        }
        
        # Check for jerky movements
        jerky_movements = 0
        for left_vel, right_vel in velocities:
            if abs(left_vel) > self.velocity_threshold or abs(right_vel) > self.velocity_threshold:
                jerky_movements += 1
            else:
                jerky_movements = 0
            if jerky_movements > 3:
                metrics['velocity_based'] = True
                break
        
        # Check velocity consistency
        metrics['consistency_based'] = not velocity_analysis['is_consistent']
        
        # Calculate confidence
        criteria_met = sum(metrics.values()) - 1  # Subtract 1 for confidence
        metrics['confidence'] = criteria_met / 2.0  # Normalize to 0-1
        
        return metrics

    def _generate_visualization(self, frame: np.ndarray, left_eye: np.ndarray, right_eye: np.ndarray, 
                              mesh_points: np.ndarray, metrics: Dict) -> str:
        """Generate visualization of eye tracking data."""
        # Create a figure with multiple subplots
        fig = plt.figure(figsize=(20, 10))
        gs = plt.GridSpec(2, 2, figure=fig)
        
        # Plot 1: Original frame with landmarks
        ax1 = fig.add_subplot(gs[0, 0])
        if frame is not None:
            ax1.imshow(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            ax1.scatter(left_eye[0], left_eye[1], color='red', label='Left Eye')
            ax1.scatter(right_eye[0], right_eye[1], color='blue', label='Right Eye')
            
            # Plot eye landmarks
            for idx in self.LEFT_IRIS + self.RIGHT_IRIS:
                ax1.scatter(mesh_points[idx][0], mesh_points[idx][1], color='green', s=10)
        
        ax1.set_title('Eye Tracking Visualization')
        ax1.legend()
        
        # Plot 2: Eye movement trajectory
        ax2 = fig.add_subplot(gs[0, 1])
        if len(self.eye_positions) > 0:
            left_eye_x = [pos[0][0] for pos in self.eye_positions]
            left_eye_y = [pos[0][1] for pos in self.eye_positions]
            right_eye_x = [pos[1][0] for pos in self.eye_positions]
            right_eye_y = [pos[1][1] for pos in self.eye_positions]
            
            ax2.plot(left_eye_x, left_eye_y, color='red', label='Left Eye', marker='o', markersize=2)
            ax2.plot(right_eye_x, right_eye_y, color='blue', label='Right Eye', marker='o', markersize=2)
            if frame is not None:
                ax2.set_xlim(0, frame.shape[1])
                ax2.set_ylim(frame.shape[0], 0)
            ax2.set_title('Eye Movement Trajectory')
            ax2.legend()
        
        # Plot 3: Velocity over time
        ax3 = fig.add_subplot(gs[1, 0])
        if 'velocities' in metrics:
            time_for_velocities = self.time_points[1:-1]
            left_eye_velocities = [v[0] for v in metrics['velocities']]
            right_eye_velocities = [v[1] for v in metrics['velocities']]
            
            ax3.plot(time_for_velocities, left_eye_velocities, color='red', label='Left Eye Velocity')
            ax3.plot(time_for_velocities, right_eye_velocities, color='blue', label='Right Eye Velocity')
            ax3.axhline(y=self.velocity_threshold, color='g', linestyle='--', label='Threshold')
            ax3.axhline(y=-self.velocity_threshold, color='g', linestyle='--')
            ax3.set_title('Eye Movement Velocity')
            ax3.set_xlabel('Time (s)')
            ax3.set_ylabel('Velocity (pixels/s)')
            ax3.legend()
        
        # Plot 4: Nystagmus metrics
        ax4 = fig.add_subplot(gs[1, 1])
        if 'nystagmus_metrics' in metrics:
            nyst_metrics = metrics['nystagmus_metrics']
            criteria = ['Velocity', 'Consistency']
            values = [nyst_metrics['velocity_based'], nyst_metrics['consistency_based']]
            ax4.bar(criteria, values)
            ax4.set_title('Nystagmus Detection Criteria')
            ax4.set_ylim(0, 1)
            
            # Add confidence score
            confidence = nyst_metrics['confidence']
            ax4.text(0.5, 0.9, f'Confidence: {confidence:.2f}', 
                    ha='center', transform=ax4.transAxes)
        
        plt.tight_layout()
        
        # Convert plot to base64 string
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
        
        return img_str 