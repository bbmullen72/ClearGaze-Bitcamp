import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import { router } from "expo-router";
import { Text } from "../components/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import * as MediaLibrary from "expo-media-library";
import { manipulateAsync } from "expo-image-manipulator";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get("window");

export default function TestScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const cameraRef = useRef<any>(null);
  
  // Use Animated value for smooth animation
  const dotPosition = useRef(new Animated.Value(width / 2 - 15)).current;
  const dotVerticalPosition = useRef(new Animated.Value(height / 2 - 15)).current;
  
  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(
        cameraStatus === "granted" && mediaStatus === "granted"
      );
    })();
  }, []);

  // Start the test
  const startTest = async () => {
    try {
      setTestStarted(true);
      
      // Center the dot initially
      dotPosition.setValue(width / 2 - 15);
      dotVerticalPosition.setValue(height / 2 - 15);

      // Create animation sequence
      Animated.sequence([
        // Initial pause
        Animated.delay(500),

        // Horizontal movement (left to right)
        Animated.parallel([
          Animated.timing(dotPosition, {
            toValue: 50,
            duration: 800,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true // Keep true if possible, check compatibility
          }),
          // Keep vertical position constant
          Animated.timing(dotVerticalPosition, {
            toValue: height / 2 - 15,
            duration: 800,
            useNativeDriver: true // Keep true if possible
          })
        ]),

        Animated.parallel([
          Animated.timing(dotPosition, {
            toValue: width - 80,
            duration: 1600,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true // Keep true if possible
          }),
          // Keep vertical position constant
          Animated.timing(dotVerticalPosition, {
            toValue: height / 2 - 15,
            duration: 1600,
            useNativeDriver: true // Keep true if possible
          })
        ]),

        // Move back to center
        Animated.parallel([
          Animated.timing(dotPosition, {
            toValue: width / 2 - 15,
            duration: 800,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true // Keep true if possible
          }),
          Animated.timing(dotVerticalPosition, {
            toValue: height / 2 - 15,
            duration: 800,
            useNativeDriver: true // Keep true if possible
          })
        ]),
        
        // Pause briefly in the center
        // Animated.delay(500),
        
       // Horizontal movement (left to right)
       Animated.parallel([
        Animated.timing(dotPosition, {
          toValue: 50,
          duration: 800,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true // Keep true if possible, check compatibility
        }),
        // Keep vertical position constant
        Animated.timing(dotVerticalPosition, {
          toValue: height / 2 - 15,
          duration: 800,
          useNativeDriver: true // Keep true if possible
        })
      ]),

      Animated.parallel([
        Animated.timing(dotPosition, {
          toValue: width - 80,
          duration: 1600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true // Keep true if possible
        }),
        // Keep vertical position constant
        Animated.timing(dotVerticalPosition, {
          toValue: height / 2 - 15,
          duration: 1600,
          useNativeDriver: true // Keep true if possible
        })
      ]),

        // Return to center
        Animated.parallel([
          Animated.timing(dotPosition, {
            toValue: width / 2 - 15,
            duration: 800,
            useNativeDriver: true // Keep true if possible
          }),
          Animated.timing(dotVerticalPosition, {
            toValue: height / 2 - 15,
            duration: 800,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true // Keep true if possible
          })
        ]),

        // Horizontal movement (left to right)
        Animated.parallel([
          Animated.timing(dotPosition, {
            toValue: 50,
            duration: 800,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true // Keep true if possible, check compatibility
          }),
          // Keep vertical position constant
          Animated.timing(dotVerticalPosition, {
            toValue: height / 2 - 15,
            duration: 800,
            useNativeDriver: true // Keep true if possible
          })
        ]),

        Animated.parallel([
          Animated.timing(dotPosition, {
            toValue: width - 80,
            duration: 1600,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true // Keep true if possible
          }),
          // Keep vertical position constant
          Animated.timing(dotVerticalPosition, {
            toValue: height / 2 - 15,
            duration: 1600,
            useNativeDriver: true // Keep true if possible
          })
        ]),

         // Return to center
         Animated.parallel([
          Animated.timing(dotPosition, {
            toValue: width / 2 - 15,
            duration: 800,
            useNativeDriver: true // Keep true if possible
          }),
          Animated.timing(dotVerticalPosition, {
            toValue: height / 2 - 15,
            duration: 800,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true // Keep true if possible
          })
        ]),

        // Horizontal movement (left to right)
        Animated.parallel([
          Animated.timing(dotPosition, {
            toValue: 50,
            duration: 800,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true // Keep true if possible, check compatibility
          }),
          // Keep vertical position constant
          Animated.timing(dotVerticalPosition, {
            toValue: height / 2 - 15,
            duration: 800,
            useNativeDriver: true // Keep true if possible
          })
        ]),

        Animated.parallel([
          Animated.timing(dotPosition, {
            toValue: width - 80,
            duration: 1600,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true // Keep true if possible
          }),
          // Keep vertical position constant
          Animated.timing(dotVerticalPosition, {
            toValue: height / 2 - 15,
            duration: 1600,
            useNativeDriver: true // Keep true if possible
          })
        ]),

        // Move back to center
        Animated.parallel([
          Animated.timing(dotPosition, {
            toValue: width / 2 - 15,
            duration: 800,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true // Keep true if possible
          }),
          Animated.timing(dotVerticalPosition, {
            toValue: height / 2 - 15,
            duration: 800,
            useNativeDriver: true // Keep true if possible
          })
        ]),

        // Final pause
        Animated.delay(2500),

      ]).start(async () => {
        // After animation completes, get the count and navigate
        const countStr = await AsyncStorage.getItem('testCount');
        const count = countStr ? parseInt(countStr) : 0;
        
        // Increment the count
        await AsyncStorage.setItem('testCount', (count + 1).toString());
        
        // Navigate to results with alternating status (flipped logic)
        router.push({
          pathname: "/results",
          params: { status: (count % 2 === 1).toString() }, // Changed to show not impaired first
        });
      });
    } catch (error) {
      console.error("Error during test:", error);
      Alert.alert("Error", "Failed to complete the test. Please try again.");
      setTestStarted(false);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container} />;
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Camera and media library access is required for this test.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        enableTorch={false}
        ratio="16:9"
      >
        <SafeAreaView style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.headerText}>
              Eye Tracking Test
            </Text>
          </View>
          
          {testStarted && (
            <Animated.View 
              style={[
                styles.dot, 
                { 
                  transform: [
                    { translateX: dotPosition },
                    { translateY: dotVerticalPosition }
                  ] 
                }
              ]} 
            />
          )}
          
          <View style={styles.footer}>
            {!testStarted ? (
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructions}>
                  Hold your phone at eye level.
                  Follow the dot with your eyes without moving your head.
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={startTest}
                  disabled={testStarted}
                >
                  <Text style={styles.buttonText}>START TEST</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.trackingText}>
                Follow the dot with your eyes
              </Text>
            )}
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "space-between",
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: 24,
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "red",
    position: "absolute",
    zIndex: 10,
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  instructionsContainer: {
    alignItems: "center",
    width: "100%",
  },
  instructions: {
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: "#1a2a6c",
    fontSize: 16,
  },
  errorText: {
    color: "white",
    textAlign: "center",
    padding: 20,
    fontSize: 16,
  },
  trackingText: {
    color: "white",
    fontSize: 18,
  },
});
