import { Tabs } from 'expo-router';
import { Sun, TrendingUp, User } from 'lucide-react-native';
import React from 'react';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.lightGray,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.dmSemiBold,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <Sun size={size} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={1.5} />,
        }}
      />
    </Tabs>
  );
}
