import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useAppContext } from '../../context/AppContext';

const CameraView = ({ onFrameProcessed, isTesting = false }) => {
  const cameraRef = useRef(null);
  const { isTracking, updateEyeData } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [testMetrics, setTestMetrics] = useState({
    frameCount: 0,
    processingTime: 0,
    fps: 0,
  });

  useEffect(() => {
    let frameCount = 0;
    let startTime = Date.now();
    let lastFpsUpdate = Date.now();

    const updateFps = () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - lastFpsUpdate) / 1000;
      if (elapsed >= 1) {
        setTestMetrics(prev => ({
          ...prev,
          fps: Math.round(frameCount / elapsed),
          frameCount: 0
        }));
        frameCount = 0;
        lastFpsUpdate = currentTime;
      }
    };

    const interval = setInterval(updateFps, 1000);
    return () => clearInterval(interval);
  }, []);

  const processFrame = async (frame) => {
    if (!isTracking || isProcessing || !cameraReady) return;

    const startTime = Date.now();
    setIsProcessing(true);
    setTestMetrics(prev => ({
      ...prev,
      frameCount: prev.frameCount + 1
    }));

    try {
      // Simulate frame processing for testing
      const processedData = {
        blinkRate: Math.random() * 20, // Simulated blink rate
        gazeStability: Math.random(), // Simulated gaze stability
        pupilSize: 'normal', // Simulated pupil size
        timestamp: Date.now(),
        processingTime: Date.now() - startTime
      };

      updateEyeData(processedData);
      onFrameProcessed?.(processedData);

      setTestMetrics(prev => ({
        ...prev,
        processingTime: processedData.processingTime
      }));
    } catch (error) {
      console.error('Error processing frame:', error);
      Alert.alert('Error', 'Failed to process frame');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.preview}
        type={RNCamera.Constants.Type.front}
        flashMode={RNCamera.Constants.FlashMode.off}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        onCameraReady={() => setCameraReady(true)}
        captureAudio={false}
      >
        <View style={styles.overlay}>
          {isTesting && (
            <View style={styles.testMetrics}>
              <Text style={styles.metricText}>FPS: {testMetrics.fps}</Text>
              <Text style={styles.metricText}>Processing Time: {testMetrics.processingTime}ms</Text>
              <Text style={styles.metricText}>Frame Count: {testMetrics.frameCount}</Text>
            </View>
          )}
        </View>
      </RNCamera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testMetrics: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  metricText: {
    color: 'white',
    fontSize: 12,
    marginVertical: 2,
  },
});

export default CameraView; 