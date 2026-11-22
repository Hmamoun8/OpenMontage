import { Flag } from "./brand";

export function PageHero({ eyebrow, title, lead, children }: { eyebrow?: string; title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-navy-700 pb-16 pt-36 text-white">
      <div className="pattern absolute inset-0 opacity-[.12]" />
      <div className="absolute -top-40 end-[-10%] h-[480px] w-[480px] rounded-full bg-emerald-500/30 blur-3xl" />
      <div className="absolute bottom-[-40%] start-[-10%] h-[400px] w-[400px] rounded-full bg-gold-500/20 blur-3xl" />
      <div className="container-gov relative">
        {eyebrow && <div className="eyebrow mb-4 !text-gold-300"><Flag className="h-3 w-auto" />{eyebrow}</div>}
        <h1 className="h-display max-w-4xl animate-rise">{title}</h1>
        {lead && <p className="mt-5 max-w-2xl text-lg text-white/75 animate-rise [animation-delay:.1s]">{lead}</p>}
        {children && <div className="mt-8 animate-rise [animation-delay:.2s]">{children}</div>}
      </div>
    </section>
  );
}
