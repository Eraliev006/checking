"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "light" ? "🌙" : "☀️"}
    </Button>
  );
};
