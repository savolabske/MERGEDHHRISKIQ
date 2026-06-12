"use client";

import * as React from "react";

import { cn } from "./utils";

type TableDensity = "compact" | "standard" | "entity" | "narrative";
type TableCellRole = "default" | "primary" | "supporting" | "metadata" | "numeric" | "action";

const TableDensityContext = React.createContext<TableDensity>("standard");

const densityCellClasses: Record<TableDensity, string> = {
  compact: "h-10 px-3 py-2",
  standard: "h-12 px-3 py-2.5",
  entity: "min-h-14 px-4 py-3",
  narrative: "min-h-[68px] px-4 py-3.5",
};

const cellRoleClasses: Record<TableCellRole, string> = {
  default: "text-foreground",
  primary: "text-foreground font-medium",
  supporting: "text-[13px] leading-[18px] text-muted-foreground",
  metadata: "text-xs leading-4 text-text-subtle whitespace-nowrap",
  numeric: "text-right text-foreground font-medium tabular-nums whitespace-nowrap",
  action: "text-right whitespace-nowrap",
};

function Table({
  className,
  density = "standard",
  ...props
}: React.ComponentProps<"table"> & { density?: TableDensity }) {
  return (
    <TableDensityContext.Provider value={density}>
      <div
        data-slot="table-container"
        className="relative w-full overflow-x-auto"
      >
        <table
          data-slot="table"
          data-density={density}
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        />
      </div>
    </TableDensityContext.Provider>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-surface-row-hover data-[state=selected]:bg-primary-subtle border-b transition-colors duration-150",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-muted-foreground h-10 px-3 text-left align-middle text-xs leading-4 font-semibold tracking-[0.01em] whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({
  className,
  cellRole = "default",
  ...props
}: React.ComponentProps<"td"> & { cellRole?: TableCellRole }) {
  const density = React.useContext(TableDensityContext);

  return (
    <td
      data-slot="table-cell"
      data-cell-role={cellRole}
      className={cn(
        "text-sm leading-5 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        densityCellClasses[density],
        cellRoleClasses[cellRole],
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
export type { TableCellRole, TableDensity };
