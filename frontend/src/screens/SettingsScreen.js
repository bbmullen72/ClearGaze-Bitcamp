import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';

/**
 * SettingsScreen Component
 * 
 * Provides user configuration options for the app.
 * Currently includes toggles for:
 * - Notifications
 * - Dark Mode
 * Also displays app information in the About section.
 */
const SettingsScreen = () => {
  // State for settings toggles
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Settings title */}
        <Text style={styles.title}>Settings</Text>
        
        {/* Notifications toggle */}
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notifications ? '#2c3e50' : '#f4f3f4'}
          />
        </View>

        {/* Dark Mode toggle */}
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={darkMode ? '#2c3e50' : '#f4f3f4'}
          />
        </View>

        {/* About section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About</Text>
          <Text style={styles.infoText}>ClearGaze v1.0.0</Text>
          <Text style={styles.infoText}>© 2024 ClearGaze Team</Text>
        </View>
      </View>
    </ScrollView>
  );
};

// Styles for the SettingsScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',  // Light gray background
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2c3e50',  // Dark blue text
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8e3',  // Light border color
  },
  settingText: {
    fontSize: 18,
    color: '#2c3e50',  // Dark blue text
  },
  infoSection: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#fff',  // White background
    borderRadius: 10,
    // Card shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2c3e50',  // Dark blue text
  },
  infoText: {
    fontSize: 16,
    color: '#34495e',  // Slightly lighter blue text
    marginBottom: 5,
  },
});

export default SettingsScreen; 