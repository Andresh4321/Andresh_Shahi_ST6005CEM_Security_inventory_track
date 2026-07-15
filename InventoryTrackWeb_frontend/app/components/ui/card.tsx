import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = '', ...props }: CardProps) {
  return <div className={`border-b border-gray-200 px-6 py-4 ${className}`} {...props} />;
}

export function CardTitle({ className = '', ...props }: CardProps) {
  return <h2 className={`text-lg font-semibold text-gray-900 ${className}`} {...props} />;
}

export function CardContent({ className = '', ...props }: CardProps) {
  return <div className={`px-6 py-4 ${className}`} {...props} />;
}

export function CardFooter({ className = '', ...props }: CardProps) {
  return <div className={`border-t border-gray-200 px-6 py-4 ${className}`} {...props} />;
}
