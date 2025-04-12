import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { EyeTrackingTester, TestResults } from '../utils/testUtils';
import CameraView from '../components/camera/CameraView';

const testScenarios = [
  {
    name: "Normal Driving",
    duration: 300,
    expectedBehavior: {
      blinkRate: 15,
      gazeStability: 0.9,
      pupilSize: 'normal'
    }
  },
  {
    name: "Drowsy Driving",
    duration: 300,
    expectedBehavior: {
      blinkRate: 5,
      gazeStability: 0.6,
      pupilSize: 'small'
    }
  },
  {
    name: "Distracted Driving",
    duration: 300,
    expectedBehavior: {
      blinkRate: 20,
      gazeStability: 0.4,
      pupilSize: 'normal'
    }
  }
];

const TestScreen = () => {
  const [tester] = useState(new EyeTrackingTester());
  const [currentTest, setCurrentTest] = useState(null);
  const [results, setResults] = useState([]);

  const startTest = (scenario) => {
    setCurrentTest(scenario);
    tester.startTest(scenario);
  };

  const handleFrameProcessed = (data) => {
    if (!currentTest) return;

    const result = tester.recordResult(
      'blinkRate',
      data.blinkRate,
      currentTest.expectedBehavior.blinkRate
    );

    setResults(prev => [...prev, result]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scenarioList}>
        {testScenarios.map((scenario, index) => (
          <View key={index} style={styles.scenarioItem}>
            <Text style={styles.scenarioName}>{scenario.name}</Text>
            <Button
              title="Start Test"
              onPress={() => startTest(scenario)}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.cameraContainer}>
        <CameraView onFrameProcessed={handleFrameProcessed} />
      </View>

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results</Text>
          {results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <Text>Metric: {result.metric}</Text>
              <Text>Value: {result.value}</Text>
              <Text>Status: {result.status}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scenarioList: {
    flex: 1,
  },
  scenarioItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  scenarioName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cameraContainer: {
    height: 300,
    marginVertical: 20,
  },
  resultsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultItem: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default TestScreen; 