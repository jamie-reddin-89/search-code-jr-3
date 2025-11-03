import { supabase } from "@/integrations/supabase/client";

export type LogLevel = "Critical" | "Urgent" | "Shutdown" | "Error" | "Warning" | "Info" | "Debug";

interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  stack_trace?: Record<string, any>;
  user_id?: string;
  page_path?: string;
  timestamp: string;
}

/**
 * Log a message to the app_logs table in Supabase
 */
export async function logToSupabase(
  level: LogLevel,
  message: string,
  options?: {
    stackTrace?: string | Error;
    userId?: string;
    pagePath?: string;
  }
): Promise<void> {
  try {
    // Don't wait for Supabase to respond - fire and forget
    if (!supabase) return;

    const stackTraceObj = options?.stackTrace
      ? typeof options.stackTrace === "string"
        ? { message: options.stackTrace }
        : {
            name: options.stackTrace.name,
            message: options.stackTrace.message,
            stack: options.stackTrace.stack,
          }
      : undefined;

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("app_logs")
      .insert({
        level,
        message,
        stack_trace: stackTraceObj || null,
        user_id: options?.userId || user?.id || null,
        page_path: options?.pagePath || window.location.hash || window.location.pathname,
        timestamp: new Date().toISOString(),
      });

    if (error) {
      // Silently fail - don't create infinite loop
      console.error("Failed to log to Supabase:", error);
    }
  } catch (err) {
    // Silently fail
    console.error("Logger error:", err);
  }
}

/**
 * Log error with stack trace
 */
export async function logError(
  message: string,
  error?: Error | string,
  userId?: string
): Promise<void> {
  await logToSupabase("Error", message, {
    stackTrace: error,
    userId,
  });
  // Also log to console
  console.error(message, error);
}

/**
 * Log warning
 */
export async function logWarning(message: string, userId?: string): Promise<void> {
  await logToSupabase("Warning", message, { userId });
  console.warn(message);
}

/**
 * Log info
 */
export async function logInfo(message: string, userId?: string): Promise<void> {
  await logToSupabase("Info", message, { userId });
  console.log(message);
}

/**
 * Log critical issue (for alerts)
 */
export async function logCritical(
  message: string,
  error?: Error | string,
  userId?: string
): Promise<void> {
  await logToSupabase("Critical", message, {
    stackTrace: error,
    userId,
  });
  console.error("[CRITICAL]", message, error);
}

/**
 * Get logs from Supabase (admin only)
 */
export async function getLogs(level?: LogLevel): Promise<LogEntry[]> {
  try {
    let query = supabase
      .from("app_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1000);

    if (level) {
      query = query.eq("level", level);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch logs:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error fetching logs:", err);
    return [];
  }
}

/**
 * Get logs by date range
 */
export async function getLogsByDateRange(
  startDate: Date,
  endDate: Date,
  level?: LogLevel
): Promise<LogEntry[]> {
  try {
    let query = supabase
      .from("app_logs")
      .select("*")
      .gte("timestamp", startDate.toISOString())
      .lte("timestamp", endDate.toISOString())
      .order("timestamp", { ascending: false });

    if (level) {
      query = query.eq("level", level);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch logs:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error fetching logs:", err);
    return [];
  }
}

/**
 * Delete logs older than specified days
 */
export async function deleteOldLogs(days: number = 30): Promise<boolean> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { error } = await supabase
      .from("app_logs")
      .delete()
      .lt("timestamp", cutoffDate.toISOString());

    if (error) {
      console.error("Failed to delete old logs:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error deleting logs:", err);
    return false;
  }
}
