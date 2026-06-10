import { format, parseISO } from "date-fns";
import markdownStyles from "./markdown-styles.module.css";

type Props = {
  title: string;
  date: string;
  contentHtml: string;
};

export function Note({ title, date, contentHtml }: Props) {
  return (
    <article className="mx-auto max-w-2xl px-6 pb-20 sm:px-10">
      <p className="pb-4 pt-5 text-center text-xs text-neutral-400 dark:text-neutral-500">
        {format(parseISO(date), "MMMM d, yyyy 'at' h:mm a")}
      </p>
      <h1 className="mb-4 text-[26px] font-bold leading-tight">{title}</h1>
      <div
        className={markdownStyles["markdown"]}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </article>
  );
}
