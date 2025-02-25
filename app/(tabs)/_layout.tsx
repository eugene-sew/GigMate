import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <StatusBar
          style={isDark ? "light" : "dark"}
          backgroundColor={colors.background}
          translucent={true}
        />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              elevation: 0,
              shadowOpacity: 0,
              height: 60,
              paddingBottom: 10,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.text + "80",
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "500",
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Dashboard",
              tabBarIcon: ({ size, color }) => (
                <Ionicons name="grid-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="gigs/index"
            options={{
              title: "My Gigs",
              tabBarIcon: ({ size, color }) => (
                <Ionicons name="briefcase-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="gigs/new"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="gigs/[id]"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="settings/index"
            options={{
              title: "Settings",
              tabBarIcon: ({ size, color }) => (
                <Ionicons name="settings-outline" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
