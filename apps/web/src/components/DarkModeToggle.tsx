import { useState } from "react";
import { Button } from "./Button";

export function DarkModeToggle() {
   const [isDark, setDark] = useState(
      document.documentElement.classList.contains("dark"),
   );

   function toggleDarkMode() {
      const root = document.documentElement;
      const next = root.classList.toggle("dark");

      localStorage.setItem("theme", next ? "dark" : "light");
      setDark(next);
   }

   return (
      <Button
         type="button"
         onClick={toggleDarkMode}
         className="text-xs dark:bg-gray-800"
      >
         Turn lights {isDark ? "ON" : "OFF"}
      </Button>
   );
}
