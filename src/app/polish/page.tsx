import type { Metadata } from "next";

import { hasRegisteredPasskey, isAuthenticated } from "@/lib/auth";
import {
  getFrictionElements,
  getFrictionPages,
  getOverview,
  getRecentErrors,
  type FrictionElement,
  type FrictionPage,
} from "@/polish/server/queries";
import { PolishLogin } from "./login";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Polish — Friction Dashboard",
  robots: { index: false, follow: false },
};

// ── Design tokens (Vercel aesthetic) ────────────────────────────────────────
const border = "border-[#2e2e2e]";
const card = `border ${border} rounded-lg bg-[#0a0a0a]`;
const label = "text-[11px] font-medium uppercase tracking-[0.08em] text-[#666]";
const divider = `border-t ${border}`;

// ── Tooltip ──────────────────────────────────────────────────────────────────
function InfoTip({
  text,
  anchor = "center",
}: {
  text: string;
  anchor?: "left" | "center" | "right";
}) {
  const anchorClass =
    anchor === "left" ? "left-0" : anchor === "right" ? "right-0" : "left-1/2 -translate-x-1/2";
  return (
    <span className="group/tip relative ml-1 inline-flex translate-y-px cursor-help align-middle">
      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#444] text-[9px] font-bold leading-none text-[#666]">
        i
      </span>
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full ${anchorClass} z-20 mb-2 w-64 rounded-lg border border-[#2e2e2e] bg-[#111] px-3 py-2 text-left text-[12px] font-normal normal-case leading-snug tracking-normal text-[#aaa] opacity-0 shadow-2xl transition-opacity duration-150 group-hover/tip:opacity-100`}
      >
        {text}
      </span>
    </span>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────
function Stat({
  label: labelText,
  value,
  tip,
  tone = "text-white",
}: {
  label: string;
  value: number;
  tip: string;
  tone?: string;
}) {
  return (
    <div className={`${card} px-4 py-4`}>
      <div className={`text-[28px] font-semibold tabular-nums leading-none ${tone}`}>
        {value.toLocaleString()}
      </div>
      <div className={`mt-2 flex items-center ${label}`}>
        {labelText}
        <InfoTip text={tip} />
      </div>
    </div>
  );
}

// ── Table header cell ────────────────────────────────────────────────────────
function Th({
  children,
  tip,
  align = "right",
}: {
  children: React.ReactNode;
  tip: string;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`whitespace-nowrap py-2.5 ${
        align === "left" ? "pl-5 pr-6 text-left" : "px-4 text-right"
      } ${label}`}
    >
      <span className="inline-flex items-center gap-0.5">
        {children}
        <InfoTip text={tip} anchor={align === "left" ? "left" : "right"} />
      </span>
    </th>
  );
}

// ── Score colour ─────────────────────────────────────────────────────────────
function scoreTone(score: number) {
  if (score >= 10) return "text-red-500";
  if (score >= 4) return "text-[#f5a623]";
  return "text-[#0cce6b]";
}

// ── Rows ─────────────────────────────────────────────────────────────────────
function FrictionRow({ page }: { page: FrictionPage }) {
  return (
    <tr className={divider}>
      <td className="py-2.5 pl-5 pr-6 font-mono text-[13px] text-[#ccc]">{page.path}</td>
      <td className={`py-2.5 px-4 text-right text-[13px] font-semibold tabular-nums ${scoreTone(page.score)}`}>
        {page.score}
      </td>
      <td className="py-2.5 px-4 text-right text-[13px] tabular-nums text-[#888]">{page.sessions}</td>
      <td className="py-2.5 px-4 text-right text-[13px] tabular-nums text-[#888]">{page.rageClicks}</td>
      <td className="py-2.5 px-4 text-right text-[13px] tabular-nums text-[#888]">{page.deadClicks}</td>
      <td className="py-2.5 px-4 text-right text-[13px] tabular-nums text-[#888]">{page.jsErrors}</td>
      <td className="py-2.5 pl-4 pr-5 text-right text-[13px] tabular-nums text-[#888]">
        {page.avgScrollDepth === null ? "—" : `${page.avgScrollDepth}%`}
      </td>
    </tr>
  );
}

function ElementRow({ el }: { el: FrictionElement }) {
  return (
    <tr className={`${divider} align-top`}>
      <td className="py-2.5 pl-5 pr-6">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-white">{el.label}</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
              el.isComponent
                ? "bg-blue-950 text-blue-400"
                : "bg-[#1a1a1a] text-[#555]"
            }`}
          >
            {el.isComponent ? "component" : "selector"}
          </span>
        </div>
        {el.sampleText && (
          <div className="mt-0.5 font-mono text-[11px] text-[#555]">"{el.sampleText}"</div>
        )}
        {el.isComponent && el.selector && (
          <div className="mt-0.5 font-mono text-[11px] text-[#444]">{el.selector}</div>
        )}
      </td>
      <td className={`py-2.5 px-4 text-right text-[13px] font-semibold tabular-nums ${scoreTone(el.score)}`}>
        {el.score}
      </td>
      <td className="py-2.5 px-4 text-right text-[13px] tabular-nums text-[#888]">{el.clicks}</td>
      <td className="py-2.5 px-4 text-right text-[13px] tabular-nums text-[#888]">{el.rageClicks}</td>
      <td className="py-2.5 px-4 text-right text-[13px] tabular-nums text-[#888]">{el.deadClicks}</td>
      <td className="py-2.5 pl-4 pr-5 text-right text-[13px] tabular-nums text-[#888]">{el.pages}</td>
    </tr>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className={`mb-3 flex items-center gap-2 ${label}`}>{title}</div>
      {children}
    </section>
  );
}


// ── Page ─────────────────────────────────────────────────────────────────────
export default async function PolishDashboard() {
  if (!(await isAuthenticated())) {
    return <PolishLogin canRegister={!hasRegisteredPasskey()} />;
  }

  const overview = getOverview();
  const friction = getFrictionPages(8);
  const elements = getFrictionElements(12);
  const errors = getRecentErrors(8);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-white">
      {/* Header */}
      <div className={`mb-8 flex items-start justify-between border-b ${border} pb-6`}>
        <div>
          <p className={label}>Polish</p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-white">
            Friction Dashboard
          </h1>
          <p className="mt-1 text-[13px] text-[#666]">
            Stage 1 — Capture. Hover{" "}
            <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-[#444] text-[8px] font-bold text-[#666]">
              i
            </span>{" "}
            for calculation details.
          </p>
        </div>
        <div className={`rounded-full px-3 py-1 text-[11px] font-medium ${
          overview.ready
            ? "bg-emerald-950 text-emerald-400"
            : "bg-[#1a1a1a] text-[#666]"
        }`}>
          {overview.ready ? "● collecting" : "○ no store"}
        </div>
      </div>

      {!overview.ready && (
        <div className={`mb-8 rounded-lg border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-[13px] text-amber-400`}>
          The analytics store isn't writable in this environment. Run locally or configure a
          database — see <span className="font-mono text-amber-300">src/polish/DATABASE.md</span>.
        </div>
      )}

      {/* Stats */}
      <Section title="Overview">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat
            label="Sessions"
            value={overview.sessions}
            tip="Distinct anonymous visitors, counted by the polish_session cookie. One cookie = one session; no fingerprinting."
          />
          <Stat
            label="Page views"
            value={overview.pageViews}
            tip="page_view events — initial page loads plus client-side (soft) navigations between routes."
          />
          <Stat
            label="Rage clicks"
            value={overview.rageClicks}
            tone="text-red-500"
            tip="3+ clicks on the same element within 500ms. A strong signal of frustration — something looks clickable or is broken."
          />
          <Stat
            label="Dead clicks"
            value={overview.deadClicks}
            tone="text-[#f5a623]"
            tip="Clicks on non-interactive elements (no link, button, or role within 4 ancestors). Users expected something to happen but nothing did."
          />
          <Stat
            label="JS errors"
            value={overview.jsErrors}
            tone="text-red-500"
            tip="Uncaught exceptions and unhandled promise rejections, with page and component context."
          />
          <Stat
            label="Events"
            value={overview.totalEvents}
            tip="Total raw signals captured across all event types."
          />
        </div>
      </Section>

      {/* Friction pages */}
      <Section title="Top friction pages">
        <div className={card}>
          {friction.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-[#555]">
              No data yet — browse the site then refresh.
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <Th align="left" tip="The route the events were recorded on.">Path</Th>
                  <Th tip="Weighted friction: rage×3 + dead×2 + errors×2.5, plus a penalty when avg scroll depth is under 50%. Higher = worse.">Score</Th>
                  <Th tip="Distinct sessions that viewed this page.">Sessions</Th>
                  <Th tip="Rage clicks (3+ in 500ms on one element) on this page.">Rage</Th>
                  <Th tip="Dead clicks (on non-interactive elements) on this page.">Dead</Th>
                  <Th tip="JS errors thrown on this page.">Errors</Th>
                  <Th tip="Average of each session's deepest scroll on this page. Low % = content below the fold is missed.">Scroll</Th>
                </tr>
              </thead>
              <tbody>
                {friction.map((p) => <FrictionRow key={p.path} page={p} />)}
              </tbody>
            </table>
          )}
        </div>
      </Section>

      {/* Element breakdown */}
      <Section
        title={
          <>
            Interactions by element
            <InfoTip
              anchor="left"
              text="Click-type events grouped by data-component attribute when present, otherwise by DOM selector. This is which UI element the friction is on — the primary input to Stage 2 synthesis."
            />
          </>
        }
      >
        <div className={card}>
          {elements.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-[#555]">
              No interactions captured yet. Add{" "}
              <code className="font-mono text-[#777]">data-component="Name"</code> to elements
              for richer labels.
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <Th align="left" tip="Component name (from data-component) or DOM selector. Sample text and selector shown beneath.">Element</Th>
                  <Th tip="rage×3 + dead×2 for this element across all pages.">Score</Th>
                  <Th tip="Normal (non-rage, non-dead) clicks.">Clicks</Th>
                  <Th tip="Rage clicks on this element.">Rage</Th>
                  <Th tip="Dead clicks on this element.">Dead</Th>
                  <Th tip="How many distinct pages this element appeared on.">Pages</Th>
                </tr>
              </thead>
              <tbody>
                {elements.map((el) => <ElementRow key={el.label} el={el} />)}
              </tbody>
            </table>
          )}
        </div>
      </Section>

      {/* Recent errors */}
      {errors.length > 0 && (
        <Section title="Recent errors">
          <div className={card}>
            {errors.map((e, i) => (
              <div key={i} className={i > 0 ? divider : ""}>
                <div className="px-5 py-3">
                  <div className="font-mono text-[13px] text-red-400">{e.message}</div>
                  <div className="mt-0.5 text-[11px] text-[#555]">
                    {e.path}
                    {e.component ? ` · ${e.component}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </main>
  );
}
