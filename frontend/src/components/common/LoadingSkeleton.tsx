import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  height?: string;
  type?: 'card' | 'table' | 'line';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  height = 'h-16',
  type = 'line',
}) => {
  const getSkeletonHeight = () => {
    if (type === 'card') return 'h-32';
    if (type === 'table') return 'h-20';
    return height;
  };

  return (
    <div className="space-y-3 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`w-full bg-stone-200/60 border border-stone-200 rounded-xl ${getSkeletonHeight()}`}
        ></div>
      ))}
    </div>
  );
};
