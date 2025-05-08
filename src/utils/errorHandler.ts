
import { toast } from "sonner";

// Log levels
export type LogLevel = "info" | "warning" | "error" | "debug";

// Error with additional context
export interface AppError extends Error {
  context?: Record<string, any>;
}

// Function to handle and present errors to users
export function handleError(error: AppError | Error | unknown, userMessage?: string): void {
  // Create a standardized error object
  const errorObj: AppError = error instanceof Error ? error : new Error(String(error));
  
  // Log the error for debugging
  console.error("Application error:", {
    message: errorObj.message,
    stack: errorObj.stack,
    context: (errorObj as AppError).context || {},
  });
  
  // Show user-friendly message
  toast.error(userMessage || "Something went wrong. Please try again.");
}

// Function to log events with different severity levels
export function logEvent(level: LogLevel, message: string, data?: Record<string, any>): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data
  };
  
  // Log to console with appropriate method based on level
  switch (level) {
    case "error":
      console.error(logEntry);
      break;
    case "warning":
      console.warn(logEntry);
      break;
    case "info":
      console.info(logEntry);
      break;
    case "debug":
      console.debug(logEntry);
      break;
    default:
      console.log(logEntry);
  }

  // In a production app, you might want to send logs to a server
  // sendLogToServer(logEntry);
}

// Function to track user actions for analytics
export function trackUserAction(action: string, properties?: Record<string, any>): void {
  logEvent("info", `User action: ${action}`, properties);
  
  // Here you would normally integrate with an analytics service
  // analytics.track(action, properties);
}
