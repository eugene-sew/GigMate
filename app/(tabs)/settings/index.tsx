import React from 'react';
import { View, ScrollView, TouchableOpacity, Switch, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {useTheme} from "@/context/ThemeContext";

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: boolean;
  onPress: () => void;
  type?: 'arrow' | 'switch';
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  value,
  onPress,
  type = 'arrow'
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.settingItem,
        { borderBottomColor: colors.border }
      ]}
    >
      <Ionicons
        name={icon}
        size={24}
        color={colors.primary}
        style={styles.icon}
      />
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      {type === 'arrow' && (
        <Ionicons
          name="chevron-forward"
          size={24}
          color={colors.text}
        />
      )}
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{
            false: colors.border,
            true: colors.primary
          }}
          thumbColor={colors.background}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  icon: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  settingsGroup: {
    marginTop: 20,
  },
});

export default function Settings() {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Settings',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView>
        <View style={styles.settingsGroup}>
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            type="switch"
            value={isDark}
            onPress={toggleTheme}
          />

          <SettingItem
            icon="person-outline"
            title="Profile"
            onPress={() => {}}
          />

          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            onPress={() => {}}
          />

          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacy"
            onPress={() => {}}
          />

          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => {}}
          />

          <SettingItem
            icon="information-circle-outline"
            title="About"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </View>
  );
}