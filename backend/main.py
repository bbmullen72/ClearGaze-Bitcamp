from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import os
import google.generativeai as genai
import cv2
import mediapipe as mp
import tempfile
import shutil
import numpy as np
from typing import List, Optional

load_dotenv()

app = FastAPI(title="ClearGaze API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-pro-vision')

# Initialize MediaPipe
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Distance validation parameters
MIN_DISTANCE_MM = 300  # Minimum distance from camera in mm
MAX_DISTANCE_MM = 800  # Maximum distance from camera in mm
FOCAL_LENGTH = 700  # Camera focal length in pixels
REAL_FACE_WIDTH_MM = 150  # Average face width in mm

def check_eye_redness(frame, face_landmarks):
    """Check if the eyes appear red using MediaPipe landmarks."""
    if not face_landmarks:
        return False
    
    # Get eye landmarks
    LEFT_IRIS = [474, 475, 476, 477]
    RIGHT_IRIS = [469, 470, 471, 472]
    
    height, width = frame.shape[:2]
    
    # Extract eye regions
    left_landmarks = []
    right_landmarks = []
    
    for idx in LEFT_IRIS:
        landmark = face_landmarks.landmark[idx]
        left_landmarks.append((int(landmark.x * width), int(landmark.y * height)))
    
    for idx in RIGHT_IRIS:
        landmark = face_landmarks.landmark[idx]
        right_landmarks.append((int(landmark.x * width), int(landmark.y * height)))
    
    # Calculate bounding boxes
    l_min_x = min(p[0] for p in left_landmarks) - 5
    l_min_y = min(p[1] for p in left_landmarks) - 5
    l_max_x = max(p[0] for p in left_landmarks) + 5
    l_max_y = max(p[1] for p in left_landmarks) + 5
    
    r_min_x = min(p[0] for p in right_landmarks) - 5
    r_min_y = min(p[1] for p in right_landmarks) - 5
    r_max_x = max(p[0] for p in right_landmarks) + 5
    r_max_y = max(p[1] for p in right_landmarks) + 5
    
    # Make sure coordinates are within frame
    l_min_x, l_min_y = max(0, l_min_x), max(0, l_min_y)
    l_max_x, l_max_y = min(width-1, l_max_x), min(height-1, l_max_y)
    r_min_x, r_min_y = max(0, r_min_x), max(0, r_min_y)
    r_max_x, r_max_y = min(width-1, r_max_x), min(height-1, r_max_y)
    
    # Extract eye regions
    left_eye_region = frame[l_min_y:l_max_y, l_min_x:l_max_x]
    right_eye_region = frame[r_min_y:r_max_y, r_min_x:r_max_x]
    
    # Check if regions are valid
    if left_eye_region.size == 0 or right_eye_region.size == 0:
        return False
    
    # Calculate average color in BGR
    left_avg_color = np.mean(left_eye_region, axis=(0,1))
    right_avg_color = np.mean(right_eye_region, axis=(0,1))
    
    # Check for redness (high red component relative to blue and green)
    left_redness = left_avg_color[2] / (left_avg_color[0] + left_avg_color[1] + 1e-6)
    right_redness = right_avg_color[2] / (right_avg_color[0] + right_avg_color[1] + 1e-6)
    
    return left_redness > 0.4 or right_redness > 0.4

def validate_distance(face_landmarks, frame_width, frame_height):
    """Validate if user is at appropriate distance from camera."""
    if not face_landmarks:
        return False, 0
    
    # Get left and right cheek landmarks
    left_cheek_idx = 234
    right_cheek_idx = 454
    
    left_cheek = face_landmarks.landmark[left_cheek_idx]
    right_cheek = face_landmarks.landmark[right_cheek_idx]
    
    # Convert to pixel coordinates
    left_cheek_px = (int(left_cheek.x * frame_width), int(left_cheek.y * frame_height))
    right_cheek_px = (int(right_cheek.x * frame_width), int(right_cheek.y * frame_height))
    
    # Calculate face width in pixels
    face_width_pixels = ((right_cheek_px[0] - left_cheek_px[0])**2 + 
                         (right_cheek_px[1] - left_cheek_px[1])**2)**0.5
    
    # Estimate distance
    distance_mm = (FOCAL_LENGTH * REAL_FACE_WIDTH_MM) / face_width_pixels
    
    # Check if distance is within valid range
    is_valid = MIN_DISTANCE_MM <= distance_mm <= MAX_DISTANCE_MM
    
    return is_valid, distance_mm

def count_horizontal_passes(eye_positions: List[tuple], frame_width: int) -> int:
    """Count the number of left-right/right-left passes in eye movement."""
    if len(eye_positions) < 10:  # Need enough data points
        return 0
    
    # Use left eye for tracking (first value in each tuple)
    x_positions = [pos[0] for pos in eye_positions]
    
    # Define left, center and right regions
    left_region = frame_width * 0.25
    right_region = frame_width * 0.75
    
    # Track region changes to count passes
    current_region = None
    passes = 0
    
    for x in x_positions:
        if x < left_region:
            new_region = "left"
        elif x > right_region:
            new_region = "right"
        else:
            new_region = "center"
        
        # Count a pass when moving from left to right or right to left
        if current_region == "left" and new_region == "right":
            passes += 1
        elif current_region == "right" and new_region == "left":
            passes += 1
        
        current_region = new_region
    
    return passes

@app.post("/validate-distance")
async def validate_user_distance(file: UploadFile = File(...)):
    """Check if the user is at an appropriate distance from the camera."""
    try:
        # Read the uploaded image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Process with MediaPipe
        height, width = frame.shape[:2]
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_frame)
        
        if not results.multi_face_landmarks:
            return {"is_valid": False, "message": "No face detected", "distance_mm": 0}
        
        is_valid, distance_mm = validate_distance(
            results.multi_face_landmarks[0], width, height
        )
        
        if is_valid:
            return {
                "is_valid": True, 
                "message": "User is at appropriate distance", 
                "distance_mm": round(distance_mm)
            }
        else:
            if distance_mm < MIN_DISTANCE_MM:
                message = "Please move further from the camera"
            else:
                message = "Please move closer to the camera"
            
            return {
                "is_valid": False, 
                "message": message, 
                "distance_mm": round(distance_mm)
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    """Analyze a video for eye movement patterns and potential impairment."""
    try:
        # Save uploaded video to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name
        
        # Read video
        cap = cv2.VideoCapture(temp_path)
        if not cap.isOpened():
            os.unlink(temp_path)
            raise HTTPException(status_code=400, detail="Could not open video file")
        
        # Get video dimensions
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Process video with MediaPipe
        frames_with_landmarks = []
        eye_positions = []
        valid_distance_frames = 0
        total_frames = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            total_frames += 1
            
            # Convert to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb_frame)
            
            if results.multi_face_landmarks:
                # Check distance
                is_valid, _ = validate_distance(
                    results.multi_face_landmarks[0], frame_width, frame_height
                )
                
                if is_valid:
                    valid_distance_frames += 1
                    frames_with_landmarks.append((frame, results.multi_face_landmarks[0]))
                    
                    # Track eye position for pass counting
                    LEFT_IRIS = 474  # Center of left iris
                    landmark = results.multi_face_landmarks[0].landmark[LEFT_IRIS]
                    x_pos = landmark.x * frame_width
                    y_pos = landmark.y * frame_height
                    eye_positions.append((x_pos, y_pos))
        
        cap.release()
        
        # Check if we have enough frames with valid distance
        distance_validity_ratio = valid_distance_frames / total_frames if total_frames > 0 else 0
        if distance_validity_ratio < 0.7:  # At least 70% of frames should have valid distance
            os.unlink(temp_path)
            return {
                "result": "invalid_distance",
                "message": "User was not at appropriate distance for most of the video",
                "valid_frames_ratio": distance_validity_ratio
            }
        
        # Count horizontal passes
        passes = count_horizontal_passes(eye_positions, frame_width)
        if passes < 14:
            os.unlink(temp_path)
            return {
                "result": "insufficient_passes",
                "message": f"Detected {passes} eye movement passes. At least 14 are required.",
                "passes_detected": passes
            }
        
        if not frames_with_landmarks:
            os.unlink(temp_path)
            raise HTTPException(status_code=400, detail="No faces detected in video")
        
        # Prepare prompt for Gemini
        prompt = """
        Analyze this video of a person's eyes following a dot on screen from left to right and back repeatedly.
        
        Focus specifically on:
        1. Any jerking or fluttering movements, especially when the eyes are at about 45-degrees from center
        2. Smoothness of eye tracking when moving from left to right and right to left
        3. Any nystagmus (involuntary, rapid, rhythmic movement of the eyes)
        4. Consistency of movement speed, which should be smooth without sudden accelerations
        
        This is being used to assess potential impairment. 
        Respond with exactly one of these three options:
        - "yes" if you clearly see jerking/fluttering movements that indicate impairment
        - "no" if the eye movements appear normal and smooth
        - "suspicious" if you're unsure or see minor irregularities
        """
        
        # Get response from Gemini
        response = model.generate_content([prompt, temp_path])
        gemini_result = response.text.lower().strip()
        
        # Clean up temporary file
        os.unlink(temp_path)
        
        # If suspicious, check eye redness
        eye_redness = False
        if "suspicious" in gemini_result:
            # Check redness in a few frames
            for frame, landmarks in frames_with_landmarks[::10]:  # Check every 10th frame
                if check_eye_redness(frame, landmarks):
                    eye_redness = True
                    break
        
        return {
            "result": gemini_result,
            "eye_redness_detected": eye_redness,
            "passes_detected": passes,
            "final_assessment": "likely_impaired" if gemini_result == "yes" or 
                              (gemini_result == "suspicious" and eye_redness) else "likely_normal"
        }
        
    except Exception as e:
        # Make sure temp file is cleaned up in case of error
        if 'temp_path' in locals():
            try:
                os.unlink(temp_path)
            except:
                pass
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8010, reload=True) 