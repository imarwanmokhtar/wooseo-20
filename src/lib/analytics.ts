// Analytics initialization
export const initAnalytics = () => {
  if (typeof window !== 'undefined') {
    // Load Vercel Analytics
    const analyticsScript = document.createElement('script');
    analyticsScript.src = 'https://va.vercel-scripts.com/v1/script.debug.js';
    analyticsScript.defer = true;
    document.head.appendChild(analyticsScript);

    // Load Vercel Speed Insights
    const speedInsightsScript = document.createElement('script');
    speedInsightsScript.src = 'https://vitals.vercel-insights.com/v1/vitals.debug.js';
    speedInsightsScript.defer = true;
    document.head.appendChild(speedInsightsScript);
  }
}; 