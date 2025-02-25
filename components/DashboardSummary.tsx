import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useDatabase } from "../context/DatabaseContext";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";

type DashboardStats = {
  totalActive: number;
  onTrack: number;
  behind: number;
  loading: boolean;
  error: string | null;
};

export default function DashboardSummary() {
  const { colors } = useTheme();
  const { getGigs } = useDatabase();
  const [stats, setStats] = useState<DashboardStats>({
    totalActive: 0,
    onTrack: 0,
    behind: 0,
    loading: true,
    error: null,
  });

  // Initial load on component mount
  useEffect(() => {
    loadDashboardStats();
  }, []);

  // Reload data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadDashboardStats();
      return () => {
        // Optional cleanup function
      };
    }, [])
  );

  const loadDashboardStats = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }));

      const gigs = await getGigs();
      const activeGigs = gigs.filter((gig) => gig.status !== "completed");

      const stats = {
        totalActive: activeGigs.length,
        onTrack: activeGigs.filter((gig) => gig.status === "on_track").length,
        behind: activeGigs.filter((gig) => gig.status !== "on_track").length,
        loading: false,
        error: null,
      };

      setStats(stats);
    } catch (error) {
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load dashboard stats",
      }));
      console.error("Error loading dashboard stats:", error);
    }
  };

  if (stats.loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <ActivityIndicator color="white" size="large" />
        </LinearGradient>
      </View>
    );
  }

  if (stats.error) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.error, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Error Loading Stats</Text>
          <Text style={[styles.cardValue, { fontSize: 16 }]}>
            Please try again later
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.cardTitle}>Active Projects</Text>
        <Text style={styles.cardValue}>{stats.totalActive}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>On Track</Text>
            <Text style={styles.statValue}>{stats.onTrack}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Behind</Text>
            <Text style={styles.statValue}>{stats.behind}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minHeight: 180,
    justifyContent: "center",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  cardValue: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
    marginVertical: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  stat: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  statLabel: {
    color: "#fff",
    fontSize: 14,
  },
  statValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});
