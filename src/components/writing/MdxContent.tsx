import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeShiki from "@shikijs/rehype";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkMath from "remark-math";

function Callout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="article-callout">
      <p className="article-callout-title">{title}</p>
      {children}
    </aside>
  );
}

function VideoEmbed({ youtubeId, title }: { youtubeId: string; title: string }) {
  if (!/^[\w-]{11}$/.test(youtubeId)) throw new Error("VideoEmbed requires a valid YouTube video ID");
  return (
    <figure className="video-embed">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      <figcaption>{title}</figcaption>
    </figure>
  );
}

function ExternalAwareLink({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) {
  const external = /^https?:\/\//.test(href);
  return (
    <a href={href} {...props}>
      {children}
      {external ? <span className="external-marker" aria-hidden="true"> ↗</span> : null}
    </a>
  );
}

const components = {
  Callout,
  VideoEmbed,
  a: ExternalAwareLink,
};

export default async function MdxContent({ source }: { source: string }) {
  const { content } = await compileMDX({
    source,
    components,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [
          rehypeSlug,
          rehypeKatex,
          [rehypeShiki, { theme: "github-light", defaultColor: false }],
        ],
      },
    },
  });
  return content;
}
