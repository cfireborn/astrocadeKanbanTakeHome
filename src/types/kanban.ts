
export type TaskStatus = string;

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  assignee?: string;
  tags?: string[];
  createdAt: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface Board {
  columns: Column[];
}

export interface TaskFilter {
  priority?: ("low" | "medium" | "high")[];
  assignee?: string[];
  dueAfter?: string;
  dueBefore?: string;
  tags?: string[];
  searchText?: string;
}
