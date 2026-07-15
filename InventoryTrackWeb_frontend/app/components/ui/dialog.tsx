import React, { ReactNode } from 'react';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === DialogContent) {
              return React.cloneElement(child as React.ReactElement<any>, {
                onClose: () => onOpenChange?.(false),
              });
            }
            return child;
          })}
        </div>
      )}
    </>
  );
}

export function DialogTrigger({ onClick, children }: any) {
  return <button onClick={onClick}>{children}</button>;
}

export function DialogContent({ children, onClose, className = '', ...props }: DialogContentProps & { onClose?: () => void }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-lg max-w-md w-full mx-4 ${className}`}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props} />;
}

export function DialogTitle({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={`text-lg font-semibold ${className}`} {...props} />;
}

export function DialogFooter({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-6 py-4 border-t border-gray-200 flex justify-end gap-2 ${className}`} {...props} />;
}

export function DialogClose({ onClick, children }: any) {
  return (
    <button onClick={onClick} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
      {children}
    </button>
  );
}
