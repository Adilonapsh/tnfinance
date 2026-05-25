"use client";

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="fintrack-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export { ThemeProvider };

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  const toggleTheme = () => {
    console.log('toggleTheme called. Current resolvedTheme:', resolvedTheme);
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    console.log('Setting theme to:', next);
    setTheme(next);
  };

  return { theme, setTheme, resolvedTheme, toggleTheme };
}
