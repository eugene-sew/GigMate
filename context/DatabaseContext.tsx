import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Task = {
  id: number;
  gig_id: number;
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
  created_at: string;
};

type DatabaseContextType = {
  getGigs: () => Promise<Gig[]>;
  getGig: (id: number) => Promise<Gig | null>;
  createGig: (gig: Omit<Gig, "id" | "created_at">) => Promise<number>;
  getTasks: (gigId: number) => Promise<Task[]>;
  createTask: (task: Omit<Task, "id">) => Promise<number>;
  updateTaskStatus: (taskId: number, status: string) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  deleteGig: (id: number) => Promise<void>;
};

const DatabaseContext = createContext<DatabaseContextType>({
  getGigs: async () => [],
  getGig: async () => null,
  createGig: async () => 0,
  getTasks: async () => [],
  createTask: async () => 0,
  updateTaskStatus: async () => {},
  deleteTask: async () => {},
  deleteGig: async () => {},
});

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      const gigs = await AsyncStorage.getItem("gigs");
      const tasks = await AsyncStorage.getItem("tasks");

      if (!gigs) {
        await AsyncStorage.setItem("gigs", JSON.stringify([]));
      }
      if (!tasks) {
        await AsyncStorage.setItem("tasks", JSON.stringify([]));
      }

      setInitialized(true);
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  };

  const getGigs = async (): Promise<Gig[]> => {
    try {
      const gigs = await AsyncStorage.getItem("gigs");
      return gigs ? JSON.parse(gigs) : [];
    } catch (error) {
      console.error("Error getting gigs:", error);
      return [];
    }
  };

  const getGig = async (id: number): Promise<Gig | null> => {
    try {
      const gigs = await getGigs();
      return gigs.find((gig) => gig.id === id) || null;
    } catch (error) {
      console.error("Error getting gig:", error);
      return null;
    }
  };

  const createGig = async (
    gig: Omit<Gig, "id" | "created_at">
  ): Promise<number> => {
    try {
      const gigs = await getGigs();
      const newId =
        gigs.length > 0 ? Math.max(...gigs.map((g) => g.id)) + 1 : 1;
      const newGig: Gig = {
        ...gig,
        id: newId,
        created_at: new Date().toISOString(),
      };
      await AsyncStorage.setItem("gigs", JSON.stringify([...gigs, newGig]));
      return newId;
    } catch (error) {
      console.error("Error creating gig:", error);
      return 0;
    }
  };

  const getTasks = async (gigId: number): Promise<Task[]> => {
    try {
      const tasks = await AsyncStorage.getItem("tasks");
      const allTasks: Task[] = tasks ? JSON.parse(tasks) : [];
      return allTasks.filter((task) => task.gig_id === gigId);
    } catch (error) {
      console.error("Error getting tasks:", error);
      return [];
    }
  };

  const createTask = async (task: Omit<Task, "id">): Promise<number> => {
    try {
      const tasks = await AsyncStorage.getItem("tasks");
      const allTasks: Task[] = tasks ? JSON.parse(tasks) : [];
      const newId =
        allTasks.length > 0 ? Math.max(...allTasks.map((t) => t.id)) + 1 : 1;
      const newTask: Task = { ...task, id: newId };
      await AsyncStorage.setItem(
        "tasks",
        JSON.stringify([...allTasks, newTask])
      );
      return newId;
    } catch (error) {
      console.error("Error creating task:", error);
      return 0;
    }
  };

  const updateTaskStatus = async (
    taskId: number,
    status: string
  ): Promise<void> => {
    try {
      const tasks = await AsyncStorage.getItem("tasks");
      const allTasks: Task[] = tasks ? JSON.parse(tasks) : [];
      const updatedTasks = allTasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      );
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const deleteGig = async (id: number): Promise<void> => {
    try {
      const gigs = await getGigs();
      const updatedGigs = gigs.filter((gig) => gig.id !== id);
      await AsyncStorage.setItem("gigs", JSON.stringify(updatedGigs));
    } catch (error) {
      console.error("Error deleting gig:", error);
    }
  };

  const deleteTask = async (id: number): Promise<void> => {
    try {
      const tasks = await AsyncStorage.getItem("tasks");
      const allTasks: Task[] = tasks ? JSON.parse(tasks) : [];
      const updatedTasks = allTasks.filter((task) => task.id !== id);
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  if (!initialized) {
    return null;
  }

  return (
    <DatabaseContext.Provider
      value={{
        getGigs,
        getGig,
        createGig,
        getTasks,
        createTask,
        updateTaskStatus,
        deleteTask,
        deleteGig,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
