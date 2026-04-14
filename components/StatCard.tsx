import { ReactNode } from "react";

type Props = {
  label: string;
  value: string | number;
  icon?: ReactNode;
};

export default function StatCard({ label, value, icon }: Props) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div>
        <div className="text-sm font-medium text-sky-600/80">{label}</div>
        <div className="mt-1 text-3xl font-extrabold text-sky-950">{value}</div>
      </div>
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-500">
          {icon}
        </div>
      )}
    </div>
  );
}
