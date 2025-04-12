from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import os
from services.gemini_service import GeminiService
from services.video_processing import VideoProcessor

load_dotenv()

app = FastAPI(title="Safe Sight API")

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

@app.get("/")
async def root():
    return {"message": "Welcome to Safe Sight API"}

@app.post("/analyze-frame")
async def analyze_frame(file: UploadFile = File(...)):
    try:
        # Process the uploaded frame
        frame_data = await video_processor.process_frame(file)
        
        # Analyze using Gemini
        analysis = await gemini_service.analyze_eye_behavior(frame_data)
        
        return {
            "status": "success",
            "analysis": analysis
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 