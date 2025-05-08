
import React, { useState } from "react";
import { Column, TaskStatus, Task } from "../types/kanban";
import TaskCard from "./TaskCard";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { useTaskContext } from "../contexts/TaskContext";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";

interface KanbanColumnProps {
  column: Column;
  onDragStart: (e: React.DragEvent, taskId: string, status: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: TaskStatus) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  column, 
  onDragStart, 
  onDragOver, 
  onDrop 
}) => {
  const { addTask } = useTaskContext();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleAddTag = () => {
    if (tagsInput.trim() !== "" && !tags.includes(tagsInput.trim())) {
      setTags([...tags, tagsInput.trim()]);
      setTagsInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim() !== "") {
      const taskData: Omit<Task, "id" | "createdAt"> = {
        title: newTaskTitle,
        description: newTaskDescription,
        status: column.id,
        priority,
        assignee: assignee || undefined,
        dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
        tags: tags.length > 0 ? [...tags] : undefined
      };

      addTask(taskData);
      
      // Reset form
      setNewTaskTitle("");
      setNewTaskDescription("");
      setPriority("medium");
      setAssignee("");
      setDueDate(undefined);
      setTags([]);
      setOpen(false);
    }
  };

  const getColumnHeaderColor = (status: TaskStatus) => {
    switch(status) {
      case "todo": return "bg-blue-100 text-blue-800";
      case "inprogress": return "bg-yellow-100 text-yellow-800";
      case "review": return "bg-purple-100 text-purple-800";
      case "done": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      className="column-container bg-gray-50 rounded-lg p-3 min-w-[280px] w-[280px] h-fit max-h-[calc(100vh-120px)] overflow-y-auto"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id)}
      data-column-id={column.id}
    >
      <div className={`flex items-center justify-between mb-3 p-2 rounded-md ${getColumnHeaderColor(column.id)}`}>
        <h2 className="font-bold">{column.title}</h2>
        <span className="bg-white rounded-full px-2 py-0.5 text-xs font-bold">
          {column.tasks.length}
        </span>
      </div>

      <div className="space-y-5 min-h-[100px]"> {/* Increased spacing between cards from 3 to 5 */}
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDragStart={onDragStart} />
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4 flex items-center justify-center text-gray-600 border-dashed"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Task
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task in the {column.title} column.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Enter task description"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={priority} 
                  onValueChange={(value) => setPriority(value as "low" | "medium" | "high")}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Assign to someone"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Add tag"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button type="button" onClick={handleAddTag}>Add</Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button 
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddTask}>Add Task</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanColumn;
