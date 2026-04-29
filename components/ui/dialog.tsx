"use client";

import { ReactNode } from "react";

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-[#d5d8db] px-6 py-4">
      {children}
    </div>
  );
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold text-[#2a2f35]">{children}</h2>;
}

export function DialogClose({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[#66707a] hover:text-[#2a2f35] text-2xl leading-none"
    >
      ×
    </button>
  );
}

export function DialogContent({ children }: { children: ReactNode }) {
  return <div className="px-6 py-4">{children}</div>;
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <div className="border-t border-[#d5d8db] px-6 py-4 flex gap-3 justify-end">
      {children}
    </div>
  );
}
