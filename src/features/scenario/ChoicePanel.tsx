import type { Choice } from "../../content/lessonTypes";

type ChoicePanelProps = {
  choices: Choice[];
  selectedChoiceId: string | null;
  onSelect: (choice: Choice) => void;
};

export function ChoicePanel({ choices, selectedChoiceId, onSelect }: ChoicePanelProps) {
  return (
    <div className="choice-panel" aria-label="選択肢">
      {choices.map((choice) => (
        <button
          className={choice.id === selectedChoiceId ? "choice-button selected" : "choice-button"}
          key={choice.id}
          type="button"
          onClick={() => onSelect(choice)}
        >
          <strong>{choice.label}</strong>
          {choice.text ? <span>{choice.text}</span> : null}
        </button>
      ))}
    </div>
  );
}
