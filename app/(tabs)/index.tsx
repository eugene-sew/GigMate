import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import DashboardSummary from "../../components/DashboardSummary";
import GigList from "../../components/GigList";

export default function Dashboard() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>GigMate</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Your Freelance Project Manager
        </Text>
      </View>
      <DashboardSummary />
      <GigList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 5,
  },
});
