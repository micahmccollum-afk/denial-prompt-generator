"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { KeywordSelector } from "./KeywordSelector";
import { DenialReasonDisplay } from "./DenialReasonDisplay";
import type { DenialKeyword, DenialCategory } from "@/lib/denialPrompts";

export function Dashboard() {
  const [categories, setCategories] = useState<DenialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKeyword, setSelectedKeyword] = useState<DenialKeyword | null>(
    null
  );

  useEffect(() => {
    fetch("/api/denial-prompts")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="shrink-0 bg-storesight-banner px-6 py-5 text-white shadow-sm">
        <div className="mx-auto flex max-w-[1800px] w-full flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
          <Image
            src="/logo-storesight-white.svg"
            alt="Storesight"
            width={120}
            height={27}
            className="h-7 w-auto"
            priority
          />
          <div className="h-6 w-px bg-white/30" aria-hidden />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Denial Prompt Generator
            </h1>
            <p className="mt-0.5 text-sm text-white/90">
              Select a denial prompt or keyword, then copy the reason to send to agents.
            </p>
          </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-md border border-white/40 px-3 py-1.5 text-sm hover:bg-white/10"
            >
              Admin
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1800px] min-h-0 flex-1 flex-col gap-6 p-6 md:flex-row md:gap-8 md:p-8">
        {loading ? (
          <p className="text-storesight-text-muted dark:text-storesight-dark-muted">
            Loading prompts…
          </p>
        ) : (
          <>
            <section className="flex min-h-0 min-w-0 flex-1 flex-col">
              <h2 className="mb-3 text-sm font-semibold text-storesight-text dark:text-storesight-dark-text">
                Select keyword or prompt
              </h2>
              <KeywordSelector
                categories={categories}
                selectedKeywordId={selectedKeyword?.id ?? null}
                onSelect={setSelectedKeyword}
              />
            </section>

            <section className="flex min-w-0 flex-1 flex-col">
              <h2 className="mb-3 text-sm font-semibold text-storesight-text dark:text-storesight-dark-text">
                Denial reason
              </h2>
              <DenialReasonDisplay text={selectedKeyword?.template ?? null} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
