
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { useTaskContext } from "../contexts/TaskContext";
import { Badge } from "./ui/badge";
import { TaskFilter as TaskFilterType } from "../types/kanban";

const TaskFilter: React.FC = () => {
  const { setFilter } = useTaskContext();
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [priorities, setPriorities] = useState<Record<string, boolean>>({
    low: false,
    medium: false,
    high: false
  });
  const [assignee, setAssignee] = useState("");
  const [dueAfter, setDueAfter] = useState<Date | undefined>(undefined);
  const [dueBefore, setDueBefore] = useState<Date | undefined>(undefined);
  const [tags, setTags] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleApplyFilter = () => {
    const filter: TaskFilterType = {};
    const newActiveFilters: string[] = [];
    
    // Process priorities
    const selectedPriorities = Object.entries(priorities)
      .filter(([_, selected]) => selected)
      .map(([priority]) => priority as "low" | "medium" | "high");
    
    if (selectedPriorities.length > 0) {
      filter.priority = selectedPriorities;
      newActiveFilters.push(`Priority: ${selectedPriorities.join(', ')}`);
    }
    
    // Process assignee
    if (assignee.trim()) {
      filter.assignee = [assignee.trim()];
      newActiveFilters.push(`Assignee: ${assignee}`);
    }
    
    // Process dates
    if (dueAfter) {
      filter.dueAfter = format(dueAfter, 'yyyy-MM-dd');
      newActiveFilters.push(`Due after: ${format(dueAfter, 'MMM d, yyyy')}`);
    }
    
    if (dueBefore) {
      filter.dueBefore = format(dueBefore, 'yyyy-MM-dd');
      newActiveFilters.push(`Due before: ${format(dueBefore, 'MMM d, yyyy')}`);
    }
    
    // Process tags
    if (tags.trim()) {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      if (tagArray.length > 0) {
        filter.tags = tagArray;
        newActiveFilters.push(`Tags: ${tagArray.join(', ')}`);
      }
    }
    
    // Process search text
    if (searchText.trim()) {
      filter.searchText = searchText.trim();
      newActiveFilters.push(`Search: ${searchText}`);
    }
    
    setFilter(filter);
    setActiveFilters(newActiveFilters);
    setIsOpen(false);
  };

  const handleClearFilter = () => {
    setSearchText("");
    setPriorities({ low: false, medium: false, high: false });
    setAssignee("");
    setDueAfter(undefined);
    setDueBefore(undefined);
    setTags("");
    setActiveFilters([]);
    setFilter({});
  };

  const removeFilter = (index: number) => {
    const newActiveFilters = [...activeFilters];
    newActiveFilters.splice(index, 1);
    setActiveFilters(newActiveFilters);
    
    // Rebuild filter object from remaining filters
    const filter: TaskFilterType = {};
    
    newActiveFilters.forEach(filterText => {
      if (filterText.startsWith('Priority:')) {
        const priorities = filterText.replace('Priority:', '').split(',').map(p => p.trim()) as ("low" | "medium" | "high")[];
        filter.priority = priorities;
        
        // Reset priority checkboxes
        setPriorities({
          low: priorities.includes('low'),
          medium: priorities.includes('medium'),
          high: priorities.includes('high')
        });
      }
      
      if (filterText.startsWith('Assignee:')) {
        const value = filterText.replace('Assignee:', '').trim();
        filter.assignee = [value];
        setAssignee(value);
      }
      
      if (filterText.startsWith('Due after:')) {
        // Don't modify the date objects here
        if (dueAfter) {
          filter.dueAfter = format(dueAfter, 'yyyy-MM-dd');
        }
      }
      
      if (filterText.startsWith('Due before:')) {
        // Don't modify the date objects here
        if (dueBefore) {
          filter.dueBefore = format(dueBefore, 'yyyy-MM-dd');
        }
      }
      
      if (filterText.startsWith('Tags:')) {
        const value = filterText.replace('Tags:', '').trim();
        filter.tags = value.split(',').map(tag => tag.trim());
        setTags(value);
      }
      
      if (filterText.startsWith('Search:')) {
        const value = filterText.replace('Search:', '').trim();
        filter.searchText = value;
        setSearchText(value);
      }
    });
    
    setFilter(filter);
    
    // Clear if no filters remain
    if (newActiveFilters.length === 0) {
      handleClearFilter();
    }
  };

  return (
    <div className="mb-4">
      <div className="flex gap-2 flex-wrap items-center">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="h-4 w-4 mr-1" /> Filter Tasks
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search</Label>
                <Input
                  placeholder="Search in title or description"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Priority</Label>
                <div className="flex gap-4">
                  {["low", "medium", "high"].map((priority) => (
                    <div key={priority} className="flex items-center gap-1.5">
                      <Checkbox
                        checked={priorities[priority]}
                        onCheckedChange={(checked) => {
                          setPriorities({
                            ...priorities,
                            [priority]: !!checked
                          });
                        }}
                        id={`priority-${priority}`}
                      />
                      <label
                        htmlFor={`priority-${priority}`}
                        className="text-sm capitalize cursor-pointer"
                      >
                        {priority}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Assignee</Label>
                <Input
                  placeholder="Filter by assignee"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Due Date Range</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left text-sm font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueAfter ? format(dueAfter, "MMM d") : <span>From</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueAfter}
                        onSelect={setDueAfter}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left text-sm font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueBefore ? format(dueBefore, "MMM d") : <span>To</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueBefore}
                        onSelect={setDueBefore}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tags</Label>
                <Input
                  placeholder="Comma separated tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
              
              <div className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearFilter}
                >
                  Clear All
                </Button>
                <Button size="sm" onClick={handleApplyFilter}>Apply Filter</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {searchText && (
          <div className="relative">
            <Input
              placeholder="Search tasks..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="h-9 pr-10"
            />
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setSearchText("");
                const newFilter = { ...useTaskContext().filter };
                delete newFilter.searchText;
                setFilter(newFilter);
                setActiveFilters(activeFilters.filter(f => !f.startsWith('Search:')));
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {activeFilters.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 text-red-500 hover:text-red-700"
            onClick={handleClearFilter}
          >
            Clear All Filters
          </Button>
        )}
      </div>
      
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1 bg-gray-100">
              {filter}
              <button 
                className="ml-1 hover:text-red-500"
                onClick={() => removeFilter(index)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskFilter;
