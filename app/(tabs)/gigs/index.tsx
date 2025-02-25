import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { useDatabase } from "../../../context/DatabaseContext";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";

type Gig = {
  id: number;
  name: string;
  type: string;
  status: string;
  estimated_price: number;
};

export default function GigsScreen() {
  const { colors, isDark } = useTheme();
  const { getGigs, deleteGig } = useDatabase();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [filteredGigs, setFilteredGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<{ type?: string; status?: string }>({});

  const rowRefs = useRef<Map<number, Swipeable | null>>(new Map());

  const loadGigs = async () => {
    setLoading(true);
    try {
      const loadedGigs = await getGigs();
      setGigs(loadedGigs);
      setFilteredGigs(loadedGigs);
    } catch (error) {
      console.error("Error loading gigs:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGigs();
    setRefreshing(false);
  };

  useEffect(() => {
    loadGigs();
  }, []);

  useEffect(() => {
    let result = gigs;

    if (filter.type) {
      result = result.filter((gig) => gig.type === filter.type);
    }

    if (filter.status) {
      result = result.filter((gig) => gig.status === filter.status);
    }

    setFilteredGigs(result);
  }, [filter, gigs]);

  const clearFilters = () => setFilter({});

  const deleteGigHandler = (id: number) => {
    rowRefs.current.forEach((ref, key) => {
      if (key !== id && ref) ref.close();
    });

    Alert.alert("Delete Gig", "Are you sure you want to delete this gig?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {
          const row = rowRefs.current.get(id);
          if (row) row.close();
        },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            console.log(" deleting gig:");
            await deleteGig(id);
            loadGigs();
          } catch (error) {
            console.error("Error deleting gig:", error);
            Alert.alert("Error", "Failed to delete the gig");
          }
        },
      },
    ]);
  };

  // Render right actions for swipeable
  const renderRightActions = (id: number) => {
    return (
      <TouchableOpacity
        style={[styles.deleteAction, { backgroundColor: colors.error }]}
        onPress={() => deleteGigHandler(id)}
      >
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
    );
  };

  const GigCard = ({ gig }: { gig: Gig }) => (
    <Swipeable
      ref={(ref) => {
        if (ref) rowRefs.current.set(gig.id, ref);
        else rowRefs.current.delete(gig.id);
      }}
      renderRightActions={() => renderRightActions(gig.id)}
      overshootRight={false}
      onSwipeableOpen={() => {
        rowRefs.current.forEach((ref, key) => {
          if (key !== gig.id && ref) ref.close();
        });
      }}
    >
      <Link href={`/gigs/${gig.id}`} asChild>
        <TouchableOpacity
          style={[styles.gigCard, { backgroundColor: colors.background }]}
        >
          <View style={styles.gigHeader}>
            <Text style={[styles.gigTitle, { color: colors.text }]}>
              {gig.name}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    gig.status === "on_track"
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
                      gig.status === "on_track"
                        ? colors.success
                        : colors.warning,
                  },
                ]}
              >
                {gig.status === "on_track" ? "On Track" : "Behind"}
              </Text>
            </View>
          </View>
          <Text style={[styles.gigType, { color: colors.text + "80" }]}>
            {gig.type}
          </Text>
          <Text style={[styles.price, { color: colors.primary }]}>
            GH₵{gig.estimated_price.toLocaleString()}
          </Text>
        </TouchableOpacity>
      </Link>
    </Swipeable>
  );

  const renderGig = ({ item }: { item: Gig }) => <GigCard gig={item} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Gigs</Text>
        <Link href="/gigs/new" asChild>
          <Pressable
            style={[
              styles.addButton,
              {
                backgroundColor: colors.primary,
                shadowColor: isDark ? colors.text : "#000",
              },
            ]}
          >
            <View style={styles.addButtonContent}>
              <Ionicons name="add" size={20} color={"white"} />
              <Text style={styles.addButtonText}>New Gig</Text>
            </View>
          </Pressable>
        </Link>
      </View>

      {/* Filter Options */}
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.surface }]}
            onPress={clearFilters}
          >
            <Text style={[styles.filterText, { color: colors.text }]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.surface }]}
            onPress={() => setFilter({ type: "design" })}
          >
            <Text style={[styles.filterText, { color: colors.text }]}>
              Design
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.surface }]}
            onPress={() => setFilter({ type: "development" })}
          >
            <Text style={[styles.filterText, { color: colors.text }]}>
              Development
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.surface }]}
            onPress={() => setFilter({ status: "on_track" })}
          >
            <Text style={[styles.filterText, { color: colors.success }]}>
              On Track
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.surface }]}
            onPress={() => setFilter({ status: "behind" })}
          >
            <Text style={[styles.filterText, { color: colors.warning }]}>
              Behind
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Gig List */}
      <FlatList
        data={filteredGigs}
        renderItem={renderGig}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.gigList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    padding: 10,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  addButton: {
    borderRadius: 12,
    padding: 8,
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  filters: {
    paddingHorizontal: 4,
    marginTop: 20,
    paddingBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  gigList: {
    paddingVertical: 15,
    marginTop: 5,
  },
  gigCard: {
    paddingHorizontal: 15,
    marginBottom: 10,
    borderBottomWidth: 0.3,
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
    marginTop: 15,
  },
  gigTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
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
  price: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 0,
    marginBottom: 25,
  },
  deleteAction: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
});
