import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MonitoringService } from '../services/MonitoringService';

export default function SettingsScreen() {
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [checkInterval, setCheckInterval] = useState(15);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('app_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setMonitoringEnabled(parsed.monitoringEnabled ?? false);
        setNotificationsEnabled(parsed.notificationsEnabled ?? true);
        setCheckInterval(parsed.checkInterval ?? 15);
      }
    } catch (error) {
      console.error('Load settings error:', error);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      const current = await AsyncStorage.getItem('app_settings');
      const settings = current ? JSON.parse(current) : {};
      const updated = { ...settings, ...newSettings };
      await AsyncStorage.setItem('app_settings', JSON.stringify(updated));
    } catch (error) {
      console.error('Save settings error:', error);
    }
  };

  const toggleMonitoring = async (enabled: boolean) => {
    try {
      setMonitoringEnabled(enabled);
      await saveSettings({ monitoringEnabled: enabled });

      if (enabled) {
        await MonitoringService.initialize();
        Alert.alert('Success', 'Background monitoring enabled');
      } else {
        Alert.alert('Info', 'Background monitoring disabled');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle monitoring');
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    await saveSettings({ notificationsEnabled: enabled });
  };

  const changeCheckInterval = (minutes: number) => {
    Alert.alert(
      'Change Check Interval',
      `Set health check interval to ${minutes} minutes?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setCheckInterval(minutes);
            await saveSettings({ checkInterval: minutes });
            Alert.alert('Success', `Check interval updated to ${minutes} minutes`);
          },
        },
      ]
    );
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all servers, credentials, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monitoring</Text>
        
        <SettingRow
          icon="pulse"
          label="Background Monitoring"
          description="Automatically check server health"
        >
          <Switch
            value={monitoringEnabled}
            onValueChange={toggleMonitoring}
            trackColor={{ false: '#ccc', true: '#007AFF' }}
          />
        </SettingRow>

        <SettingRow
          icon="notifications"
          label="Push Notifications"
          description="Receive alerts when servers go down"
        >
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#ccc', true: '#007AFF' }}
          />
        </SettingRow>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="time-outline" size={24} color="#007AFF" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Check Interval</Text>
              <Text style={styles.settingDescription}>
                Currently: {checkInterval} minutes
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.intervalButtons}>
          {[5, 15, 30, 60].map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.intervalButton,
                checkInterval === minutes && styles.intervalButtonActive,
              ]}
              onPress={() => changeCheckInterval(minutes)}
            >
              <Text
                style={[
                  styles.intervalButtonText,
                  checkInterval === minutes && styles.intervalButtonTextActive,
                ]}
              >
                {minutes}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Info</Text>
        
        <SettingRow icon="information-circle" label="Version" description="1.0.0">
          <></>
        </SettingRow>

        <SettingRow icon="phone-portrait" label="Platform" description={Platform.OS}>
          <></>
        </SettingRow>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        
        <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  children: React.ReactNode;
}

function SettingRow({ icon, label, description, children }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Ionicons name={icon} size={24} color="#007AFF" />
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingLabel}>{label}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  intervalButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  intervalButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  intervalButtonActive: {
    backgroundColor: '#007AFF',
  },
  intervalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  intervalButtonTextActive: {
    color: '#fff',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
