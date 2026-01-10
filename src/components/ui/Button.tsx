import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-xl font-semibold transition-all duration-200';
  const variants = {
    primary: 'bg-gradient-to-r from-cosmic-purple to-pink-500 hover:scale-105 shadow-lg',
    secondary: 'bg-white/10 hover:bg-white/20 border border-white/20',
    ghost: 'hover:bg-white/10',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
