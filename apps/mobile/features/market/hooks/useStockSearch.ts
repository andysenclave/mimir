// Stock search — debounced query over the tradeable NSE universe.
// Apollo owns the result data (prompt 16). 300ms debounce keeps keystrokes from
// hammering the resolver; the query is skipped until there's a trimmed term.

import { useEffect, useState } from 'react';

import { useSearchStocksQuery, type SearchStocksQuery } from '@/graphql/generated';

export type StockSearchResult = SearchStocksQuery['searchStocks'][number];

export interface UseStockSearchResult {
  query: string;
  setQuery: (q: string) => void;
  clear: () => void;
  /** True the moment the user has typed anything — drives showing results vs overview. */
  active: boolean;
  loading: boolean;
  results: StockSearchResult[];
  debouncedQuery: string;
}

export function useStockSearch(): UseStockSearchResult {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, loading } = useSearchStocksQuery({
    variables: { query: debounced },
    skip: debounced.length === 0,
    fetchPolicy: 'cache-and-network',
  });

  return {
    query,
    setQuery,
    clear: () => setQuery(''),
    active: query.trim().length > 0,
    loading: loading && debounced.length > 0,
    results: data?.searchStocks ?? [],
    debouncedQuery: debounced,
  };
}
