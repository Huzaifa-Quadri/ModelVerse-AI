import React from "react";

const InlineMarkdown = ({ text }) => {
  const parts = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong
          key={`${match.index}-strong`}
          className="font-semibold text-gray-100"
        >
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("*")) {
      parts.push(
        <em key={`${match.index}-em`} className="text-gray-100/95">
          {token.slice(1, -1)}
        </em>,
      );
    } else {
      parts.push(
        <code
          key={`${match.index}-code`}
          className="rounded-md bg-[#0E1117] px-1.5 py-0.5 text-[0.9em] text-blue-200"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
};

const MarkdownMessage = ({ content }) => {
  const lines = content.split(/\r?\n/);
  const elements = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Tag =
        heading[1].length === 1 ? "h3" : heading[1].length === 2 ? "h4" : "h5";
      elements.push(
        <Tag
          key={index}
          className="mt-4 first:mt-0 font-semibold text-gray-100"
        >
          <InlineMarkdown text={heading[2]} />
        </Tag>,
      );
      index += 1;
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*+]\s+/, ""));
        index += 1;
      }
      elements.push(
        <ul key={`ul-${index}`} className="my-3 list-disc space-y-1 pl-5">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ""));
        index += 1;
      }
      elements.push(
        <ol key={`ol-${index}`} className="my-3 list-decimal space-y-1 pl-5">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    if (/^>\s?/.test(line)) {
      elements.push(
        <blockquote
          key={index}
          className="my-3 border-l-2 border-blue-400/60 pl-4 text-gray-300"
        >
          <InlineMarkdown text={line.replace(/^>\s?/, "")} />
        </blockquote>,
      );
      index += 1;
      continue;
    }

    const paragraph = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,3})\s+/.test(lines[index]) &&
      !/^\s*[-*+]\s+/.test(lines[index]) &&
      !/^\s*\d+\.\s+/.test(lines[index]) &&
      !/^>\s?/.test(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }

    elements.push(
      <p key={`p-${index}`} className="my-3 first:mt-0 last:mb-0">
        {paragraph.map((paragraphLine, lineIndex) => (
          <React.Fragment key={lineIndex}>
            <InlineMarkdown text={paragraphLine} />
            {lineIndex < paragraph.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>,
    );
  }

  return <div>{elements}</div>;
};

export default MarkdownMessage;
