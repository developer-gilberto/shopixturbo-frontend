interface PlainReportProps {
  text: string;
}

export function PlainReport({ text }: PlainReportProps) {
  return (
    <div
      aria-hidden="true"
      className="plain-report hidden whitespace-pre-wrap font-mono text-sm leading-relaxed text-black print:block print:whitespace-pre-wrap"
    >
      {text}
    </div>
  );
}
