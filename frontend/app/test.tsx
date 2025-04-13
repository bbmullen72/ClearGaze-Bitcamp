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

const { width, height } = Dimensions.get("window");

export default function TestScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recording, setRecording] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  const recordingPromiseRef = useRef<Promise<{ uri: string }> | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  
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

  // Handle animation completion and API call
  useEffect(() => {
    if (videoUri && !uploading) {
      console.log(">>> Effect triggered: Uploading video for URI:", videoUri);
      uploadVideo(videoUri);
      // Alert.alert("Uploading video..."); // Consider removing alert for better UX
    }
  }, [videoUri]);

  // Add this new useEffect hook after the existing one for videoUri
  useEffect(() => {
    // This effect handles stopping the recording after animation completes
    if (animationComplete && recording && cameraRef.current && recordingPromiseRef.current) {
      console.log(">>> Effect triggered: Stopping recording and awaiting promise...");

      const stopAndResolve = async () => {
        const promise = recordingPromiseRef.current; // Assign to variable first
        try {
          // Stop recording first
          console.log(">>> Calling cameraRef.current.stopRecording()...");
          cameraRef.current.stopRecording();
          console.log(">>> cameraRef.current.stopRecording() called.");

          // Await the promise stored in the ref
          // Add a small delay *before* awaiting, just in case
          await new Promise(resolve => setTimeout(resolve, 200));
          console.log(">>> Awaiting recordingPromiseRef.current...");
          console.log(">>> Promise:", promise);
          console.log(">>> Promise type:",typeof promise);
          const { uri } = await promise; // Await the variable
          console.log(">>> Recording promise resolved, URI obtained:", uri);

          // Set the video URI to trigger the upload effect
          setVideoUri(uri);
          // Set recording to false *after* successfully getting the URI
          setRecording(false);

        } catch (error) {
          console.error(">>> Error stopping recording or resolving promise:", error);
          Alert.alert("Error", "Failed to save the recording.");
          setTestStarted(false); // Reset test state on error
          setRecording(false); // Ensure recording state is reset
        } finally {
           // Reset animation flag regardless of success/failure
           setAnimationComplete(false);
           // Clear the promise ref
           recordingPromiseRef.current = null;
           console.log(">>> Stop/Resolve effect finished.");
        }
      };

      stopAndResolve();
    }
  }, [animationComplete, recording]); // Dependencies: run when these change

  // Start the test
  const startTest = async () => {
    if (!cameraRef.current) return;

    // Reset animation flag
    setAnimationComplete(false);
    // Clear previous video URI if any
    setVideoUri(null);
    // Reset uploading state
    setUploading(false);

    // videoRecordingUri is no longer needed here
    // let videoRecordingUri: string | null = null;

    try {
      setTestStarted(true);
      console.log("Starting test...");

      // Set recording flag first
      setRecording(true);

      // Start recording and store the promise in the ref
      recordingPromiseRef.current = cameraRef.current.recordAsync({
        maxDuration: 12, // Keep or remove options as needed
        quality: "720p",
      });
      console.log(">>> Recording started, promise stored.");

      // Center the dot initially
      dotPosition.setValue(width / 2 - 15);
      dotVerticalPosition.setValue(height / 2 - 15); // Also reset vertical position

      // Wait a moment for the UI to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create a comprehensive 2D animation sequence
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
        Animated.delay(500),
        
        // Vertical movement (up and down)
        Animated.parallel([
          // Keep horizontal position constant at center
          Animated.timing(dotPosition, {
            toValue: width / 2 - 15,
            duration: 800,
            useNativeDriver: true // Keep true if possible
          }),
          // Move up
          Animated.timing(dotVerticalPosition, {
            toValue: height / 2 - 150,
            duration: 800,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true // Keep true if possible
          })
        ]),

        Animated.parallel([
          // Keep horizontal position constant at center
          Animated.timing(dotPosition, {
            toValue: width / 2 - 15,
            duration: 1600,
            useNativeDriver: true // Keep true if possible
          }),
          // Move down
          Animated.timing(dotVerticalPosition, {
            toValue: height / 2 + 150,
            duration: 1600,
            easing: Easing.inOut(Easing.cubic),
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

        // Final pause
        Animated.delay(500),

      ]).start(() => { // Simpler callback
        console.log(">>> Animation finished.");
        // Only set the flag here, don't stop recording yet
        setAnimationComplete(true);
      });

    } catch (error) {
      console.error("Error during test:", error);
      Alert.alert("Error", "Failed to complete the test. Please try again.");
      setTestStarted(false);
      setRecording(false);
      if (cameraRef.current && recording) { // Attempt to stop recording if it started
         cameraRef.current.stopRecording();
      }
    }
  };

  // Upload video to API
  const uploadVideo = async (videoUri: string) => {
    try {
      console.log("Uploading video...");
      Alert.alert("Uploading video...");
      setUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append("uploaded_files", {
        uri: videoUri,
        type: "video/mp4",
        name: "eye_tracking_test.mp4",
      } as any);
      
      // Send to API
      const response = await fetch("https://92f9-65-113-61-98.ngrok-free.app/test_video_inference", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Navigate to results screen with the status
      router.push({
        pathname: "/results",
        params: { status: data.status.toString() },
      });
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Error",
        "Failed to analyze the test. Please try again."
      );
      setTestStarted(false);
    } finally {
      setUploading(false);
      setVideoUri(null);
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
                  disabled={recording || uploading}
                >
                  <Text style={styles.buttonText}>START TEST</Text>
                </TouchableOpacity>
              </View>
            ) : uploading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.loadingText}>Analyzing your results...</Text>
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
  trackingText: {
    color: "white",
    fontSize: 18,
  },
  errorText: {
    color: "white",
    textAlign: "center",
    padding: 20,
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
});
