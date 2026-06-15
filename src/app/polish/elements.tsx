"use client";

/**
 * Polish — "Interactions by element" body (client).
 *
 * Renders the element rows for the friction-by-element table, collapsed to the
 * three most recently interacted-with elements by default with a "Show more"
 * toggle to reveal the rest. Lives in its own client component so the toggle is
 * interactive while the surrounding dashboard stays a server component.
 *
 * Returns a <tbody>/<tfoot> fragment so it slots straight into the table whose
 * <thead> is rendered by the server page.
 */
import { useState } from "react";

import type { FrictionElement } from "@/polish/server/queries";

const border = "border-[#2e2e2e]";
const divider = `border-t ${border}`;

/** Number of elements shown before "Show more" is needed. */
const COLLAPSED_COUNT = 3;

function scoreTone(score: number) {
  if (score >= 10) return "text-red-500";
  if (score >= 4) return "text-[#f5a623]";
  return "text-[#0cce6b]";
}

function ElementRow({ el }: { el: FrictionElement }) {
  return (
    <tr className={`${divider} align-top`}>
      <td className="py-2.5 pl-5 pr-6">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-white">{el.label}</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
              el.isComponent ? "bg-blue-950 text-blue-400" : "bg-[#1a1a1a] text-[#555]"
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
      <td className="py-2.5 px-4 text-right text-[13px] tabular-nums text-[#888]">
        {el.hovers > 0 ? el.hovers : <span className="text-[#444]">—</span>}
      </td>
      <td className="py-2.5 pl-4 pr-5 text-right text-[13px] tabular-nums text-[#888]">{el.pages}</td>
    </tr>
  );
}

export default function ElementsTableBody({ elements }: { elements: FrictionElement[] }) {
  const [expanded, setExpanded] = useState(false);
  const hidden = elements.length - COLLAPSED_COUNT;
  const shown = expanded ? elements : elements.slice(0, COLLAPSED_COUNT);

  return (
    <>
      <tbody>
        {shown.map((el) => (
          <ElementRow key={el.label} el={el} />
        ))}
      </tbody>
      {hidden > 0 && (
        <tfoot>
          <tr className={divider}>
            <td colSpan={7} className="px-5 py-2.5 text-center">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="text-[12px] font-medium text-[#888] transition-colors hover:text-white"
              >
                {expanded ? "Show less" : `Show ${hidden} more`}
              </button>
            </td>
          </tr>
        </tfoot>
      )}
    </>
  );
}
