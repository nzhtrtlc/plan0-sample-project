import type { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", children, ...props }: ButtonProps) {
   return (
      <button
         className={twMerge(
            `inline-flex items-center justify-center
        h-10 rounded-md px-4 text-sm font-medium
        bg-blue-800 text-white
        hover:bg-blue-900
        transition-colors cursor-pointer

        focus:outline-none focus:ring-2 focus:ring-blue-500
        focus:ring-offset-2 focus:ring-offset-white

        disabled:cursor-not-allowed disabled:opacity-50

        dark:bg-gray-800
        dark:hover:bg-gray-600
        dark:focus:ring-gray-700
        dark:focus:ring-offset-gray-900`,
            className,
         )}
         {...props}
      >
         {children}
      </button>
   );
}
