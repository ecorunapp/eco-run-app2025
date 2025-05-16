
import React from 'react';

interface EcoRunLogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const EcoRunLogo: React.FC<EcoRunLogoProps> = ({ className, size = 'medium' }) => {
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl',
  };

  return (
    <h1 className={`font-extrabold ${sizeClasses[size]} ${className}`}>
      <span className="text-eco-light">Eco</span>
      <span className="text-eco-accent">Run</span>
    </h1>
  );
};

export default EcoRunLogo;
