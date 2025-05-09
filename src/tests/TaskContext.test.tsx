
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { TaskProvider, useTaskContext } from '../contexts/TaskContext';
import React from 'react';

// Mock the fetchTasks function
vi.mock('../services/mockApi', () => ({
  fetchTasks: vi.fn().mockResolvedValue([
    { id: 'todo', title: 'To Do', tasks: [] },
    { id: 'inprogress', title: 'In Progress', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] }
  ]),
  defaultColumns: [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ]
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Test component to access context
const TestComponent = () => {
  const { addTask, score, board } = useTaskContext();
  
  return (
    <div>
      <div data-testid="score">{score}</div>
      <button 
        data-testid="add-task-btn" 
        onClick={() => addTask({
          title: 'Test Task',
          description: 'Test Description',
          status: 'todo',
          priority: 'medium'
        })}
      >
        Add Task
      </button>
      <div data-testid="columns-count">{board.columns.length}</div>
    </div>
  );
};

describe('TaskContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should initialize with default values', async () => {
    let component;
    await act(async () => {
      component = render(
        <TaskProvider>
          <TestComponent />
        </TaskProvider>
      );
    });
    
    expect(component.getByTestId('score').textContent).toBe('0');
    expect(component.getByTestId('columns-count').textContent).toBe('3');
  });
  
  it('should increase score when adding a task', async () => {
    let component;
    await act(async () => {
      component = render(
        <TaskProvider>
          <TestComponent />
        </TaskProvider>
      );
    });
    
    const initialScore = component.getByTestId('score').textContent;
    
    await act(async () => {
      component.getByTestId('add-task-btn').click();
    });
    
    expect(component.getByTestId('score').textContent).toBe('1');
  });
});
