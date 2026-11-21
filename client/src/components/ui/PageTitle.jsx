export default function PageTitle({ title, subtitle, extra }) {
  return <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
    <div><h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      {subtitle && <p className="mb-0 mt-2 text-sm text-slate-500 sm:text-base">{subtitle}</p>}</div>
    {extra}
  </div>;
}