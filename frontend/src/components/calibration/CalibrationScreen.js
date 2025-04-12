import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * CalibrationScreen Component
 * 
 * A multi-step calibration process for eye tracking setup.
 * Guides users through three steps:
 * 1. Device positioning
 * 2. Face detection
 * 3. Eye tracking calibration
 * 
 * @param {object} navigation - React Navigation prop for screen navigation
 */
const CalibrationScreen = ({ navigation }) => {
  // State to track current step in calibration process
  const [calibrationStep, setCalibrationStep] = useState(1);
  const totalSteps = 3;

  /**
   * Handles progression through calibration steps
   * Navigates to Results screen when calibration is complete
   */
  const handleNextStep = () => {
    if (calibrationStep < totalSteps) {
      setCalibrationStep(prev => prev + 1);
    } else {
      navigation.navigate('Results');
    }
  };

  /**
   * Renders content for current calibration step
   * Each step includes a title and descriptive text
   */
  const renderStepContent = () => {
    switch (calibrationStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Step 1: Position Your Device</Text>
            <Text style={styles.stepDescription}>
              Place your device at eye level and ensure good lighting conditions.
            </Text>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Step 2: Face Detection</Text>
            <Text style={styles.stepDescription}>
              Position your face within the frame and remain still.
            </Text>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Step 3: Calibration</Text>
            <Text style={styles.stepDescription}>
              Follow the on-screen markers with your eyes.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Step {calibrationStep} of {totalSteps}
        </Text>
        {/* Visual progress dots */}
        <View style={styles.progressBar}>
          {[...Array(totalSteps)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index < calibrationStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Current step content */}
      {renderStepContent()}

      {/* Navigation button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleNextStep}
      >
        <Text style={styles.buttonText}>
          {calibrationStep === totalSteps ? 'Finish' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the CalibrationScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',  // Light gray background
    padding: 20,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressText: {
    fontSize: 16,
    color: '#2c3e50',  // Dark blue text
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',  // Light gray for inactive dots
    marginHorizontal: 5,
  },
  progressDotActive: {
    backgroundColor: '#2c3e50',  // Dark blue for active dots
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',  // Dark blue text
    marginBottom: 15,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#34495e',  // Slightly lighter blue text
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#2c3e50',  // Dark blue button
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CalibrationScreen; 