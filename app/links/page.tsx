import PageHeader from "@/components/PageHeader";
import LinksTabsClient from "@/components/LinksTabsClient";

export const dynamic = "force-dynamic";

async function getLinks() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/links`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function LinksPage() {
  const links = await getLinks();

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <PageHeader title="リンク集" />
        <div className="text-sm text-neutral-500">
          件数: <span className="font-medium text-neutral-900">{links.length}</span>
        </div>
      </div>

      <LinksTabsClient links={links} />
    </main>
  );
}
