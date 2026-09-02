export function renderResponseText(content: string) {
  const paragraphs = content.split(/\n{2,}/);

  return paragraphs.map((paragraph, paragraphIndex) => {
    const lines = paragraph.split('\n');
    return (
      <div key={`paragraph-${paragraphIndex}`} className={paragraphIndex > 0 ? 'mt-3' : undefined}>
        {lines.map((line, lineIndex) => {
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p
              key={`line-${paragraphIndex}-${lineIndex}`}
              className={lineIndex > 0 ? 'mt-1' : undefined}
            >
              {parts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={`part-${partIndex}`} className="font-semibold text-foreground">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={`part-${partIndex}`}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  });
}
