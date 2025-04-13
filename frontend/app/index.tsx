import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../components/Text";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <LinearGradient
      colors={["#1a2a6c", "#b21f1f", "#fdbb2d"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>SafeDrive</Text>
          <Text style={styles.subtitle}>
            Test your sobriety before getting behind the wheel
          </Text>
          
          <View style={styles.iconContainer}>
            <Ionicons name="eye-outline" size={120} color="white" />
          </View>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/test")}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>START TEST</Text>
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            This app is not a substitute for professional medical advice.
            Never drive under the influence.
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
    fontSize: 42,
    fontFamily: "Poppins-Bold",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Poppins-Regular",
    color: "white",
    marginBottom: 60,
    textAlign: "center",
    opacity: 0.9,
  },
  iconContainer: {
    marginBottom: 60,
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
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#1a2a6c",
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "white",
    opacity: 0.7,
    textAlign: "center",
    marginTop: 60,
    maxWidth: "80%",
  },
});
