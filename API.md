# Mock API Documentation

## Overview
This document describes the mock API implementation used in the Kanban board application. The mock API simulates a backend service, providing realistic data and behavior for development and testing purposes.

## Core Components

### Default Configuration
```typescript
export const defaultColumns = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" }
];
```

## API Functions

### `fetchTasks`
The primary function for retrieving tasks from the mock API.

```typescript
fetchTasks(
  numTasks = 20, 
  columnDefinitions = defaultColumns,
  simulatedDelay = 800
): Promise<Column[]>
```

**Parameters:**
- `numTasks` (number): Number of tasks to generate (default: 20)
- `columnDefinitions` (Column[]): Column configuration (default: defaultColumns)
- `simulatedDelay` (number): Network delay simulation in milliseconds (default: 800)

**Returns:**
- Promise<Column[]>: Array of columns with distributed tasks

### `searchTasks`
Searches tasks based on a query string.

```typescript
searchTasks(
  query: string, 
  columns: Column[]
): Promise<Column[]>
```

**Parameters:**
- `query` (string): Search query
- `columns` (Column[]): Current column data

**Returns:**
- Promise<Column[]>: Filtered columns based on search query

## Task Structure

Tasks are generated with the following properties:

```typescript
interface Task {
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
```

### Random Task Generation
Tasks are generated with random values for:
- Priority (low, medium, high)
- Due date (random future date)
- Assignee (random from predefined list)
- Tags (0-3 random tags from predefined options)
- Creation timestamp

## Integration

### TaskContext Usage
The mock API is integrated through the TaskContext, providing:
- Task management (add, update, move, delete)
- Board state management
- Loading states
- Error handling
- Filtering capabilities

Example usage:
```typescript
const refreshTasks = async (count?: number) => {
  setLoading(true);
  try {
    const fetchedColumns = await fetchTasks(count || 20, columns);
    setBoard({ columns: fetchedColumns });
  } catch (error) {
    handleError(error, "Failed to load tasks. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

## Features

### Simulated Network Behavior
- Artificial delays to simulate real network conditions
- Error handling and recovery
- Loading state management

### Customization
- Configurable number of tasks
- Custom column definitions
- Adjustable network delay

### Search Capabilities
Tasks can be filtered by:
- Title
- Description
- Assignee
- Tags

## Testing

The mock API includes comprehensive test coverage in `src/tests/TaskContext.test.tsx`, verifying:
- Initial task loading
- Task manipulation
- Error handling
- State management

## Performance Considerations

The mock API is designed to:
- Handle large numbers of tasks (1,000+)
- Provide realistic network simulation
- Maintain type safety with TypeScript
- Support efficient search operations

## Best Practices

When using the mock API:
1. Always handle loading states
2. Implement proper error handling
3. Use TypeScript types for type safety
4. Consider performance implications for large datasets
5. Test with various column configurations

## Future Improvements

Potential enhancements for the mock API:
- Add pagination support
- Implement sorting capabilities
- Add more sophisticated search filters
- Support task relationships
- Add data persistence simulation 