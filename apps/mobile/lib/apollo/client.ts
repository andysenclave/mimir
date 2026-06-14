// MM-007 — Apollo Client with split link.
// HTTP for queries/mutations, graphql-ws for subscriptions.
// Auth header attached from expo-secure-store via authLink.
// Error policy: 'all' so errors and partial data both surface (CLAUDE.md §13).

import { ApolloClient, HttpLink, InMemoryCache, from, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import Constants from 'expo-constants';
import { createClient } from 'graphql-ws';

import { authLink, errorLink } from './links';
import { tokenStorage } from '../auth/storage';

function readEnvUrl(name: string, fallback: string): string {
  const fromExpoExtra = (Constants.expoConfig?.extra as Record<string, string> | undefined)?.[name];
  const fromProcess = (process.env as Record<string, string | undefined>)[name];
  return fromExpoExtra ?? fromProcess ?? fallback;
}

const HTTP_URL = readEnvUrl('EXPO_PUBLIC_API_URL', 'http://localhost:3000/graphql');
const WS_URL = readEnvUrl('EXPO_PUBLIC_API_WS_URL', 'ws://localhost:3000/graphql');

const httpLink = new HttpLink({
  uri: HTTP_URL,
  credentials: 'omit',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: WS_URL,
    // Auth validated once at handshake (prompt 25, ADR-0001).
    connectionParams: async () => {
      const token = await tokenStorage.getAccessToken();
      return { Authorization: token ? `Bearer ${token}` : '' };
    },
    shouldRetry: () => true,
    retryAttempts: 5,
  }),
);

// Route subscriptions to WS, everything else to HTTP.
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  from([authLink, errorLink, httpLink]),
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // type policies for paginated lists added in MM-038 (trade history).
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
    mutate: { errorPolicy: 'all' },
  },
});
