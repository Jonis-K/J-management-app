type Props = {
  title: string;
};

export default function PageHeader({ title }: Props) {
  return (
    <div className="border-b border-sky-100 pb-4 mb-6">
      <h1 className="text-2xl font-bold text-sky-950">{title}</h1>
    </div>
  );
}
