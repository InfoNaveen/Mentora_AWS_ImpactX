import React from 'react';

interface AWSSkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const AWSSkeleton: React.FC<AWSSkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  return (
    <div
      className={`aws-skeleton ${variant} ${className}`}
      style={{
        width: width || '100%',
        height: height || (variant === 'text' ? '1em' : '100%'),
      }}
    >
      <style jsx>{`
        .aws-skeleton {
          background: rgba(255, 255, 255, 0.04);
          position: relative;
          overflow: hidden;
        }

        .aws-skeleton::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.05),
            transparent
          );
          animation: shimmer 1.5s infinite;
        }

        .text {
          border-radius: 4px;
          margin: 0.2em 0;
        }

        .rect {
          border-radius: 8px;
        }

        .circle {
          border-radius: 50%;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
