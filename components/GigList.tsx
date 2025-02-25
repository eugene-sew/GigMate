import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useDatabase } from "../context/DatabaseContext";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter, useFocusEffect } from "expo-router";

type Gig = {
  id: number;
  name: string;
  type: string;
  status: string;
  estimated_price: number;
  progress: number;
  last_commit: string;
  created_at: string;
};

type Task = {
  id: number;
  gig_id: number;
  description: string;
  status: string;
  cost: number;
};

export default function GigList() {
  const { colors, isDark } = useTheme();
  const { getGigs, getTasks } = useDatabase();
  const router = useRouter();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateProgress = (tasks: Task[]): number => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(
      (task) => task.status === "completed"
    ).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const loadGigs = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setLoading(true);
      }
      setError(null);

      const allGigs = await getGigs();

      // Get all tasks for each gig and calculate progress
      const gigsWithProgress = await Promise.all(
        allGigs
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 5)
          .map(async (gig) => {
            const gigTasks = await getTasks(gig.id);
            return {
              ...gig,
              progress: calculateProgress(gigTasks),
              last_commit: getRandomTimeAgo(), // This could be fetched from repository in a real app
            };
          })
      );

      setGigs(gigsWithProgress);
    } catch (error) {
      console.error("Error loading gigs:", error);
      setError("Failed to load recent gigs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadGigs(false);
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGigs(false);
  }, []);

  const getRandomTimeAgo = () => {
    const times = ["2h ago", "4h ago", "1d ago", "2d ago", "just now"];
    return times[Math.floor(Math.random() * times.length)];
  };

  const renderGigCard = ({ item }: { item: Gig }) => (
    <Link key={item.id} href={`/gigs/${item.id}`} asChild>
      <Pressable
        style={[
          styles.gigCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: isDark ? colors.text : "#000",
          },
        ]}
      >
        <View style={styles.gigHeader}>
          <Text style={[styles.gigTitle, { color: colors.text }]}>
            {item.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "on_track"
                    ? colors.success + "20"
                    : colors.warning + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    item.status === "on_track"
                      ? colors.success
                      : colors.warning,
                },
              ]}
            >
              {item.status === "on_track" ? "On Track" : "Behind"}
            </Text>
          </View>
        </View>
        <Text style={[styles.gigType, { color: colors.text + "80" }]}>
          {item.type}
        </Text>
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressBar, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor:
                    item.status === "on_track"
                      ? colors.success
                      : colors.warning,
                  width: `${item.progress}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {item.progress}%
          </Text>
        </View>
        <View style={styles.footer}>
          <View style={styles.commitInfo}>
            <Ionicons
              name="git-branch-outline"
              size={16}
              color={colors.text + "80"}
            />
            <Text style={[styles.commitText, { color: colors.text + "80" }]}>
              Last commit: {item.last_commit}
            </Text>
          </View>
          <Text style={[styles.price, { color: colors.primary }]}>
            GH₵{item.estimated_price.toLocaleString()}
          </Text>
        </View>
      </Pressable>
    </Link>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Gigs
        </Text>
        <View
          style={[styles.loadingContainer, { backgroundColor: colors.surface }]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={gigs}
        renderItem={renderGigCard}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Gigs
          </Text>
        }
        ListEmptyComponent={
          error ? (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
              <Pressable
                style={[
                  styles.retryButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => loadGigs()}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No gigs found
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  gigCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  gigHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  gigTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  gigType: {
    fontSize: 14,
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  commitInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  commitText: {
    marginLeft: 5,
    fontSize: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
  },
});
