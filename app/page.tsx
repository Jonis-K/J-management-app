import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Members" value="—" />
        <StatCard label="Goals" value="—" />
        <StatCard label="Links" value="—" />
      </div>
      <div className="rounded-md border border-black/10 p-4 text-sm text-black/70">
        ダミーコンテンツ：ここに概要や最新情報などを表示します
      </div>
    </div>
  );
}
