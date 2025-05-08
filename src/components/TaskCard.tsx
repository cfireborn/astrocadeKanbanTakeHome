import React, { useState, useRef, useEffect } from "react";
import { Task } from "../types/kanban";
import { useTaskContext } from "../contexts/TaskContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Calendar, Clock, Tag, User, GripVertical } from "lucide-react";
import { Badge } from "./ui/badge";

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string, status: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart }) => {
  const { deleteTask, moveTask } = useTaskContext();
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [touchMoved, setTouchMoved] = useState(false);
  const taskRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only initiate drag if touch starts on grip handle
    if (!gripRef.current?.contains(e.target as Node)) {
      return;
    }
    
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setTouchMoved(false);

    const taskCard = e.currentTarget;
    setIsDragging(true);
    taskCard.classList.add('opacity-50');
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !taskRef.current) return;

    e.preventDefault(); // Prevent scrolling while dragging
    const touch = e.touches[0];
    
    // Check if we've moved at least 10px to count as a drag
    if (!touchMoved) {
      const deltaX = Math.abs(touch.clientX - touchStartPos.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.y);
      
      if (deltaX > 10 || deltaY > 10) {
        setTouchMoved(true);
      }
    }
    
    // Move the element with the touch
    if (taskRef.current) {
      const rect = taskRef.current.getBoundingClientRect();
      taskRef.current.style.position = 'fixed';
      taskRef.current.style.top = `${touch.clientY - rect.height / 2}px`;
      taskRef.current.style.left = `${touch.clientX - rect.width / 2}px`;
      taskRef.current.style.zIndex = '1000';
    }
    
    // Find the column element under the touch point
    const elementsFromPoint = document.elementsFromPoint(touch.clientX, touch.clientY);
    const columnElement = elementsFromPoint.find(el => el.hasAttribute('data-column-id'));
    
    if (columnElement) {
      // Highlight the column being dragged over
      document.querySelectorAll('[data-column-id]').forEach(el => {
        el.classList.remove('scale-[1.02]', 'shadow-lg');
      });
      columnElement.classList.add('scale-[1.02]', 'shadow-lg');
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || !taskRef.current) return;
    
    const taskCard = taskRef.current;
    taskCard.classList.remove('opacity-50');
    taskCard.style.position = '';
    taskCard.style.top = '';
    taskCard.style.left = '';
    taskCard.style.zIndex = '';
    
    setIsDragging(false);
    
    if (!touchMoved) return;
    
    const touch = e.changedTouches[0];
    // Find the column element at the touch end position
    const elementsFromPoint = document.elementsFromPoint(touch.clientX, touch.clientY);
    const columnElement = elementsFromPoint.find(el => el.hasAttribute('data-column-id'));
    
    if (columnElement) {
      const targetColumnId = columnElement.getAttribute('data-column-id');
      if (targetColumnId && targetColumnId !== task.status) {
        // Move the task to the new column
        moveTask(task.id, task.status, targetColumnId as any);
      }
    }
    
    // Remove highlighting from all columns
    document.querySelectorAll('[data-column-id]').forEach(el => {
      el.classList.remove('scale-[1.02]', 'shadow-lg');
    });
  };

  // Clean up any lingering styles or classes when component unmounts or if touch is interrupted
  useEffect(() => {
    return () => {
      if (taskRef.current) {
        taskRef.current.classList.remove('opacity-50');
        taskRef.current.style.position = '';
        taskRef.current.style.top = '';
        taskRef.current.style.left = '';
        taskRef.current.style.zIndex = '';
      }
    };
  }, []);

  return (
    <div
      ref={taskRef}
      className={`task-card bg-white rounded-md p-3 shadow-sm border border-gray-200 hover:shadow-md transition-all touch-none ${isDragging ? 'opacity-50' : 'hover:translate-y-[-2px]'}`}
      draggable
      onDragStart={(e) => onDragStart(e, task.id, task.status)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800">{task.title}</h3>
        <div 
          ref={gripRef}
          className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-grab active:cursor-grabbing touch-handle"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
      
      <div className="flex flex-wrap gap-2 my-2">
        {task.priority && (
          <Badge variant="outline" className={`${getPriorityColor(task.priority)} capitalize text-xs`}>
            {task.priority}
          </Badge>
        )}
        
        {task.tags && task.tags.map(tag => (
          <Badge key={tag} variant="secondary" className="text-xs">
            <Tag className="h-3 w-3 mr-1" />
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap justify-between items-center mt-2 text-xs text-gray-500">
        <div className="flex items-center">
          <span className={`inline-block w-2 h-2 rounded-full ${
            task.status === "todo" ? "bg-blue-500" : 
            task.status === "inprogress" ? "bg-yellow-500" : 
            task.status === "review" ? "bg-purple-500" : 
            "bg-green-500"
          } mr-1`}></span>
          <span className="capitalize">
            {task.status === "inprogress" ? "In Progress" : task.status}
          </span>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1 h-6 text-xs">
              Details
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
              {task.dueDate && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Due: {formatDate(task.dueDate)}</span>
                </div>
              )}
            </DialogHeader>
            
            <DialogDescription className="py-4">
              <div className="space-y-4">
                <div className="py-2">
                  <p className="text-gray-700">{task.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Priority</span>
                    <Badge variant="outline" className={`${getPriorityColor(task.priority)} w-fit capitalize`}>
                      {task.priority}
                    </Badge>
                  </div>
                  
                  {task.assignee && (
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Assignee</span>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{task.assignee}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Tags</span>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Created</span>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{formatDate(task.createdAt)}</span>
                  </div>
                </div>
              </div>
            </DialogDescription>
            
            <div className="flex justify-end gap-2">
              <Button variant="destructive" size="sm" onClick={() => deleteTask(task.id)}>
                Delete Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TaskCard;
