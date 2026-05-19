"use client";

import { Backspace, Check } from "@phosphor-icons/react";

const padItems = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0"];

type NumberPadProps = {
  draft: string;
  onCommit: () => void;
  onDraftChange: (nextDraft: string) => void;
};

export const NumberPad = ({
  draft,
  onCommit,
  onDraftChange,
}: NumberPadProps) => {
  const append = (chunk: string) => {
    const nextDraft = `${draft}${chunk}`.replace(/^0+(?=\d)/, "").slice(0, 9);
    onDraftChange(nextDraft);
  };

  const removeLast = () => {
    onDraftChange(draft.slice(0, -1));
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {padItems.map((item) => (
        <button
          className="h-16 rounded-[8px] bg-slate-100 text-2xl font-semibold text-slate-950 premium-motion active:scale-[0.98]"
          key={item}
          onClick={() => append(item)}
          type="button"
        >
          {item}
        </button>
      ))}
      <button
        aria-label="Удалить цифру"
        className="grid h-16 place-items-center rounded-[8px] bg-slate-100 text-slate-950 premium-motion active:scale-[0.98]"
        onClick={removeLast}
        type="button"
      >
        <Backspace size={24} weight="light" />
      </button>
      <button
        className="col-span-2 flex h-16 items-center justify-center gap-2 rounded-[8px] bg-slate-950 text-base font-semibold text-white premium-motion active:scale-[0.98]"
        onClick={onCommit}
        type="button"
      >
        <Check size={22} weight="light" />
        Готово
      </button>
    </div>
  );
};
