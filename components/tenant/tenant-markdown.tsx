function renderInlineMarkdown(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
      }

      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            className="break-words rounded bg-[var(--surface-card)] px-1.5 py-0.5 text-[0.92em]"
            key={`${part}-${index}`}
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      return part;
    });
}

function getMarkdownBlocks(markdown: string) {
  return markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export function TenantMarkdown({
  emptyState,
  markdown,
  variant = "page",
}: {
  emptyState?: string;
  markdown: string;
  variant?: "page" | "preview";
}) {
  const blocks = getMarkdownBlocks(markdown);
  const isPreview = variant === "preview";

  if (blocks.length === 0) {
    if (!emptyState) {
      return null;
    }

    return (
      <div className="grid min-h-48 place-items-center border border-dashed border-[var(--border-subtle)] bg-[var(--surface-page)] p-5 text-center text-sm text-[var(--text-muted-4)]">
        {emptyState}
      </div>
    );
  }

  return (
    <div
      className={
        isPreview
          ? "min-h-48 border border-[var(--border-subtle)] bg-[var(--surface-page)] p-4"
          : "mt-8 min-w-0 sm:mt-10"
      }
    >
      {blocks.map((block, blockIndex) => {
        if (block.startsWith("```") && block.endsWith("```")) {
          return (
            <pre
              className={
                isPreview
                  ? "mt-4 max-w-full overflow-x-auto rounded-lg bg-[var(--surface-card)] p-4 text-sm first:mt-0"
                  : "mt-6 max-w-full overflow-x-auto rounded-lg bg-[var(--surface-card)] p-4 text-sm first:mt-0"
              }
              key={`markdown-block-${blockIndex}`}
            >
              <code>
                {block.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "")}
              </code>
            </pre>
          );
        }

        if (block.startsWith("### ")) {
          return (
            <h3
              className={
                isPreview
                  ? "mt-6 text-[17px] font-medium first:mt-0"
                  : "mt-8 break-words text-[17px] font-medium first:mt-0"
              }
              key={`markdown-block-${blockIndex}`}
            >
              {renderInlineMarkdown(block.slice(4))}
            </h3>
          );
        }

        if (block.startsWith("## ")) {
          return (
            <h2
              className={
                isPreview
                  ? "mt-7 text-xl font-semibold first:mt-0"
                  : "mt-10 break-words text-xl font-semibold first:mt-0"
              }
              key={`markdown-block-${blockIndex}`}
            >
              {renderInlineMarkdown(block.slice(3))}
            </h2>
          );
        }

        if (block.split("\n").every((line) => line.trim().startsWith("- "))) {
          return (
            <ul
              className="mt-5 list-disc overflow-hidden pl-5 first:mt-0"
              key={`markdown-block-${blockIndex}`}
            >
              {block.split("\n").map((line, lineIndex) => (
                <li
                  className={
                    isPreview
                      ? "mt-2 text-sm leading-6 text-[var(--text-muted-7)]"
                      : "mt-2 break-words text-[15px] leading-[1.7]"
                  }
                  key={`markdown-line-${blockIndex}-${lineIndex}`}
                >
                  {renderInlineMarkdown(line.trim().slice(2))}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p
            className={
              isPreview
                ? "mt-4 whitespace-pre-line text-sm leading-6 text-[var(--text-muted-7)] first:mt-0"
                : "mt-5 whitespace-pre-line break-words text-[15px] leading-[1.7] first:mt-0"
            }
            key={`markdown-block-${blockIndex}`}
          >
            {renderInlineMarkdown(block)}
          </p>
        );
      })}
    </div>
  );
}
