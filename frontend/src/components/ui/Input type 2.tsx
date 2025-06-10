import React from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    const inputWrapperStyles = 'relative';
    const inputStyles = twMerge(
      'w-full px-4 py-2 rounded-md border transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      error
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-300 dark:border-gray-600',
      icon && 'pl-10',
      className
    );

    const labelStyles = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
    const errorStyles = 'text-sm text-red-500 mt-1';
    const iconStyles = 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400';

    return (
      <div className="space-y-1">
        {label && <label className={labelStyles}>{label}</label>}
        <div className={inputWrapperStyles}>
          {icon && <span className={iconStyles}>{icon}</span>}
          <input ref={ref} className={inputStyles} {...props} />
        </div>
        {error && <p className={errorStyles}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 