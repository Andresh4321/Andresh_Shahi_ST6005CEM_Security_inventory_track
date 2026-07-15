/**
 * Trigger a dashboard refresh after data changes
 * Call this function after creating, updating, or deleting data
 * that should be reflected in the dashboard
 */
export const triggerDashboardRefresh = () => {
  if (typeof window !== 'undefined') {
    // Set a timestamp to trigger storage event
    localStorage.setItem('dashboard_refresh_trigger', Date.now().toString());
    // Remove it after a short delay to allow the event to fire
    setTimeout(() => {
      localStorage.removeItem('dashboard_refresh_trigger');
    }, 100);
  }
};
