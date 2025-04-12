import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useAppContext } from '../../context/AppContext';

const CameraView = ({ onFrameProcessed }) => {
  const cameraRef = useRef(null);
  const { isTracking, updateEyeData } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const processFrame = async (frame) => {
    if (!isTracking || isProcessing) return;

    setIsProcessing(true);
    try {
      // TODO: Implement frame processing logic
      // This is where we'll send the frame to the backend for analysis
      const processedData = await processFrameData(frame);
      updateEyeData(processedData);
      onFrameProcessed?.(processedData);
    } catch (error) {
      console.error('Error processing frame:', error);
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
        onBarCodeRead={() => {}}
        captureAudio={false}
      >
        <View style={styles.overlay}>
          {/* Add overlay elements for eye tracking guidance */}
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
});

export default CameraView; 