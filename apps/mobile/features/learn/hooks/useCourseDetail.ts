// MM-048 — data hook for the Course detail screen.

import { useCourseDetailQuery } from '@/graphql/generated';

export function useCourseDetail(courseId: string) {
  const { data, loading, error, refetch } = useCourseDetailQuery({
    variables: { id: courseId },
    fetchPolicy: 'cache-and-network',
  });

  return {
    course: data?.course ?? null,
    loading,
    error,
    refetch,
  };
}
