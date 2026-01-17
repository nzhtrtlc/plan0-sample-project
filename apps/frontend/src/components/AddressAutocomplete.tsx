import { useAsyncDebouncer } from "@tanstack/react-pacer/async-debouncer";
import { useEffect, useRef, useState } from "react";
import { placesApiRequest } from "../utils/actions";
import { Input } from "./Input";

interface PlacePrediction {
   description: string;
   place_id: string;
}

interface AddressAutocompleteProps {
   value: string;
   onChange: (value: string) => void;
   onSelect?: (placeId: string, description: string) => void;
   disabled?: boolean;
   placeholder?: string;
   tabIndex?: number;
   id?: string;
   name?: string;
}

export function AddressAutocomplete({
   value,
   onChange,
   onSelect,
   disabled = false,
   placeholder = "Start typing an address...",
   tabIndex,
   id,
   name,
}: AddressAutocompleteProps) {
   const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
   const [showDropdown, setShowDropdown] = useState(false);
   const [selectedIndex, setSelectedIndex] = useState(-1);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);

   // Debouncer instance - 300ms
   const fetchDebouncer = useAsyncDebouncer(
      async (input: string) => {
         try {
            const response = await placesApiRequest(input);

            if (!response.ok) {
               throw new Error("Failed to fetch suggestions");
            }

            const data = await response.json();
            setSuggestions(data.predictions || []);
            setShowDropdown(true);
         } catch (error) {
            console.error("Error fetching address suggestions:", error);
            setSuggestions([]);
         }
      },
      { wait: 300 },
      (state) => ({
         isExecuting: state.isExecuting,
         isPending: state.isPending,
      }),
   );

   const isLoading =
      fetchDebouncer.state.isExecuting || fetchDebouncer.state.isPending;

   useEffect(() => {
      if (!value) {
         setSuggestions([]);
         setShowDropdown(false);
         fetchDebouncer.cancel();
      }
   }, [value, fetchDebouncer]);

   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node) &&
            inputRef.current &&
            !inputRef.current.contains(event.target as Node)
         ) {
            setShowDropdown(false);
         }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
      setSelectedIndex(-1);

      if (newValue.length >= 3) {
         fetchDebouncer.maybeExecute(newValue);
      } else {
         setSuggestions([]);
         setShowDropdown(false);
         fetchDebouncer.cancel();
      }
   };

   const handleSelect = (prediction: PlacePrediction) => {
      fetchDebouncer.cancel();
      onChange(prediction.description);
      setSuggestions([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
      onSelect?.(prediction.place_id, prediction.description);
   };

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown || suggestions.length === 0) return;

      switch (e.key) {
         case "ArrowDown":
            e.preventDefault();
            setSelectedIndex((prev) =>
               prev < suggestions.length - 1 ? prev + 1 : prev,
            );
            break;
         case "ArrowUp":
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
            break;
         case "Enter":
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
               handleSelect(suggestions[selectedIndex]);
            }
            break;
         case "Escape":
            setShowDropdown(false);
            setSelectedIndex(-1);
            break;
      }
   };

   return (
      <div className="relative">
         <div className="relative">
            <Input
               ref={inputRef}
               id={id}
               name={name}
               type="text"
               value={value}
               onChange={handleInputChange}
               onKeyDown={handleKeyDown}
               onFocus={() => {
                  if (suggestions.length > 0) {
                     setShowDropdown(true);
                  }
               }}
               disabled={disabled}
               placeholder={placeholder}
               tabIndex={tabIndex}
               autoComplete="off"
            />
            {isLoading && (
               <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
               </div>
            )}
         </div>

         {showDropdown && suggestions.length > 0 && (
            <div
               ref={dropdownRef}
               className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
            >
               {suggestions.map((prediction, index) => (
                  <button
                     key={prediction.place_id}
                     type="button"
                     onClick={() => handleSelect(prediction)}
                     onMouseEnter={() => setSelectedIndex(index)}
                     className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                        index === selectedIndex
                           ? "bg-gray-100 dark:bg-gray-700"
                           : ""
                     }`}
                  >
                     <div className="flex items-start gap-2">
                        <svg
                           className="w-5 h-5 mt-0.5 text-gray-400 dark:text-gray-500 shrink-0"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <title>Geo Marker Icon</title>
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                           />
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                           />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                           {prediction.description}
                        </span>
                     </div>
                  </button>
               ))}
            </div>
         )}
      </div>
   );
}
