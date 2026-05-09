import React from 'react';

export default function DashboardSkeleton({ tab }: { tab?: string }) {
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
      {/* Sleek Minimal Header Skeleton */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-sidebar-border transition-colors duration-300">
        <div className="h-6 w-32 bg-gradient-to-r from-skeleton-shimmer to-card-bg animate-pulse rounded-md" />
        <div className="flex items-center gap-3">
          <div className="h-9 w-48 bg-gradient-to-r from-skeleton-shimmer to-card-bg animate-pulse rounded-md" />
          <div className="h-9 w-28 bg-gradient-to-r from-skeleton-shimmer to-card-bg animate-pulse rounded-md" />
        </div>
      </header>

      {/* Unified Minimalist Content Skeleton - Staggered Empty Cards */}
      <div className="flex-1 overflow-auto p-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="relative overflow-hidden rounded-2xl border border-card-border bg-card-bg shadow-2xl h-44"
            >
              {/* Animated Gradient Shimmer Effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-transparent via-skeleton-shimmer to-transparent animate-pulse"
                style={{
                  animationDelay: `${i * 150}ms`,
                  animationDuration: '2s'
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
