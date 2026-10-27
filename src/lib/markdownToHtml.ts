import { remark } from "remark";
import gfm from "remark-gfm";
import html from "remark-html";

export default async function markdownToHtml(markdown: string) {
  // sanitize: false keeps GFM task-list checkboxes; all content is owner-authored.
  const result = await remark()
    .use(gfm)
    .use(html, { sanitize: false })
    .process(markdown);
  // Notes can hold many full-size photos; only fetch them as they scroll in.
  return result.toString().replace(/<img /g, '<img loading="lazy" ');
}
