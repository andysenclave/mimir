// MM-047 — data hook for the Learn tab hub.
// Fetches the courses list and today's concept in parallel.

import { useCoursesQuery, useTodaysConceptQuery } from '@/graphql/generated';

export function useLearnHub() {
  const {
    data: coursesData,
    loading: coursesLoading,
    error: coursesError,
    refetch,
  } = useCoursesQuery({ fetchPolicy: 'cache-and-network' });

  const { data: conceptData, loading: conceptLoading } = useTodaysConceptQuery({
    fetchPolicy: 'cache-first',
  });

  return {
    courses: coursesData?.courses ?? [],
    todaysConcept: conceptData?.todaysConcept ?? null,
    loading: coursesLoading || conceptLoading,
    error: coursesError,
    refetch,
  };
}
