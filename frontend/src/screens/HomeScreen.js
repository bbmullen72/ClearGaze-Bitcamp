import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * HomeScreen Component
 * 
 * The main entry point of the application that provides navigation to key features.
 * Displays a welcome message and two main navigation buttons:
 * 1. Start Calibration - Begins the eye tracking calibration process
 * 2. Settings - Navigate to app settings
 * 
 * @param {object} navigation - React Navigation prop for screen navigation
 */
const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Main title of the app */}
      <Text style={styles.title}>Welcome to ClearGaze</Text>
      
      {/* Container for navigation buttons */}
      <View style={styles.buttonContainer}>
        {/* Calibration button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Calibration')}
        >
          <Text style={styles.buttonText}>Start Calibration</Text>
        </TouchableOpacity>
        
        {/* Settings button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles for the HomeScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',  // Light gray background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2c3e50',  // Dark blue text
  },
  buttonContainer: {
    width: '80%',  // Buttons take up 80% of screen width
  },
  button: {
    backgroundColor: '#2c3e50',  // Dark blue buttons
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HomeScreen; 