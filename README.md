# Safe Sight - Driver Impairment Detection System

Safe Sight is a mobile application that uses eye-tracking technology to detect driver impairment in real-time. The system analyzes various eye behaviors such as blinking rate, gaze direction, and pupil dilation to determine if a driver might be impaired.

## Features

- Real-time eye tracking and analysis
- Calibration system for personalized tracking
- Impairment detection based on multiple eye behavior metrics
- User-friendly mobile interface
- Secure data transmission
- Cross-platform support (iOS and Android)

## Project Structure

```
safe-sight/
├── frontend/           # React Native mobile application
├── backend/           # FastAPI backend server
```

## Setup Instructions

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a .env file with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

5. Start the server:
   ```bash
   python main.py
   ```

## Technology Stack

- Frontend:
  - React Native
  - Expo
  - React Navigation
  - React Native Camera

- Backend:
  - FastAPI
  - Google Gemini API
  - OpenCV
  - Python

## Security Considerations

- All video data is processed locally on the device when possible
- API keys and sensitive data are stored securely
- HTTPS is used for all communications
- User data is anonymized and encrypted

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 