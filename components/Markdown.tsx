import ReactMarkdown from "react-markdown";

/**
 * react-markdown renders to React elements and does not parse raw HTML, so
 * script tags in a body show up as text. Links with unsafe protocols are
 * dropped by the default urlTransform.
 */
export function Markdown({ source }: { source: string }) {
  return (
    <div className="space-y-4 leading-7 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_code]:bg-neutral-100 [&_code]:px-1 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:overflow-x-auto [&_pre]:bg-neutral-100 [&_pre]:p-3 [&_ul]:list-disc [&_ul]:pl-6 [&_table]:block [&_table]:overflow-x-auto [&_td]:border [&_td]:px-2 [&_th]:border [&_th]:px-2">
      <ReactMarkdown>{source}</ReactMarkdown>
    </div>
  );
}
