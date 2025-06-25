import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
}

const Button = ({ 
  children, 
  fullWidth = false, 
  variant = 'primary',
  className = '',
  ...props 
}: ButtonProps) => {
  const baseClasses = 'group relative flex justify-center py-2 px-4 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150';
  
  const variantClasses = {
    primary: 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 active:bg-indigo-800',
    outline: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500 active:bg-gray-100',
    ghost: 'border-transparent text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-indigo-500 active:bg-gray-200'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;