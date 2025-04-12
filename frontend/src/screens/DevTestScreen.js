import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, Switch } from 'react-native';
import CameraView from '../components/camera/CameraView';
import { useAppContext } from '../context/AppContext';

const DevTestScreen = () => {
  const { startTracking, stopTracking, isTracking } = useAppContext();
  const [showMetrics, setShowMetrics] = useState(true);
  const [testData, setTestData] = useState({
    totalFrames: 0,
    averageProcessingTime: 0,
    maxProcessingTime: 0,
    minProcessingTime: Infinity,
    errors: 0,
  });

  const handleFrameProcessed = (data) => {
    setTestData(prev => ({
      totalFrames: prev.totalFrames + 1,
      averageProcessingTime: (prev.averageProcessingTime * prev.totalFrames + data.processingTime) / (prev.totalFrames + 1),
      maxProcessingTime: Math.max(prev.maxProcessingTime, data.processingTime),
      minProcessingTime: Math.min(prev.minProcessingTime, data.processingTime),
      errors: prev.errors,
    }));
  };

  const handleError = () => {
    setTestData(prev => ({
      ...prev,
      errors: prev.errors + 1,
    }));
  };

  const resetTestData = () => {
    setTestData({
      totalFrames: 0,
      averageProcessingTime: 0,
      maxProcessingTime: 0,
      minProcessingTime: Infinity,
      errors: 0,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <Button
          title={isTracking ? "Stop Tracking" : "Start Tracking"}
          onPress={isTracking ? stopTracking : startTracking}
        />
        <View style={styles.switchContainer}>
          <Text>Show Metrics</Text>
          <Switch
            value={showMetrics}
            onValueChange={setShowMetrics}
          />
        </View>
        <Button
          title="Reset Test Data"
          onPress={resetTestData}
        />
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          onFrameProcessed={handleFrameProcessed}
          isTesting={showMetrics}
        />
      </View>

      {showMetrics && (
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>Performance Metrics</Text>
          <View style={styles.metricItem}>
            <Text>Total Frames Processed:</Text>
            <Text>{testData.totalFrames}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text>Average Processing Time:</Text>
            <Text>{testData.averageProcessingTime.toFixed(2)}ms</Text>
          </View>
          <View style={styles.metricItem}>
            <Text>Max Processing Time:</Text>
            <Text>{testData.maxProcessingTime}ms</Text>
          </View>
          <View style={styles.metricItem}>
            <Text>Min Processing Time:</Text>
            <Text>{testData.minProcessingTime === Infinity ? 'N/A' : `${testData.minProcessingTime}ms`}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text>Errors:</Text>
            <Text>{testData.errors}</Text>
          </View>
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraContainer: {
    height: 300,
    marginBottom: 20,
  },
  metricsContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
});

export default DevTestScreen; 