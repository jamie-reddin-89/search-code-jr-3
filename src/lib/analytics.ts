import { supabase } from "@/integrations/supabase/client";

export type EventType =
  | "page_view"
  | "error_code_search"
  | "button_click"
  | "form_submit"
  | "device_view"
  | "photo_upload"
  | "custom";

interface AnalyticsEvent {
  id: string;
  user_id?: string;
  device_id?: string;
  event_type: EventType;
  path?: string;
  meta?: Record<string, any>;
  timestamp: string;
}

/**
 * Generate or retrieve device ID from localStorage
 */
function getDeviceId(): string {
  let id = localStorage.getItem("jr_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("jr_device_id", id);
  }
  return id;
}

/**
 * Track an analytics event
 */
export async function trackEvent(
  eventType: EventType,
  options?: {
    userId?: string;
    path?: string;
    meta?: Record<string, any>;
  }
): Promise<void> {
  try {
    if (!supabase) return;

    const deviceId = getDeviceId();
    const { data: { user } } = await supabase.auth.getUser();

    // Fire and forget - don't block UI
    supabase
      .from("app_analytics")
      .insert({
        event_type: eventType,
        user_id: options?.userId || user?.id || null,
        device_id: deviceId,
        path: options?.path || window.location.hash || window.location.pathname,
        meta: options?.meta || null,
        timestamp: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.error("Failed to track event:", error);
      })
      .catch(err => console.error("Analytics error:", err));
  } catch (err) {
    // Silently fail
    console.error("Analytics error:", err);
  }
}

/**
 * Track page view
 */
export async function trackPageView(path?: string): Promise<void> {
  await trackEvent("page_view", { path });
}

/**
 * Track error code search
 */
export async function trackErrorCodeSearch(
  errorCode: string,
  systemName: string
): Promise<void> {
  await trackEvent("error_code_search", {
    meta: { errorCode, systemName },
  });
}

/**
 * Track button click
 */
export async function trackButtonClick(
  buttonLabel: string,
  additionalMeta?: Record<string, any>
): Promise<void> {
  await trackEvent("button_click", {
    meta: { buttonLabel, ...additionalMeta },
  });
}

/**
 * Track device view
 */
export async function trackDeviceView(
  brandName: string,
  modelName: string
): Promise<void> {
  await trackEvent("device_view", {
    meta: { brandName, modelName },
  });
}

/**
 * Get analytics data (admin only)
 */
export async function getAnalytics(
  startDate?: Date,
  endDate?: Date
): Promise<AnalyticsEvent[]> {
  try {
    let query = supabase
      .from("app_analytics")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(5000);

    if (startDate) {
      query = query.gte("timestamp", startDate.toISOString());
    }

    if (endDate) {
      query = query.lte("timestamp", endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch analytics:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error fetching analytics:", err);
    return [];
  }
}

/**
 * Get analytics summary by event type
 */
export async function getAnalyticsSummary(
  startDate?: Date,
  endDate?: Date
): Promise<Record<EventType, number>> {
  const events = await getAnalytics(startDate, endDate);
  const summary = {} as Record<EventType, number>;

  for (const event of events) {
    summary[event.event_type] = (summary[event.event_type] || 0) + 1;
  }

  return summary;
}

/**
 * Get most searched error codes
 */
export async function getMostSearchedErrorCodes(
  limit: number = 10
): Promise<{ code: string; system: string; count: number }[]> {
  try {
    const events = await getAnalytics();
    const searches = events.filter(e => e.event_type === "error_code_search");

    const summary: Record<string, { code: string; system: string; count: number }> =
      {};

    for (const event of searches) {
      const key = `${event.meta?.errorCode}:${event.meta?.systemName}`;
      if (summary[key]) {
        summary[key].count++;
      } else {
        summary[key] = {
          code: event.meta?.errorCode || "unknown",
          system: event.meta?.systemName || "unknown",
          count: 1,
        };
      }
    }

    return Object.values(summary)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (err) {
    console.error("Error getting searched codes:", err);
    return [];
  }
}

/**
 * Get most viewed pages
 */
export async function getMostViewedPages(limit: number = 10): Promise<
  { path: string; count: number }[]
> {
  try {
    const events = await getAnalytics();
    const pageViews = events.filter(e => e.event_type === "page_view");

    const summary: Record<string, number> = {};

    for (const event of pageViews) {
      const path = event.path || "/";
      summary[path] = (summary[path] || 0) + 1;
    }

    return Object.entries(summary)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (err) {
    console.error("Error getting viewed pages:", err);
    return [];
  }
}
