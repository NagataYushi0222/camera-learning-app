import type { ReactNode } from "react";
import type { LessonStep } from "../../content/lessonTypes";

function renderLine(line: string, terms: string[] = []) {
  if (!terms.length) {
    return line;
  }

  const pattern = new RegExp(`(${terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return line.split(pattern).map((part, index) =>
    terms.includes(part) ? (
      <mark key={`${part}-${index}`}>{part}</mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
}

export function DialogueBox({
  step,
  children,
  compact = false,
}: {
  step: LessonStep;
  children?: ReactNode;
  compact?: boolean;
}) {
  const lines = compact ? step.text.slice(0, 2) : step.text;

  return (
    <div className="dialogue-content">
      <div className="dialogue-heading">
        <span className="speaker-name">{step.speaker ?? "ガイド"}</span>
        <strong>{step.title}</strong>
      </div>
      <div className="dialogue-lines">
        {lines.map((line) => (
          <p key={line}>{renderLine(line, step.glossaryTerms)}</p>
        ))}
      </div>
      {step.focusMessage ? <p className="focus-message">{step.focusMessage}</p> : null}
      {children}
    </div>
  );
}
