"use client";

import cn from "classnames";

export type FormatState = {
  block: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  ul: boolean;
  ol: boolean;
};

type Props = {
  state: FormatState;
  onInline: (command: string) => void;
  onBlock: (tag: string) => void;
  onList: (command: string) => void;
  onClose: () => void;
};

/** Keep the editor's text selection alive while clicking menu buttons. */
const keepSelection = (e: React.MouseEvent) => e.preventDefault();

function InlineButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={keepSelection}
      onClick={onClick}
      className={cn(
        "flex h-8 w-9 items-center justify-center rounded-lg text-[17px]",
        active
          ? "bg-black/10 dark:bg-white/15"
          : "hover:bg-black/5 dark:hover:bg-white/5",
      )}
    >
      {children}
    </button>
  );
}

export function FormatMenu({ state, onInline, onBlock, onList, onClose }: Props) {
  const isList = state.ul || state.ol;

  const blockItems: {
    label: string;
    className: string;
    active: boolean;
    apply: () => void;
  }[] = [
    {
      label: "Title",
      className: "text-[22px] font-bold",
      active: !isList && state.block === "h1",
      apply: () => onBlock("h1"),
    },
    {
      label: "Heading",
      className: "text-[17px] font-bold",
      active: !isList && state.block === "h2",
      apply: () => onBlock("h2"),
    },
    {
      label: "Subheading",
      className: "text-[15px] font-semibold",
      active: !isList && state.block === "h3",
      apply: () => onBlock("h3"),
    },
    {
      label: "Body",
      className: "text-[15px]",
      active: !isList && (state.block === "p" || state.block === ""),
      apply: () => onBlock("p"),
    },
    {
      label: "Monostyled",
      className: "font-mono text-[14px]",
      active: !isList && state.block === "pre",
      apply: () => onBlock("pre"),
    },
    {
      label: "• Bulleted List",
      className: "text-[15px]",
      active: state.ul,
      apply: () => onList("insertUnorderedList"),
    },
    {
      label: "– Dashed List",
      className: "text-[15px]",
      active: false,
      apply: () => onList("insertUnorderedList"),
    },
    {
      label: "1. Numbered List",
      className: "text-[15px]",
      active: state.ol,
      apply: () => onList("insertOrderedList"),
    },
  ];

  return (
    <>
      {/* Click-away backdrop */}
      <span className="fixed inset-0 z-10 block" onClick={onClose} />
      <span className="absolute left-1/2 top-full z-20 mt-2 block w-64 -translate-x-1/2 rounded-2xl border border-black/10 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-[#262626]/95">
        <span className="flex items-center gap-0.5 px-1 pb-2">
          <InlineButton
            label="Bold"
            active={state.bold}
            onClick={() => onInline("bold")}
          >
            <span className="font-bold">B</span>
          </InlineButton>
          <InlineButton
            label="Italic"
            active={state.italic}
            onClick={() => onInline("italic")}
          >
            <span className="italic">I</span>
          </InlineButton>
          <InlineButton
            label="Underline"
            active={state.underline}
            onClick={() => onInline("underline")}
          >
            <span className="underline">U</span>
          </InlineButton>
          <InlineButton
            label="Strikethrough"
            active={state.strike}
            onClick={() => onInline("strikeThrough")}
          >
            <span className="line-through">S</span>
          </InlineButton>
          <span className="mx-1 h-5 w-px bg-black/10 dark:bg-white/15" />
          <span
            className="flex h-8 w-9 cursor-not-allowed items-center justify-center text-[15px] opacity-40"
            title="Highlight (not available)"
          >
            ✎
          </span>
          <span
            className="flex h-8 w-9 cursor-not-allowed items-center justify-center opacity-40"
            title="Text color (not available)"
          >
            <span className="h-3.5 w-3.5 rounded-full bg-purple-500" />
          </span>
        </span>
        <span className="block border-t border-black/10 dark:border-white/10" />
        <span className="block py-1">
          {blockItems.map((item) => (
            <button
              key={item.label}
              onMouseDown={keepSelection}
              onClick={() => {
                item.apply();
                onClose();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="w-4 text-[13px]">{item.active ? "✓" : ""}</span>
              <span className={item.className}>{item.label}</span>
            </button>
          ))}
        </span>
        <span className="block border-t border-black/10 dark:border-white/10" />
        <button
          onMouseDown={keepSelection}
          onClick={() => {
            onBlock("blockquote");
            onClose();
          }}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/5"
        >
          <span className="w-4 text-[13px]">
            {state.block === "blockquote" ? "✓" : ""}
          </span>
          <span className="border-l-2 border-neutral-400 pl-2 text-[15px]">
            Block Quote
          </span>
        </button>
      </span>
    </>
  );
}
