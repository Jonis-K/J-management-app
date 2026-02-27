import PageHeader from "@/components/PageHeader";
import OrgTreeClient from "@/components/OrgTreeClient";

export const dynamic = "force-dynamic";

async function getMembers() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/members`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function OrgPage() {
  const members = await getMembers();

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <PageHeader title="組織図" />
        <div className="text-sm text-neutral-500">
          メンバー数: <span className="font-medium text-neutral-900">{members.length}</span>
        </div>
      </div>

      <OrgTreeClient members={members} />
    </main>
  );
}
