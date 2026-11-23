"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { AssistantChat } from "@/components/assistant";
import { useApp } from "@/components/providers";

function Inner() {
  const { t } = useApp();
  const q = useSearchParams().get("q") ?? undefined;
  return (
    <>
      <PageHero eyebrow={t.nav.assistant} title={t.assistant.title} lead={t.home.assistantLead} />
      <div className="container-gov -mt-10 max-w-3xl pb-16"><div className="card overflow-hidden"><AssistantChat initial={q} /></div></div>
    </>
  );
}

export default function Page() {
  return <Suspense><Inner /></Suspense>;
}
