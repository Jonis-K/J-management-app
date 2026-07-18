import PageHeader from "@/components/PageHeader";

export default function CalendarPage() {
  // 環境変数 GOOGLE_CALENDAR_EMBED_URL に社内カレンダーの埋め込みURLを設定してください。
  // 未設定の間は日本の祝日カレンダーを仮表示します。
  const calendarEmbedUrl =
    process.env.GOOGLE_CALENDAR_EMBED_URL ||
    "https://calendar.google.com/calendar/embed?src=ja.japanese%23holiday%40group.v.calendar.google.com&ctz=Asia%2FTokyo";

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6 pb-20">
      <div>
        <PageHeader title="カレンダー" />
        <p className="mt-2 text-sm text-neutral-500">
          社内の予定や日本の祝日を確認できます。
        </p>
      </div>

      <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border bg-white sm:aspect-[4/3] md:aspect-video">
        <iframe
          src={calendarEmbedUrl}
          className="h-full w-full border-0"
          title="Google Calendar"
        />
      </div>
    </main>
  );
}
