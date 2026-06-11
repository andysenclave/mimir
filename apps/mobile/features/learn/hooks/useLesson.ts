// MM-049 — data hook for the lesson reading view.
// Exposes completeLesson mutation and scroll-completion tracking.

import { useCallback, useState } from 'react';

import { useCompleteLessonMutation } from '@/graphql/generated';

export function useLesson(lessonId: string) {
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [completeLessonMutation] = useCompleteLessonMutation({
    refetchQueries: ['Courses', 'CourseDetail'],
  });

  const markComplete = useCallback(async (): Promise<void> => {
    if (completed || completing) return;
    setCompleting(true);
    try {
      await completeLessonMutation({ variables: { input: { lessonId } } });
      setCompleted(true);
    } finally {
      setCompleting(false);
    }
  }, [completed, completing, completeLessonMutation, lessonId]);

  const onScrollEnd = useCallback((): void => {
    setScrolledToEnd(true);
  }, []);

  return {
    scrolledToEnd,
    completing,
    completed,
    markComplete,
    onScrollEnd,
  };
}
