import google.generativeai as genai
from dotenv import load_dotenv
import os
from typing import Dict, List
import matplotlib.pyplot as plt
import io
import base64

load_dotenv()

class GeminiService:
    def __init__(self):
        # Configure Gemini API
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.model = genai.GenerativeModel('gemini-pro')
        
        # Define the system prompt for eye movement analysis
        self.system_prompt = """
        You are an expert in analyzing eye movements and detecting nystagmus. 
        Analyze the following eye movement data and determine if there are signs of impairment.
        Consider the following factors:
        1. Smoothness of eye movements
        2. Presence of rapid, jerky movements
        3. Consistency of tracking
        4. Any unusual patterns in the movement data
        
        Provide a detailed analysis and a clear conclusion about whether the person is impaired or not.
        """

    async def analyze_eye_behavior(self, frame_data: Dict) -> Dict:
        """Analyze eye movement data using Gemini AI."""
        try:
            # Prepare the data for analysis
            analysis_prompt = f"""
            {self.system_prompt}
            
            Eye Movement Data:
            - Left Eye Position: {frame_data['left_eye']}
            - Right Eye Position: {frame_data['right_eye']}
            - Frame Size: {frame_data['frame_size']}
            
            Please analyze this data and provide:
            1. A detailed analysis of the eye movements
            2. Whether there are signs of impairment
            3. Confidence level in the assessment
            4. Any additional observations
            """
            
            # Get response from Gemini
            response = await self.model.generate_content(analysis_prompt)
            
            # Process the response
            analysis = response.text
            
            # Determine if the person is impaired based on the analysis
            is_impaired = "impaired" in analysis.lower() or "nystagmus" in analysis.lower()
            
            # Generate analysis visualization
            analysis_plot = self._generate_analysis_plot(frame_data, is_impaired)
            
            return {
                "analysis": analysis,
                "is_impaired": is_impaired,
                "confidence": self._extract_confidence(analysis),
                "visualization": frame_data.get("visualization", ""),
                "analysis_plot": analysis_plot
            }
            
        except Exception as e:
            raise Exception(f"Error analyzing eye behavior: {str(e)}")

    def _generate_analysis_plot(self, frame_data: Dict, is_impaired: bool) -> str:
        """Generate a visualization of the analysis results."""
        plt.figure(figsize=(10, 6))
        
        # Plot eye positions
        left_eye = frame_data['left_eye']
        right_eye = frame_data['right_eye']
        
        plt.scatter(left_eye[0], left_eye[1], color='red', label='Left Eye', s=100)
        plt.scatter(right_eye[0], right_eye[1], color='blue', label='Right Eye', s=100)
        
        # Add status text
        status = "IMPAIRED" if is_impaired else "NOT IMPAIRED"
        status_color = "red" if is_impaired else "green"
        plt.text(0.5, 0.95, f"Status: {status}", 
                horizontalalignment='center',
                verticalalignment='center',
                transform=plt.gca().transAxes,
                fontsize=14,
                color=status_color,
                bbox=dict(facecolor='white', alpha=0.8))
        
        # Set plot properties
        plt.xlim(0, frame_data['frame_size'][0])
        plt.ylim(frame_data['frame_size'][1], 0)  # Invert y-axis to match image coordinates
        plt.title('Eye Movement Analysis')
        plt.legend()
        
        # Convert plot to base64 string
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
        
        return img_str

    def _extract_confidence(self, analysis: str) -> float:
        """Extract confidence level from the analysis text."""
        if "high confidence" in analysis.lower():
            return 0.9
        elif "medium confidence" in analysis.lower():
            return 0.7
        elif "low confidence" in analysis.lower():
            return 0.5
        else:
            return 0.7  # Default confidence level 