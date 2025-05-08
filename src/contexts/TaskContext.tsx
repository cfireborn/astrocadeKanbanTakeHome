
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Task, TaskStatus, Column, Board, TaskFilter } from "../types/kanban";
import { toast } from "sonner";
import { fetchTasks, defaultColumns } from "../services/mockApi";
import { handleError, logEvent, trackUserAction } from "../utils/errorHandler";

interface TaskContextType {
  board: Board;
  score: number;
  loading: boolean;
  filter: TaskFilter;
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (task: Task) => void;
  moveTask: (taskId: string, sourceStatus: TaskStatus, targetStatus: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  setFilter: (filter: TaskFilter) => void;
  refreshTasks: (count?: number) => Promise<void>;
  configureColumns: (columns: {id: string, title: string}[]) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [board, setBoard] = useState<Board>({ columns: [] });
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<TaskFilter>({});
  const [columns, setColumns] = useState(defaultColumns);

  // Load initial tasks
  useEffect(() => {
    refreshTasks();
    logEvent("info", "Application initialized");
  }, []);

  // Apply filters whenever the filter changes
  useEffect(() => {
    applyFilters();
  }, [filter]);

  const refreshTasks = async (count?: number) => {
    setLoading(true);
    try {
      logEvent("info", "Refreshing tasks", { count });
      const fetchedColumns = await fetchTasks(count || 20, columns);
      setBoard({ columns: fetchedColumns });
    } catch (error) {
      handleError(error, "Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const configureColumns = (newColumns: {id: string, title: string}[]) => {
    logEvent("info", "Configuring columns", { columns: newColumns });
    setColumns(newColumns);
    refreshTasks();
  };

  const applyFilters = () => {
    if (!Object.keys(filter).length) return;

    setBoard(prevBoard => {
      const filteredColumns = prevBoard.columns.map(column => ({
        ...column,
        tasks: column.tasks.filter(task => {
          // Check priority
          if (filter.priority?.length && !filter.priority.includes(task.priority)) {
            return false;
          }

          // Check assignee
          if (filter.assignee?.length && 
             (!task.assignee || !filter.assignee.includes(task.assignee))) {
            return false;
          }

          // Check due date after
          if (filter.dueAfter && task.dueDate && task.dueDate < filter.dueAfter) {
            return false;
          }

          // Check due date before
          if (filter.dueBefore && task.dueDate && task.dueDate > filter.dueBefore) {
            return false;
          }

          // Check tags
          if (filter.tags?.length && 
             (!task.tags || !task.tags.some(tag => filter.tags!.includes(tag)))) {
            return false;
          }

          // Check search text
          if (filter.searchText) {
            const searchText = filter.searchText.toLowerCase();
            const titleMatch = task.title.toLowerCase().includes(searchText);
            const descMatch = task.description.toLowerCase().includes(searchText);
            const assigneeMatch = task.assignee ? 
              task.assignee.toLowerCase().includes(searchText) : false;
            
            if (!titleMatch && !descMatch && !assigneeMatch) {
              return false;
            }
          }

          return true;
        })
      }));

      return { columns: filteredColumns };
    });
  };

  const addTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    try {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      setBoard(prevBoard => {
        return {
          ...prevBoard,
          columns: prevBoard.columns.map(column => {
            if (column.id === newTask.status) {
              return {
                ...column,
                tasks: [...column.tasks, newTask]
              };
            }
            return column;
          })
        };
      });

      // Add a point for creating a task
      setScore(prevScore => prevScore + 1);
      toast.success("Task created! +1 point");
      trackUserAction("task_created", { taskId: newTask.id, status: newTask.status });
    } catch (error) {
      handleError(error, "Failed to create task");
    }
  };

  const updateTask = (updatedTask: Task) => {
    try {
      setBoard(prevBoard => {
        const sourceColumn = prevBoard.columns.find(col => 
          col.tasks.some(task => task.id === updatedTask.id)
        );
        
        // If task status hasn't changed, just update the task
        if (sourceColumn?.id === updatedTask.status) {
          return {
            ...prevBoard,
            columns: prevBoard.columns.map(column => {
              return {
                ...column,
                tasks: column.tasks.map(task => 
                  task.id === updatedTask.id ? updatedTask : task
                )
              };
            })
          };
        } else {
          // Task status has changed, move it to the new column
          return {
            ...prevBoard,
            columns: prevBoard.columns.map(column => {
              // Remove from source column
              if (column.id === sourceColumn?.id) {
                return {
                  ...column,
                  tasks: column.tasks.filter(task => task.id !== updatedTask.id)
                };
              }
              // Add to target column
              if (column.id === updatedTask.status) {
                return {
                  ...column,
                  tasks: [...column.tasks, updatedTask]
                };
              }
              return column;
            })
          };
        }
      });

      toast.success("Task updated successfully!");
      trackUserAction("task_updated", { taskId: updatedTask.id, status: updatedTask.status });
    } catch (error) {
      handleError(error, "Failed to update task");
    }
  };

  const moveTask = (taskId: string, sourceStatus: TaskStatus, targetStatus: TaskStatus) => {
    try {
      const sourceColumn = board.columns.find(col => col.id === sourceStatus);
      const taskToMove = sourceColumn?.tasks.find(task => task.id === taskId);
      
      if (!taskToMove) {
        logEvent("warning", "Task not found during move operation", { taskId, sourceStatus });
        return;
      }
      
      const updatedTask = { ...taskToMove, status: targetStatus };
      
      setBoard(prevBoard => {
        return {
          ...prevBoard,
          columns: prevBoard.columns.map(column => {
            // Remove from source column
            if (column.id === sourceStatus) {
              return {
                ...column,
                tasks: column.tasks.filter(task => task.id !== taskId)
              };
            }
            // Add to target column
            if (column.id === targetStatus) {
              return {
                ...column,
                tasks: [...column.tasks, updatedTask]
              };
            }
            return column;
          })
        };
      });

      // Calculate column progression
      const sourceIndex = board.columns.findIndex(col => col.id === sourceStatus);
      const targetIndex = board.columns.findIndex(col => col.id === targetStatus);
      
      // Add points for moving tasks forward
      if (targetIndex > sourceIndex) {
        setScore(prevScore => prevScore + 1);
        toast.success("Task progressed! +1 point");
      }
      
      trackUserAction("task_moved", { 
        taskId, 
        fromStatus: sourceStatus, 
        toStatus: targetStatus 
      });
    } catch (error) {
      handleError(error, "Failed to move task");
    }
  };

  const deleteTask = (taskId: string) => {
    try {
      setBoard(prevBoard => {
        return {
          ...prevBoard,
          columns: prevBoard.columns.map(column => {
            return {
              ...column,
              tasks: column.tasks.filter(task => task.id !== taskId)
            };
          })
        };
      });
      
      toast.success("Task deleted successfully!");
      trackUserAction("task_deleted", { taskId });
    } catch (error) {
      handleError(error, "Failed to delete task");
    }
  };

  return (
    <TaskContext.Provider value={{ 
      board, 
      score, 
      loading, 
      filter,
      addTask, 
      updateTask, 
      moveTask, 
      deleteTask,
      setFilter,
      refreshTasks,
      configureColumns
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};
