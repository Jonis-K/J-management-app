type Props = {
  title: string;
};

export default function PageHeader({ title }: Props) {
  return (
    <div className="border-b border-black/10 pb-3">
      <h1 className="text-xl font-semibold">{title}</h1>
    </div>
  );
}
