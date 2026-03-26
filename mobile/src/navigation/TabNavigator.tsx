import React from 'react';
import { Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SimulatorScreen } from '../screens/SimulatorScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { PracticeScreen } from '../screens/PracticeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { FAQScreen } from '../screens/FAQScreen';
// Only include RevenueCatTest in dev builds
const RevenueCatTestScreen = __DEV__
  ? require('../screens/RevenueCatTestScreen').RevenueCatTestScreen
  : () => null;
import { BRAND } from '../lib/theme';
import * as Haptics from 'expo-haptics';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Dashboard: { active: 'home',          inactive: 'home-outline' },
  Simulator: { active: 'trending-up',   inactive: 'trending-up-outline' },
  Library:   { active: 'folder',        inactive: 'folder-outline' },
  Practice:  { active: 'flash',         inactive: 'flash-outline' },
};

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarButton: (props) => {
          const { onPress, ...rest } = props as any;
          return (
            <Pressable
              {...rest}
              onPress={(e) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress?.(e);
              }}
            />
          );
        },
        headerShown: false,
        tabBarStyle: {
          backgroundColor: BRAND.bg,
          borderTopColor: BRAND.cardBorder,
          paddingTop: 4,
        },
        tabBarActiveTintColor: BRAND.primary,
        tabBarInactiveTintColor: BRAND.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          if (!icons) return null;
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={size ?? 22}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home', tabBarAccessibilityLabel: 'Home tab' }}
      />
      <Tab.Screen
        name="Simulator"
        component={SimulatorScreen}
        options={{ tabBarLabel: 'Explore', tabBarAccessibilityLabel: 'Explore what-if scenarios' }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{ tabBarLabel: 'Plans', tabBarAccessibilityLabel: 'Saved plans tab' }}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeScreen}
        options={{ tabBarLabel: 'Practice', tabBarAccessibilityLabel: 'Practice tab' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="FAQ"
        component={FAQScreen}
        options={{ tabBarButton: () => null }}
      />
      {__DEV__ && (
        <Tab.Screen
          name="RevenueCatTest"
          component={RevenueCatTestScreen}
          options={{ tabBarButton: () => null }}
        />
      )}
    </Tab.Navigator>
  );
}
