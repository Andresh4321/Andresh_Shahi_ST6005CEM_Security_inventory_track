import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

export function Table({ className = '', ...props }: TableProps) {
  return (
    <table
      className={`w-full text-sm border-collapse ${className}`}
      {...props}
    />
  );
}

export function TableHeader({ className = '', ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`bg-gray-100 border-b border-gray-200 ${className}`} {...props} />
  );
}

export function TableBody({ className = '', ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />;
}

export function TableRow({ className = '', ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`border-b border-gray-200 hover:bg-gray-50 ${className}`} {...props} />
  );
}

export function TableHead({ className = '', ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-4 py-2 text-left font-semibold text-gray-700 ${className}`} {...props} />
  );
}

export function TableCell({ className = '', ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-4 py-2 text-gray-700 ${className}`} {...props} />;
}
