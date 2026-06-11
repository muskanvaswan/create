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

export default function htmlToMarkdown(html: string): string {
  return service.turndown(html);
}
