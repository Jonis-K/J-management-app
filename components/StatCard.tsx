type Props = {
  label: string;
  value: string | number;
};

export default function StatCard({ label, value }: Props) {
  return (
    <div className="rounded-xl border border-sky-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="text-sm font-medium text-sky-600">{label}</div>
      <div className="mt-2 text-3xl font-bold text-sky-950">{value}</div>
    </div>
  );
}
