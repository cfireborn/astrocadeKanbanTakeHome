
import React, { useState, useEffect } from "react";
import { useTaskContext } from "../contexts/TaskContext";
import KanbanColumn from "./KanbanColumn";
import { TaskStatus } from "../types/kanban";
import { useIsMobile } from "../hooks/use-mobile";
import { DragEventHandler } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, Settings, RefreshCw } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { ScrollArea } from "./ui/scroll-area";

const KanbanBoard: React.FC = () => {
  const { board, moveTask, loading, refreshTasks, configureColumns } = useTaskContext();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedTaskStatus, setDraggedTaskStatus] = useState<string | null>(null);
  const [draggingOver, setDraggingOver] = useState<string | null>(null);
  const [taskCount, setTaskCount] = useState<number>(20);
  const [newColumnName, setNewColumnName] = useState<string>("");
  const [newColumnId, setNewColumnId] = useState<string>("");
  const [isCustomizingColumns, setIsCustomizingColumns] = useState<boolean>(false);
  const [customColumns, setCustomColumns] = useState<{id: string, title: string}[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (board.columns.length > 0) {
      setCustomColumns(board.columns.map(col => ({ id: col.id, title: col.title })));
    }
  }, [board.columns]);

  const handleDragStart = (e: React.DragEvent, taskId: string, status: string) => {
    setDraggedTaskId(taskId);
    setDraggedTaskStatus(status);
    
    // Make the ghost drag image look nicer
    if (e.dataTransfer) {
      const dragImage = document.createElement('div');
      dragImage.classList.add('drag-ghost');
      dragImage.innerHTML = '🔄 Moving Task';
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      
      // Clean up after drag
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }
  };

  const handleDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const columnId = e.currentTarget.getAttribute('data-column-id');
    if (columnId) {
      setDraggingOver(columnId);
    }
  };

  const handleDragLeave = () => {
    setDraggingOver(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDraggingOver(null);
    if (draggedTaskId && draggedTaskStatus && draggedTaskStatus !== targetStatus) {
      moveTask(draggedTaskId, draggedTaskStatus as TaskStatus, targetStatus);
    }
    setDraggedTaskId(null);
    setDraggedTaskStatus(null);
  };

  const handleAddColumn = () => {
    if (newColumnId.trim() && newColumnName.trim()) {
      setCustomColumns([...customColumns, { id: newColumnId.toLowerCase().replace(/\s+/g, ''), title: newColumnName }]);
      setNewColumnId('');
      setNewColumnName('');
    }
  };

  const handleRemoveColumn = (idToRemove: string) => {
    setCustomColumns(customColumns.filter(col => col.id !== idToRemove));
  };

  const handleSaveColumns = () => {
    if (customColumns.length > 0) {
      configureColumns(customColumns);
      setIsCustomizingColumns(false);
    }
  };

  const handleRefresh = () => {
    refreshTasks(taskCount);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">Loading Kanban Board...</h2>
        </div>
        <div className="flex flex-row gap-4 overflow-x-auto py-4 px-2 min-h-[calc(100vh-200px)]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 min-w-[280px] flex-1 max-w-[350px]">
              <div className="flex justify-between mb-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-10" />
              </div>
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="w-full h-24 mb-3" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Kanban Board</h2>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={5}
              max={1000}
              value={taskCount}
              onChange={(e) => setTaskCount(Number(e.target.value))}
              className="w-20"
            />
            <Button onClick={handleRefresh} size="sm">
              <RefreshCw className="h-4 w-4 mr-1" /> Load Tasks
            </Button>
          </div>
          
          <Dialog open={isCustomizingColumns} onOpenChange={setIsCustomizingColumns}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" /> Customize Columns
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Customize Board Columns</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  {customColumns.map((col, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={col.title}
                        onChange={(e) => {
                          const updated = [...customColumns];
                          updated[index].title = e.target.value;
                          setCustomColumns(updated);
                        }}
                        className="flex-1"
                      />
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleRemoveColumn(col.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Add New Column</h3>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <Label htmlFor="column-id">Column ID</Label>
                      <Input
                        id="column-id"
                        placeholder="e.g., blocked"
                        value={newColumnId}
                        onChange={(e) => setNewColumnId(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="column-name">Display Name</Label>
                      <Input
                        id="column-name"
                        placeholder="e.g., Blocked"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleAddColumn} 
                    disabled={!newColumnId || !newColumnName}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Column
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveColumns} 
                  disabled={customColumns.length === 0}
                >
                  Save Configuration
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-4">
        <div 
          className="flex flex-row gap-4 py-4 px-2 min-h-[calc(100vh-200px)]"
          style={{ minWidth: 'max-content' }}
        >
          {board.columns.map((column) => (
            <div 
              key={column.id}
              className={`transition-all duration-200 ${draggingOver === column.id ? 'scale-[1.02] shadow-lg' : ''}`}
              data-column-id={column.id}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <KanbanColumn
                column={column}
                onDragStart={handleDragStart}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
