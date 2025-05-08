
import React from "react";
import { MoveHorizontal, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useTaskContext } from "../contexts/TaskContext";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { TaskStatus } from "../types/kanban";
import ScoreDisplay from "./ScoreDisplay";
import TaskFilter from "./TaskFilter";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { addTask, board } = useTaskContext();
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [newTaskDescription, setNewTaskDescription] = React.useState("");
  const [newTaskStatus, setNewTaskStatus] = React.useState<TaskStatus>("todo");
  const [newTaskPriority, setNewTaskPriority] = React.useState<"low" | "medium" | "high">("medium");
  const [open, setOpen] = React.useState(false);

  const handleAddTask = () => {
    if (newTaskTitle.trim() !== "") {
      addTask({
        title: newTaskTitle,
        description: newTaskDescription,
        status: newTaskStatus,
        priority: newTaskPriority
      });
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskStatus("todo");
      setNewTaskPriority("medium");
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <MoveHorizontal className="h-6 w-6 text-kanban-purple mr-2" />
            <h1 className="text-xl font-bold text-gray-800">FlowState</h1>
          </div>
          <div className="flex items-center gap-4">
            <ScoreDisplay />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-kanban-purple hover:bg-kanban-purple-dark">
                  <Plus className="h-4 w-4 mr-1" /> New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>Add a new task to your board.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Enter task title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Enter task description"
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select 
                        value={newTaskStatus} 
                        onValueChange={(value) => setNewTaskStatus(value as TaskStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {board.columns.map(column => (
                            <SelectItem key={column.id} value={column.id}>
                              {column.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Select 
                        value={newTaskPriority} 
                        onValueChange={(value) => setNewTaskPriority(value as "low" | "medium" | "high")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddTask} className="bg-kanban-purple hover:bg-kanban-purple-dark">
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="container mx-auto px-4 pb-2">
          <TaskFilter />
        </div>
      </header>
      <main className="flex-1 container mx-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
