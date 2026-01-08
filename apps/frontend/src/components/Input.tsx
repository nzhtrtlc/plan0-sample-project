import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          h-10 w-full rounded-md border px-3 text-sm
          bg-white text-gray-900 border-gray-300
          placeholder:text-gray-400

          focus:outline-none focus:ring-2 focus:ring-blue-500
          focus:ring-offset-2 focus:ring-offset-white

          disabled:cursor-not-allowed disabled:opacity-50

          dark:bg-gray-900
          dark:text-gray-100
          dark:border-gray-700
          dark:placeholder:text-gray-500
          dark:focus:ring-blue-400
          dark:focus:ring-offset-gray-900

          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
