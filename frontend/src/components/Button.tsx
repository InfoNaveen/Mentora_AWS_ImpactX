/**
 * AWS-Style Button Component
 */
import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
  as?: React.ElementType;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  as: Component = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0d12]';
  
  const variants = {
    primary: 'bg-[#1a73e8] hover:bg-[#1557b0] text-white border border-[#1a73e8] focus:ring-[#1a73e8]',
    secondary: 'bg-[#151a22] hover:bg-[#1f262e] text-[#f1f5f9] border border-[#2d3748] focus:ring-[#4a5568]',
    ghost: 'bg-transparent hover:bg-white/5 text-[#94a3b8] hover:text-[#f1f5f9] focus:ring-white/10',
    danger: 'bg-[#c53030] hover:bg-[#9b2c2c] text-white border border-[#c53030] focus:ring-[#c53030]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const buttonProps = Component === 'button' ? { disabled: disabled || loading } : {};

  return (
    <Component
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...buttonProps}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} />
      ) : Icon && (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} />
      )}
      {children}
    </Component>
  );
};

