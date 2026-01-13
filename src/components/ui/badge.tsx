import * as React from "react";

import { cn } from "@/lib/utils";

export const Badge = ({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline" | "soft";
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
      variant === "default" && "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
      variant === "outline" &&
        "border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300",
      variant === "soft" && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200",
      className
    )}
    {...props}
  />
);
