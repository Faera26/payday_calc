"use client";

import { CurrencyRub } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { formatMoney } from "@/application/budget/formatters";
import { BottomSheet } from "./BottomSheet";
import { NumberPad } from "./NumberPad";

type AmountInputProps = {
  accent?: string;
  label: string;
  onChange: (value: number) => void;
  value: number;
};

export const AmountInput = ({
  accent = "#111827",
  label,
  onChange,
  value,
}: AmountInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(String(Math.round(value)));

  useEffect(() => {
    if (!isOpen) {
      setDraft(String(Math.round(value)));
    }
  }, [isOpen, value]);

  const commit = () => {
    onChange(Number(draft || 0));
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="ios-panel flex w-full items-center justify-between gap-3 p-4 text-left premium-motion active:scale-[0.99]"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-full text-white"
            style={{ backgroundColor: accent }}
          >
            <CurrencyRub size={20} weight="light" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm text-slate-500">{label}</span>
            <span className="block truncate text-xl font-semibold text-slate-950">
              {formatMoney(value)}
            </span>
          </span>
        </span>
      </button>

      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={label}
      >
        <div className="mb-3 rounded-[8px] bg-slate-100 px-4 py-5 text-right text-4xl font-semibold">
          {formatMoney(Number(draft || 0))}
        </div>
        <NumberPad
          draft={draft}
          onCommit={commit}
          onDraftChange={setDraft}
        />
      </BottomSheet>
    </>
  );
};
