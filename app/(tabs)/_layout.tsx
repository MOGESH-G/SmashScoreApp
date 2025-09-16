import { AntDesign, FontAwesome, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: "auto",
          maxHeight: 80,
          backgroundColor: "#1a1a1a",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: "absolute",
          paddingTop: 5,
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: "#eaeaea",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarLabel: "History",
          tabBarIcon: ({ color, focused }) => {
            return (
              <AntDesign name={focused ? "clockcircle" : "clockcircleo"} size={24} color={color} />
            );
          },
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: "Players",
          tabBarLabel: "Players",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <FontAwesome6 name="users-line" size={24} color={color} />
            ) : (
              <FontAwesome6 name="users" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name={focused ? "user-circle" : "user-circle-o"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
