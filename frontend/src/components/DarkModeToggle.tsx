
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/useDarkMode";

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      aria-label="Toggle dark mode"
      className="text-blockloan-gray hover:text-blockloan-blue dark:text-gray-300 dark:hover:text-white"
    >
      {isDarkMode ? (
        <Sun size={20} className="text-blockloan-gold" />
      ) : (
        <Moon size={20} />
      )}
    </Button>
  );
};

export default DarkModeToggle;
