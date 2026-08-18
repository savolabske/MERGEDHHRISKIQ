import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-input placeholder:text-text-subtle hover:border-border-muted focus-visible:border-primary focus:shadow-none focus-visible:shadow-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-20 w-full rounded-md border bg-input-background px-3 py-2 text-sm leading-[22px] transition-[color,border-color] duration-150 outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-text-subtle disabled:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
