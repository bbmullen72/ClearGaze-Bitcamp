from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import os
from services.gemini_service import GeminiService
from services.video_processing import VideoProcessor
from typing import List
import time

load_dotenv()

app = FastAPI(title="ClearGaze API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
gemini_service = GeminiService()
video_processor = VideoProcessor()

from flask import Flask, request, jsonify
import cv2 as cv
import numpy as np



# Dummy face detector function – replace with actual implementation (e.g., MediaPipe or face_recognition)
def face_detector(image):
    # For example, use OpenCV's Haar cascades (not very accurate but serves as a starting point):
    gray = cv.cvtColor(image, cv.COLOR_BGR2GRAY)
    face_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    if len(faces) > 0:
        return faces[0]  # return the first face bounding box (x, y, w, h)
    return None

def estimate_distance(face_width_pixels, focal_length=700, real_face_width_mm=150):
    if face_width_pixels is None or face_width_pixels == 0:
        return None
    distance = (focal_length * real_face_width_mm) / face_width_pixels  # distance in mm
    return distance

@app.route('/calibrate', methods=['POST'])
def calibrate():
    # Expect the front end to send an image file (or Base64 encoded image)
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    # Convert the uploaded file into an image using OpenCV:
    file_bytes = np.fromstring(file.read(), np.uint8)
    image = cv.imdecode(file_bytes, cv.IMREAD_COLOR)

    face_bbox = face_detector(image)
    if face_bbox is None:
        return jsonify({'error': 'No face detected'}), 400

    x, y, w, h = face_bbox
    distance = estimate_distance(w)
    # Optionally, return additional details like the bounding box
    return jsonify({'distance_mm': distance, 'face_width_pixels': w})

if __name__ == '__main__':
    app.run(debug=True)



@app.get("/")
async def root():
    return {"message": "Welcome to ClearGaze API"}

@app.post("/start-test")
async def start_test():
    """Start a new eye tracking test session."""
    try:
        # Reset the video processor for a new test
        video_processor.eye_positions = []
        video_processor.time_points = []
        video_processor.start_time = None
        
        return {
            "status": "success",
            "message": "Test session started"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-frame")
async def analyze_frame(file: UploadFile = File(...)):
    """Analyze a single frame for eye movement and nystagmus."""
    try:
        # Process the uploaded frame
        frame_data = await video_processor.process_frame(file)
        
        # Analyze using Gemini
        analysis = await gemini_service.analyze_eye_behavior(frame_data)
        
        return {
            "status": "success",
            "analysis": analysis,
            "nystagmus_detected": frame_data["nystagmus_detected"],
            "velocities": frame_data["velocities"]
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/complete-test")
async def complete_test():
    """Complete the eye tracking test and provide final analysis."""
    try:
        if not video_processor.eye_positions:
            raise HTTPException(status_code=400, detail="No test data available")
        
        # Calculate final velocities
        velocities = video_processor.calculate_velocity(
            video_processor.eye_positions,
            video_processor.time_points
        )
        
        # Detect nystagmus
        nystagmus_detected = video_processor.detect_nystagmus(velocities)
        
        # Generate final visualization
        final_visualization = video_processor._generate_visualization(
            None,  # No frame needed for final visualization
            video_processor.eye_positions[-1][0],  # Last left eye position
            video_processor.eye_positions[-1][1],  # Last right eye position
            None,  # No landmarks needed
            velocities
        )
        
        return {
            "status": "success",
            "nystagmus_detected": nystagmus_detected,
            "test_duration": video_processor.time_points[-1] if video_processor.time_points else 0,
            "frames_analyzed": len(video_processor.eye_positions),
            "final_visualization": final_visualization
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 