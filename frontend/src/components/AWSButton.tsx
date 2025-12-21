import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

interface AWSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const AWSButton: React.FC<AWSButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 hover:border-slate-600 active:bg-slate-900',
    secondary: 'bg-slate-900/50 text-slate-300 border border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20',
    outline: 'bg-transparent text-sky-500 border border-sky-500/50 hover:bg-sky-500/10 hover:border-sky-500',
    accent: 'bg-gradient-to-br from-sky-600 to-indigo-600 text-white hover:from-sky-500 hover:to-indigo-500 shadow-lg shadow-sky-500/20',
    danger: 'bg-red-950/30 text-red-400 border border-red-900/50 hover:bg-red-900/40 hover:text-red-300',
    ghost: 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // We are using styled-jsx in this project, but for this component I will use standard CSS classes 
  // and define them in the global styles or as a separate CSS module if preferred.
  // Actually, I'll use inline styles to match the project's current pattern if I can't use Tailwind.
  // Wait, the project doesn't seem to have Tailwind configured in package.json. 
  // It uses styled-jsx. I should stick to that.

  return (
    <button
      className={`aws-button variant-${variant} size-${size} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 16} />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
        </>
      )}

      <style jsx>{`
        .aws-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 500;
          transition: all 0.15s ease;
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
        }

        .aws-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Variants */
        .variant-primary {
          background: #1a1f28;
          color: #f1f5f9;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .variant-primary:hover:not(:disabled) {
          background: #242b36;
          border-color: #0ea5e9;
          color: #0ea5e9;
        }

        .variant-secondary {
          background: rgba(255, 255, 255, 0.04);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .variant-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          color: #f1f5f9;
          border-color: rgba(255, 255, 255, 0.15);
        }

        .variant-outline {
          background: transparent;
          color: #0ea5e9;
          border: 1px solid rgba(14, 165, 233, 0.4);
        }
        .variant-outline:hover:not(:disabled) {
          background: rgba(14, 165, 233, 0.08);
          border-color: #0ea5e9;
        }

        .variant-accent {
          background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
        }
        .variant-accent:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(14, 165, 233, 0.3);
        }

        .variant-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .variant-danger:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.15);
          border-color: #ef4444;
        }

        .variant-ghost {
          background: transparent;
          color: #64748b;
          border: 1px solid transparent;
        }
        .variant-ghost:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.04);
          color: #f1f5f9;
        }

        /* Sizes */
        .size-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
        .size-md {
          padding: 10px 18px;
          font-size: 14px;
        }
        .size-lg {
          padding: 14px 24px;
          font-size: 16px;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};
