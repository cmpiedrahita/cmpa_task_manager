import { InputHTMLAttributes, forwardRef } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className = "", ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
    <input
      ref={ref}
      {...props}
      className={`px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-800 dark:text-gray-100 outline-none transition-colors
        ${error ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600 focus:border-blue-500"}
        ${className}`}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
));

Input.displayName = "Input";
export default Input;
