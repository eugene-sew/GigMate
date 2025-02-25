import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useDatabase } from '../../../context/DatabaseContext';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Task = {
  id: number;
  description: string;
  status: string;
  cost: number;
};

type Gig = {
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
  timeline: string;
  repository: string | null;
  estimated_price: number;
};

export default function GigDetailsScreen() {
  const { colors } = useTheme();
  const { getGig, getTasks, updateTaskStatus } = useDatabase();
  const { id } = useLocalSearchParams();
  const [gig, setGig] = useState<Gig | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadGigDetails();
  }, [id]);

  const loadGigDetails = async () => {
    const gigData = await getGig(Number(id));
    if (gigData) {
      setGig(gigData);
      const taskData = await getTasks(Number(id));
      setTasks(taskData);
    }
  };

  const toggleTaskStatus = async (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await updateTaskStatus(taskId, newStatus);
    loadGigDetails();
  };

  if (!gig) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{gig.name}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                gig.status === 'on_track'
                  ? colors.success + '20'
                  : colors.warning + '20',
            },
          ]}>
          <Text
            style={[
              styles.statusText,
              {
                color:
                  gig.status === 'on_track' ? colors.success : colors.warning,
              },
            ]}>
            {gig.status === 'on_track' ? 'On Track' : 'Behind'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Description
        </Text>
        <Text style={[styles.description, { color: colors.text }]}>
          {gig.description}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Progress
        </Text>
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.success, width: `${progress}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tasks</Text>
        {tasks.map(task => (
          <Pressable
            key={task.id}
            style={[styles.taskCard, { backgroundColor: colors.surface }]}
            onPress={() => toggleTaskStatus(task.id, task.status)}>
            <View style={styles.taskHeader}>
              <View style={styles.taskTitleContainer}>
                <Ionicons
                  name={
                    task.status === 'completed'
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={24}
                  color={
                    task.status === 'completed'
                      ? colors.success
                      : colors.text + '80'
                  }
                />
                <Text
                  style={[
                    styles.taskTitle,
                    {
                      color: colors.text,
                      textDecorationLine:
                        task.status === 'completed' ? 'line-through' : 'none',
                    },
                  ]}>
                  {task.description}
                </Text>
              </View>
              <Text style={[styles.taskCost, { color: colors.primary }]}>
                GH₵{task.cost}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {gig.repository && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Repository
          </Text>
          <Pressable
            style={[styles.repoButton, { backgroundColor: colors.primary }]}
            onPress={() => Linking.openURL(gig.repository!)}>
            <Ionicons name="logo-github" size={24} color="white" />
            <Text style={styles.repoButtonText}>View Repository</Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.section, styles.priceSection]}>
        <Text style={[styles.totalPrice, { color: colors.text }]}>
          Total Price
        </Text>
        <Text style={[styles.priceValue, { color: colors.primary }]}>
          GH₵{gig.estimated_price.toLocaleString()}
        </Text>
      </View>
    </ScrollView>
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
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
  },
  taskCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    flex: 1,
  },
  taskCost: {
    fontSize: 16,
    fontWeight: '600',
  },
  repoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  repoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});