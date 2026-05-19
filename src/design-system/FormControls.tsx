import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

type FieldShellProps = {
  children: ReactNode;
  label: string;
};

const FieldShell = ({ children, label }: FieldShellProps) => (
  <label className="grid gap-1">
    <span className="text-sm font-medium text-slate-500">{label}</span>
    {children}
  </label>
);

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export const TextField = ({ label, ...props }: TextFieldProps) => (
  <FieldShell label={label}>
    <input
      className="h-12 rounded-[8px] border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none premium-motion focus:border-slate-950"
      {...props}
    />
  </FieldShell>
);

type MoneyFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type" | "value"
> & {
  label: string;
  onValueChange: (value: number) => void;
  value: number;
};

export const MoneyField = ({
  label,
  onValueChange,
  value,
  ...props
}: MoneyFieldProps) => (
  <FieldShell label={label}>
    <input
      className="h-12 rounded-[8px] border border-slate-200 bg-white px-3 text-base font-semibold text-slate-950 outline-none premium-motion focus:border-slate-950"
      inputMode="numeric"
      min={0}
      onChange={(event) => onValueChange(Number(event.target.value || 0))}
      type="number"
      value={Number.isFinite(value) ? value : 0}
      {...props}
    />
  </FieldShell>
);

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export const SelectField = ({ children, label, ...props }: SelectFieldProps) => (
  <FieldShell label={label}>
    <select
      className="h-12 rounded-[8px] border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none premium-motion focus:border-slate-950"
      {...props}
    >
      {children}
    </select>
  </FieldShell>
);

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export const PrimaryButton = ({
  children,
  type = "submit",
  ...props
}: PrimaryButtonProps) => (
  <button
    className="flex h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white premium-motion active:scale-[0.98]"
    type={type}
    {...props}
  >
    {children}
  </button>
);
