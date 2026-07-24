import { useState } from "react";
import type { QuizQuestionDraft } from "../../lib/quizzes";
import { useQuizBuilder } from "../../context/useQuizBuilder";
import { createEmptyQuestion } from "../../lib/quizBuilderReducer";
import Button from "../ui/Button";
import QuestionCard from "./QuestionCard";
import QuestionModal from "./QuestionModal";

interface EditingQuestion {
  questionId: string;
  isNew: boolean;
  original: QuizQuestionDraft;
}

function QuestionList() {
  const { state, dispatch } = useQuizBuilder();
  const [editing, setEditing] = useState<EditingQuestion | null>(null);

  const editingIndex = state.questions.findIndex(
    (question) => question.id === editing?.questionId,
  );
  const editingQuestion = editingIndex >= 0 ? state.questions[editingIndex] : null;

  const handleAddQuestion = () => {
    const question = createEmptyQuestion();
    dispatch({ type: "ADD_QUESTION", question });
    setEditing({ questionId: question.id, isNew: true, original: question });
  };

  const handleRemoveQuestion = (questionId: string) => {
    dispatch({ type: "REMOVE_QUESTION", questionId });
    if (editing?.questionId === questionId) setEditing(null);
  };

  const handleDiscardEdit = () => {
    if (editing) {
      dispatch({ type: "REPLACE_QUESTION", question: editing.original });
    }
    setEditing(null);
  };

  const handleCloseModal = () => {
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Questions</h2>
        <Button type="button" variant="secondary" onClick={handleAddQuestion}>
          + Add question
        </Button>
      </div>

      {state.questions.length === 0 ? (
        <p className="py-8 text-center text-muted">No questions yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {state.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              onEdit={() =>
                setEditing({ questionId: question.id, isNew: false, original: question })
              }
              onRemove={() => handleRemoveQuestion(question.id)}
            />
          ))}
        </div>
      )}

      {state.questions.length > 0 && (
        <button
          type="button"
          onClick={handleAddQuestion}
          className="cursor-pointer rounded-xl border border-dashed border-border py-4 text-sm font-semibold text-muted transition-colors hover:border-primary hover:text-primary"
        >
          + Add another question
        </button>
      )}

      {editingQuestion && (
        <QuestionModal
          question={editingQuestion}
          index={editingIndex}
          isNew={editing?.isNew ?? false}
          onDelete={() => handleRemoveQuestion(editingQuestion.id)}
          onDiscard={handleDiscardEdit}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default QuestionList;
