
import { Column, Task, TaskStatus } from "../types/kanban";

// Generate a random date between now and numDays in the future
const randomFutureDate = (numDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * numDays));
  return date.toISOString().split('T')[0];
};

// Generate a random task
const generateRandomTask = (id: number, status: TaskStatus): Task => {
  const priorities = ["low", "medium", "high"] as const;
  const assignees = ["John Doe", "Jane Smith", "Alex Johnson", "Sam Wilson", ""];
  const tagOptions = ["UI", "Backend", "Documentation", "Bug", "Feature", "Enhancement"];
  
  // Generate 0-3 random tags
  const numTags = Math.floor(Math.random() * 4);
  const tags: string[] = [];
  for (let i = 0; i < numTags; i++) {
    const randomTag = tagOptions[Math.floor(Math.random() * tagOptions.length)];
    if (!tags.includes(randomTag)) {
      tags.push(randomTag);
    }
  }

  return {
    id: id.toString(),
    title: `Task ${id}`,
    description: `This is a description for task ${id}. It provides details about what needs to be done.`,
    status,
    priority: priorities[Math.floor(Math.random() * 3)],
    dueDate: Math.random() > 0.3 ? randomFutureDate(14) : undefined,
    assignee: Math.random() > 0.2 ? assignees[Math.floor(Math.random() * assignees.length)] : undefined,
    tags: tags.length > 0 ? tags : undefined,
    createdAt: new Date().toISOString(),
  };
};

// Default column configurations
export const defaultColumns = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" }
];

export const fetchTasks = async (
  numTasks = 20, 
  columnDefinitions = defaultColumns,
  simulatedDelay = 800
): Promise<Column[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, simulatedDelay));
  
  // Initialize columns with the provided definitions
  const columns: Column[] = columnDefinitions.map(col => ({
    id: col.id,
    title: col.title,
    tasks: [],
  }));
  
  // Generate random tasks and distribute them across columns
  for (let i = 1; i <= numTasks; i++) {
    const columnIndex = Math.floor(Math.random() * columns.length);
    const status = columns[columnIndex].id;
    const task = generateRandomTask(i, status);
    columns[columnIndex].tasks.push(task);
  }
  
  return columns;
};

export const searchTasks = async (
  query: string, 
  columns: Column[]
): Promise<Column[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!query.trim()) return columns;
  
  const lowercaseQuery = query.toLowerCase();
  
  // Filter tasks in each column based on the search query
  return columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => 
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description.toLowerCase().includes(lowercaseQuery) ||
      (task.assignee && task.assignee.toLowerCase().includes(lowercaseQuery)) ||
      (task.tags && task.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
    )
  }));
};
