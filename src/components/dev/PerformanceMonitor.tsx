'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PerformanceMetrics {
  navigationTime: number;
  renderTime: number;
  route: string;
  timestamp: number;
}

export function PerformanceMonitor() {
  const pathname = usePathname();
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;
    
    const startTime = performance.now();
    
    // Measure time to interactive
    const measurePerformance = () => {
      const endTime = performance.now();
      const navigationTime = endTime - startTime;
      
      // Get render time from React DevTools if available
      const renderTime = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.size > 0 
        ? performance.now() - startTime 
        : navigationTime;
      
      const newMetric: PerformanceMetrics = {
        navigationTime,
        renderTime,
        route: pathname,
        timestamp: Date.now(),
      };
      
      setMetrics(prev => [...prev.slice(-9), newMetric]);
    };
    
    // Wait for the page to be fully interactive
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, [pathname]);
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  const avgNavigationTime = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.navigationTime, 0) / metrics.length
    : 0;
  
  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-black text-white p-2 rounded-full text-xs font-mono"
        title="Toggle performance monitor"
      >
        ⚡ {avgNavigationTime.toFixed(0)}ms
      </button>
      
      {/* Performance panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-sm">
          <h3 className="text-sm font-bold mb-2">Performance Monitor</h3>
          <div className="space-y-1">
            <div>Current Route: {pathname}</div>
            <div>Avg Navigation: {avgNavigationTime.toFixed(2)}ms</div>
            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="text-xs opacity-70 mb-1">Recent navigations:</div>
              {metrics.slice(-5).reverse().map((metric, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="truncate mr-2">{metric.route}</span>
                  <span className={metric.navigationTime > 500 ? 'text-red-400' : 'text-green-400'}>
                    {metric.navigationTime.toFixed(0)}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 