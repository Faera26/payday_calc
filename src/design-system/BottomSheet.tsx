"use client";

import { X } from "@phosphor-icons/react";
import type { ReactNode } from "react";

type BottomSheetProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

export const BottomSheet = ({
  children,
  isOpen,
  onClose,
  title,
}: BottomSheetProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/28 px-3 pb-3 backdrop-blur-xl sm:items-center">
      <button
        aria-label="Закрыть"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <section className="ios-panel relative z-10 max-h-[92dvh] w-full max-w-xl translate-y-0 overflow-y-auto p-3 premium-motion">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            aria-label="Закрыть"
            className="grid size-10 place-items-center rounded-[8px] bg-slate-100 text-slate-700 premium-motion active:scale-[0.96]"
            onClick={onClose}
            type="button"
          >
            <X size={18} weight="light" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
};
