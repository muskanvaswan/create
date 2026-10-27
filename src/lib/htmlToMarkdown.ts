import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const service = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
});
service.use(gfm);
// Markdown has no underline; keep <u> as inline HTML (rendered with sanitize off).
service.keep(["u"]);
// Nor highlights: wrap them in <mark> but keep converting what's inside.
service.addRule("highlight", {
  filter: "mark",
  replacement: (content) => (content ? `<mark>${content}</mark>` : ""),
});

export default function htmlToMarkdown(html: string): string {
  return service.turndown(html);
}
