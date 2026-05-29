"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const currentTheme = mounted ? theme : "system";

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-btn border border-border bg-card hover:bg-muted transition-colors text-foreground dark:bg-background dark:border-border dark:hover:bg-muted dark:text-foreground relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <Sun className={`absolute h-4 w-4 transition-all ${currentTheme === 'light' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'}`} />
      <Moon className={`absolute h-4 w-4 transition-all ${currentTheme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`} />
      <Monitor className={`absolute h-4 w-4 transition-all ${currentTheme === 'system' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`} />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
