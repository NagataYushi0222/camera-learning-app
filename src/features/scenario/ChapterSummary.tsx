import type { SummaryStep } from "../../content/lessonTypes";

export function ChapterSummary({ step }: { step: SummaryStep }) {
  return (
    <div className="chapter-summary">
      <div>
        <strong>この章で学んだこと</strong>
        <ul>
          {(step.summaryItems ?? step.text).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      {step.glossaryTerms?.length ? (
        <div>
          <strong>重要語句</strong>
          <div className="glossary-list">
            {step.glossaryTerms.map((term) => (
              <span key={term}>{term}</span>
            ))}
          </div>
        </div>
      ) : null}
      {step.nextChapterPreview ? <p className="next-preview">{step.nextChapterPreview}</p> : null}
    </div>
  );
}
