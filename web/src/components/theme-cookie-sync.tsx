"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeCookieSync() {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme) {
      document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [theme]);

  return null;
}
