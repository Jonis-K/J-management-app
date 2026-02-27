import PageHeader from "@/components/PageHeader";

export default function CalendarPage() {
  // Google Calendar Embed URL (仮)
  // 実際には設定済みのカレンダーID等に差し替えてください
  const calendarEmbedUrl = "https://calendar.google.com/calendar/embed?src=ja.japanese%23holiday%40group.v.calendar.google.com&ctz=Asia%2FTokyo";

  return (
    <main className="flex flex-col gap-6">
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
