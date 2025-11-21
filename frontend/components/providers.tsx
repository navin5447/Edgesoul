"use client";

import React, { ReactNode } from "react";
import { LocalAuthProvider } from "@/context/LocalAuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LocalAuthProvider>
        {children}
      </LocalAuthProvider>
    </ThemeProvider>
  );
}
