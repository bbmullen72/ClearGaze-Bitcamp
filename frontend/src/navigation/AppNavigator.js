import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import CalibrationScreen from '../components/calibration/CalibrationScreen';
import ResultsScreen from '../screens/ResultsScreen';
import SettingsScreen from '../screens/SettingsScreen';

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
        options={{ title: 'Safe Sight' }}
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
    </Stack.Navigator>
  );
};

export default AppNavigator; 