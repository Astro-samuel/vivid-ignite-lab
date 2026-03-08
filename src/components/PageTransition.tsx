import { type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Routes } from "react-router-dom";

export default function PageTransition({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
