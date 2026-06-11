import { format, parseISO } from "date-fns";
import markdownStyles from "./markdown-styles.module.css";

type Props = {
  title: string;
  date: string;
  contentHtml: string;
  audioSrc?: string | null;
};

export function Note({ title, date, contentHtml, audioSrc }: Props) {
  return (
    <div className="pb-20">
      <p className="w-full pb-4 pt-5 text-center text-xs text-neutral-400 dark:text-neutral-500">
        {format(parseISO(date), "MMMM d, yyyy 'at' h:mm a")}
      </p>
      <article className="w-full pl-6 pr-6 sm:pl-10 sm:pr-10 lg:pl-14 lg:pr-14">
        <div className="mb-4">
          <h1 className="text-[26px] font-bold leading-tight">{title}</h1>
        </div>
        <div
          className={markdownStyles["markdown"]}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>
    </div>
  );
}
