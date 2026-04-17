import { Provider } from "jotai";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Provider>{children}</Provider>
    </ThemeProvider>
  );
};
