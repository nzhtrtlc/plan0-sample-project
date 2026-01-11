type FieldProps = {
   label: string;
   id: string;
   error?: string;
   children: React.ReactNode;
};

export function FormField({ label, id, error, children }: FieldProps) {
   return (
      <div className="flex flex-col gap-1">
         <label
            htmlFor={id}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
         >
            {label}
         </label>
         {children}
         {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
      </div>
   );
}
