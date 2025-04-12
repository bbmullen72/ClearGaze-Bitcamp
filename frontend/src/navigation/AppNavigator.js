import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import CalibrationScreen from '../components/calibration/CalibrationScreen';
import ResultsScreen from '../screens/ResultsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TestScreen from '../screens/TestScreen';
import DevTestScreen from '../screens/DevTestScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'ClearGaze' }}
      />
      <Stack.Screen 
        name="Calibration" 
        component={CalibrationScreen} 
        options={{ title: 'Calibration' }}
      />
      <Stack.Screen 
        name="Results" 
        component={ResultsScreen} 
        options={{ title: 'Results' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="Test" 
        component={TestScreen} 
        options={{ title: 'Testing' }}
      />
      <Stack.Screen 
        name="DevTest" 
        component={DevTestScreen} 
        options={{ title: 'Development Testing' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 