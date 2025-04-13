import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../components/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";

export default function ResultsScreen() {
  const { status } = useLocalSearchParams<{ status: string }>();
  const isImpaired = status === "true";
  
  return (
    <LinearGradient
      colors={isImpaired ? ["#ff416c", "#ff4b2b"] : ["#56ab2f", "#a8e063"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Test Results</Text>
          
          <View style={styles.resultContainer}>
            {isImpaired ? (
              <>
                <Ionicons name="warning" size={80} color="white" />
                <Text style={styles.resultText}>
                  You appear to be impaired
                </Text>
                <Text style={styles.adviceText}>
                  Please do not drive. Consider calling a friend, 
                  taxi, or rideshare service.
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={80} color="white" />
                <Text style={styles.resultText}>
                  You appear to be unimpaired
                </Text>
                <Text style={styles.adviceText}>
                  Remember to always drive safely and responsibly.
                </Text>
              </>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.buttonText}>BACK TO HOME</Text>
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            This test is not a legal determination of sobriety.
            Always use your best judgment before driving.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontFamily: "Poppins-Bold",
    color: "white",
    marginBottom: 40,
  },
  resultContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  resultText: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    color: "white",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  adviceText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "white",
    textAlign: "center",
    opacity: 0.9,
    maxWidth: "80%",
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "white",
    opacity: 0.7,
    textAlign: "center",
    marginTop: 40,
    maxWidth: "80%",
  },
});
