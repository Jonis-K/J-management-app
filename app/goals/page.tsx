import PageHeader from "@/components/PageHeader";
import GoalsTableClient from "@/components/GoalsTableClient";

export const dynamic = "force-dynamic";

async function getGoals() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/goals`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function GoalsPage() {
  const goals = await getGoals();

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <PageHeader title="目標管理" />
        <div className="text-sm text-neutral-500">
          件数: <span className="font-medium text-neutral-900">{goals.length}</span>
        </div>
      </div>

      <GoalsTableClient goals={goals} />
    </main>
  );
}
