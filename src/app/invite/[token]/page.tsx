import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Приглашение",
};

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  return (
    <main className="safe-screen grid place-items-center px-4">
      <section className="ios-panel w-full max-w-md p-5 text-center">
        <p className="text-sm font-semibold uppercase text-slate-400">
          приглашение
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Семейный бюджет</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Токен приглашения готов к обмену на членство в household после
          подключения Supabase Auth.
        </p>
        <p className="mt-4 rounded-[8px] bg-slate-100 px-3 py-2 text-sm text-slate-500">
          {token}
        </p>
        <Link
          className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 font-semibold text-white premium-motion active:scale-[0.98]"
          href="/dashboard"
        >
          Открыть приложение
        </Link>
      </section>
    </main>
  );
}
