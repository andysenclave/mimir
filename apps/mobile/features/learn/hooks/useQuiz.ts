// MM-054/055 — quiz state machine.
// Local state only until completion: answers accumulate client-side, feedback is
// fetched per question after selection, and the single server mutation happens
// at the end (submitQuiz). No back-navigation between questions.

import { useCallback, useMemo, useState } from 'react';

import {
  useAnswerFeedbackLazyQuery,
  useCourseQuizQuery,
  useSubmitQuizMutation,
} from '@/graphql/generated';

export interface AnswerFeedback {
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  correct: number;
  attemptId: string;
}

export interface AnsweredQuestion {
  questionId: string;
  question: string;
  options: string[];
  selectedIndex: number;
  feedback: AnswerFeedback;
}

export type QuizPhase = 'loading' | 'error' | 'answering' | 'submitting' | 'results';

interface UseQuizResult {
  phase: QuizPhase;
  courseTitle: string;
  /** 0-based index of the current question. */
  qIndex: number;
  totalQuestions: number;
  currentQuestion: { id: string; question: string; options: string[] } | null;
  selectedIndex: number | null;
  feedback: AnswerFeedback | null;
  feedbackLoading: boolean;
  isLastQuestion: boolean;
  result: QuizResult | null;
  /** Per-question review data for the results screen. */
  answered: AnsweredQuestion[];
  selectOption: (index: number) => void;
  next: () => void;
  retake: () => void;
}

export function useQuiz(courseId: string): UseQuizResult {
  const { data, loading, error } = useCourseQuizQuery({
    variables: { courseId },
    skip: courseId.length === 0,
  });
  const [fetchFeedback, { loading: feedbackLoading }] = useAnswerFeedbackLazyQuery();
  const [submitQuizMutation] = useSubmitQuizMutation({
    refetchQueries: ['Courses', 'CourseDetail', 'Profile'],
  });

  const [qIndex, setQIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [answered, setAnswered] = useState<AnsweredQuestion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const questions = useMemo(
    () =>
      [...(data?.quiz.questions ?? [])]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((q) => ({ id: q.id, question: q.question, options: q.options })),
    [data],
  );

  const currentQuestion = questions[qIndex] ?? null;
  const isLastQuestion = qIndex === questions.length - 1;

  const selectOption = useCallback(
    (index: number) => {
      // One answer per question — no changing after selection (MM-054 AC).
      if (selectedIndex !== null || currentQuestion === null) return;
      setSelectedIndex(index);

      void fetchFeedback({ variables: { questionId: currentQuestion.id } }).then((res) => {
        const fb = res.data?.answerFeedback;
        if (fb === undefined) return;
        const answerFeedback: AnswerFeedback = {
          correctIndex: fb.correctIndex,
          explanation: fb.explanation,
        };
        setFeedback(answerFeedback);
        setAnswered((prev) => [
          ...prev,
          {
            questionId: currentQuestion.id,
            question: currentQuestion.question,
            options: currentQuestion.options,
            selectedIndex: index,
            feedback: answerFeedback,
          },
        ]);
      });
    },
    [selectedIndex, currentQuestion, fetchFeedback],
  );

  const next = useCallback(() => {
    if (selectedIndex === null || feedback === null) return;

    if (!isLastQuestion) {
      setQIndex((i) => i + 1);
      setSelectedIndex(null);
      setFeedback(null);
      return;
    }

    // Last question — submit the whole attempt.
    const quizId = data?.quiz.id;
    if (quizId === undefined) return;
    setSubmitting(true);
    const answers = answered.map((a) => ({
      questionId: a.questionId,
      selectedIndex: a.selectedIndex,
    }));
    void submitQuizMutation({ variables: { input: { quizId, answers } } })
      .then((res) => {
        const r = res.data?.submitQuiz;
        if (r !== undefined) {
          setResult({ score: r.score, total: r.total, correct: r.correct, attemptId: r.attemptId });
        }
      })
      .finally(() => setSubmitting(false));
  }, [selectedIndex, feedback, isLastQuestion, data, answered, submitQuizMutation]);

  const retake = useCallback(() => {
    setQIndex(0);
    setSelectedIndex(null);
    setFeedback(null);
    setAnswered([]);
    setResult(null);
  }, []);

  const phase: QuizPhase =
    loading && questions.length === 0
      ? 'loading'
      : error !== undefined || questions.length === 0
        ? 'error'
        : result !== null
          ? 'results'
          : submitting
            ? 'submitting'
            : 'answering';

  return {
    phase,
    courseTitle: data?.quiz.courseTitle ?? '',
    qIndex,
    totalQuestions: questions.length,
    currentQuestion,
    selectedIndex,
    feedback,
    feedbackLoading,
    isLastQuestion,
    result,
    answered,
    selectOption,
    next,
    retake,
  };
}
