import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { useDatabase } from "../../../context/DatabaseContext";
import { router, Stack } from "expo-router";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cleanJson } from "../../../util/util";
import { Ionicons } from "@expo/vector-icons";

const genAI = new GoogleGenerativeAI("");
type Task = {
  id: number;
  gig_id: number;
  description: string;
  status: string;
  cost: number;
};
export default function NewGigScreen() {
  const { colors } = useTheme();
  const { createGig, createTask } = useDatabase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "school_project",
    timeline: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [taskBreakdown, setTaskBreakdown] = useState<any>(null);
  const [reviewMode, setReviewMode] = useState(false);

  const generateTasks = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
      const prompt = `Generate a detailed project breakdown for a ${
        formData.type === "school_project"
          ? "School Project"
          : "Business Project"
      } named "${formData.name}". Description: ${
        formData.description
      }. Timeline: ${formData.timeline}.

      Please provide:
      1. A list of specific tasks needed to complete the project
      2. Estimated time for each task
      3. A suggested price range (${
        formData.type === "school_project" ? "GH₵1500-2500" : "GH₵4000 or more"
      })

      Format the response only as raw JSON with the following structure:
      {
        "tasks": [
          {
            "description": "task description",
            "estimatedHours": number,
            "cost": number
          }
        ],
        "totalPrice": number
      }`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      console.log(text);
      return cleanJson(text);
    } catch (error) {
      console.error("Error generating tasks:", error);
      throw error;
    }
  };

  const handleGenerateTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.name || !formData.description || !formData.timeline) {
        setError("Please fill in all required fields");
        return;
      }

      const breakdown = await generateTasks();
      setTaskBreakdown(breakdown);
      setReviewMode(true);
    } catch (error) {
      setError("An error occurred while generating the task breakdown");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!taskBreakdown) {
        setError("Task breakdown is missing");
        return;
      }

      const gigId = await createGig({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: "on_track",
        timeline: formData.timeline,
        repository: null,
        estimated_price: taskBreakdown.totalPrice,
      });

      // Create tasks
      for (const task of taskBreakdown.tasks) {
        await createTask({
          gig_id: gigId,
          description: task.description,
          status: "pending",
          cost: task.cost,
        });
      }

      router.replace("/gigs");
    } catch (error) {
      setError("An error occurred while creating the gig");
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View
      style={[styles.headerContainer, { borderBottomColor: colors.border }]}
    >
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={20}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </Pressable>
      <Text style={[styles.title, { color: colors.text }]}>
        {reviewMode ? "Review Task Breakdown" : "New Gig"}
      </Text>
    </View>
  );

  const renderFormInputs = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Project Name</Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              color: colors.text,
            },
          ]}
          placeholder="Enter project name"
          placeholderTextColor={colors.text + "80"}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              color: colors.text,
            },
          ]}
          placeholder="Enter project description"
          placeholderTextColor={colors.text + "80"}
          multiline
          value={formData.description}
          onChangeText={(text) =>
            setFormData({ ...formData, description: text })
          }
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Project Type</Text>
        <View style={styles.typeSelector}>
          <Pressable
            style={[
              styles.typeButton,
              {
                backgroundColor:
                  formData.type === "school_project"
                    ? colors.primary
                    : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setFormData({ ...formData, type: "school_project" })}
          >
            <Text
              style={[
                styles.typeButtonText,
                {
                  color:
                    formData.type === "school_project"
                      ? "#ffffff"
                      : colors.text,
                },
              ]}
            >
              School Project
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.typeButton,
              {
                backgroundColor:
                  formData.type === "business_project"
                    ? colors.primary
                    : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() =>
              setFormData({ ...formData, type: "business_project" })
            }
          >
            <Text
              style={[
                styles.typeButtonText,
                {
                  color:
                    formData.type === "business_project"
                      ? "#ffffff"
                      : colors.text,
                },
              ]}
            >
              Business Project
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Timeline</Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              color: colors.text,
            },
          ]}
          placeholder="Enter project timeline"
          placeholderTextColor={colors.text + "80"}
          value={formData.timeline}
          onChangeText={(text) => setFormData({ ...formData, timeline: text })}
        />
      </View>
    </>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <ScrollView style={styles.container}>
        {renderHeader()}

        <View style={styles.content}>
          {error && (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: colors.error + "20" },
              ]}
            >
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
            </View>
          )}

          {reviewMode && taskBreakdown ? (
            <View style={styles.reviewContainer}>
              {taskBreakdown.tasks.map((task: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.taskItem,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.taskTitle, { color: colors.text }]}>
                    Task {index + 1}
                  </Text>
                  <Text
                    style={[styles.taskDescription, { color: colors.text }]}
                  >
                    {task.description}
                  </Text>
                  <View style={styles.taskDetails}>
                    <Text style={[styles.taskInfo, { color: colors.text }]}>
                      Est. Hours: {task.estimatedHours}
                    </Text>
                    <Text
                      style={[styles.taskInfo, { color: colors.secondary }]}
                    >
                      Cost: GH₵{task.cost}
                    </Text>
                  </View>
                </View>
              ))}
              <Text style={[styles.totalPrice, { color: colors.secondary }]}>
                Total Price: GH₵{taskBreakdown.totalPrice}
              </Text>

              <View style={styles.buttonGroup}>
                <Pressable
                  style={[
                    styles.button,
                    styles.confirmButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Confirm & Save</Text>
                  )}
                </Pressable>
                <Pressable
                  style={[
                    styles.button,
                    styles.editButton,
                    {
                      borderColor: colors.primary,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  onPress={() => setReviewMode(false)}
                >
                  <Text
                    style={[styles.editButtonText, { color: colors.primary }]}
                  >
                    Edit Details
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              {renderFormInputs()}
              <Pressable
                style={[
                  styles.button,
                  styles.generateButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: loading ? 0.7 : 1,
                  },
                ]}
                onPress={handleGenerateTasks}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Generate Tasks</Text>
                )}
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  errorContainer: {
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  typeSelector: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  reviewContainer: {
    gap: 16,
  },
  taskItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  taskDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskInfo: {
    fontSize: 14,
    fontWeight: "500",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
    marginVertical: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  generateButton: {
    marginTop: 20,
  },
  confirmButton: {
    flex: 2,
  },
  editButton: {
    borderWidth: 1,
    flex: 1,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
