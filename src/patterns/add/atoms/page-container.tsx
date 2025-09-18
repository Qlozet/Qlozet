// Page Container - Atom
// Provides consistent page-level container styling

import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  backgroundColor?: 'gray' | 'white' | 'transparent';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  maxWidth = '2xl',
  padding = true,
  backgroundColor = 'gray',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const backgroundClasses = {
    gray: 'bg-gray-50',
    white: 'bg-white',
    transparent: 'bg-transparent',
  };

  return (
    <section
      className={`min-h-screen ${backgroundClasses[backgroundColor]} ${className}`}
    >
      <div
        className={`container mx-auto ${maxWidthClasses[maxWidth]} ${padding ? 'p-6' : ''}`}
      >
        {children}
      </div>
    </section>
  );
};
