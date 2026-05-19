"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, PaperPlaneTilt } from "@phosphor-icons/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  inviteSchema,
  type InviteFormValues,
} from "@/application/household/inviteSchema";
import { createInviteLink } from "@/domain/household/createInviteLink";
import { hasSupabaseConfig } from "@/infrastructure/supabase/browserClient";

const createToken = () => crypto.randomUUID().replaceAll("-", "").slice(0, 24);

export const InvitePartnerCard = () => {
  const [inviteLink, setInviteLink] = useState("");
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
  });

  const submit = (values: InviteFormValues) => {
    const token = createToken();
    const origin = window.location.origin;
    setInviteLink(createInviteLink(origin, token));
    console.info("Invite prepared for", values.email);
  };

  const copyInvite = async () => {
    if (!inviteLink) {
      return;
    }

    await navigator.clipboard.writeText(inviteLink);
  };

  return (
    <section className="ios-panel scroll-fade-in p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Инвайт супруга</h2>
          <p className="mt-1 text-sm text-slate-500">
            Supabase {hasSupabaseConfig ? "готов к подключению" : "ждет ключи"}
          </p>
        </div>
        <span className="grid size-11 place-items-center rounded-full bg-slate-950 text-white">
          <PaperPlaneTilt size={21} weight="light" />
        </span>
      </div>

      <form className="grid gap-3" onSubmit={handleSubmit(submit)}>
        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-500">Email</span>
          <input
            className="h-13 rounded-[8px] border border-slate-200 bg-white px-4 text-base outline-none premium-motion focus:border-slate-950"
            placeholder="partner@example.com"
            type="email"
            {...register("email")}
          />
          {errors.email ? (
            <span className="text-sm text-red-600">{errors.email.message}</span>
          ) : null}
        </label>
        <button
          className="flex h-13 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 font-semibold text-white premium-motion active:scale-[0.98]"
          type="submit"
        >
          <PaperPlaneTilt size={20} weight="light" />
          Создать приглашение
        </button>
      </form>

      {inviteLink ? (
        <button
          className="mt-4 flex w-full items-center justify-between gap-3 rounded-[8px] bg-slate-100 p-3 text-left text-sm premium-motion active:scale-[0.99]"
          onClick={copyInvite}
          type="button"
        >
          <span className="truncate">{inviteLink}</span>
          <Copy className="shrink-0" size={20} weight="light" />
        </button>
      ) : null}
    </section>
  );
};
