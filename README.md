# Семейный бюджет PWA

Мобильное PWA для семейного бюджета: расчет честного коэффициента после личных обязательных платежей, календарный cashflow, фонды, цели накопления и Supabase-ready инвайт второго участника.

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000/dashboard`.

## Supabase

1. Создайте проект в Supabase.
2. Выполните SQL из `supabase/schema.sql`.
3. Скопируйте `.env.local.example` в `.env.local`.
4. Заполните:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Проверки

```bash
npm run lint
npm run typecheck
npm run audit
npm run build
```

`npm run audit` настроен на `--audit-level=high`.

## Деплой на Vercel

1. Запушьте проект в GitHub.
2. Импортируйте репозиторий в Vercel.
3. Добавьте переменные окружения Supabase.
4. Deploy command: `npm run build`.
5. Output framework: Next.js.
