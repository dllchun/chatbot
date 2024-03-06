import { useTheme } from "next-themes";
import React from "react";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full"
      onClick={() => {
        if (theme === "dark") {
          setTheme("light");
        } else {
          setTheme("dark");
        }
      }}
    >
      <div className="relative h-[1.2rem] w-[1.2rem] items-center justify-center">
        <Sun className="absolute inset-0 h-[1.2rem] w-[1.2rem] origin-center transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute inset-0 h-[1.2rem] w-[1.2rem] origin-center scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      <span className="sr-only">Toggle Them</span>
    </Button>
  );
};

export default ThemeToggleButton;
