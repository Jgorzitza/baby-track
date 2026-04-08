import { CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: CSSProperties;
}

export const Skeleton = ({
  width,
  height,
  borderRadius,
  className = '',
  style,
}: SkeletonProps) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        borderRadius: borderRadius || '0.5rem',
        ...style,
      }}
    />
  );
};
