import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = { errorPolicy: 'all' } as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type AuthUser = {
  __typename?: 'AuthUser';
  displayName: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  onboardingDone: Scalars['Boolean']['output'];
};

export type CompleteOnboardingInput = {
  ageAttested: Scalars['Boolean']['input'];
  budgetTierId: Scalars['String']['input'];
  customAmount?: InputMaybe<Scalars['Int']['input']>;
  termsAccepted: Scalars['Boolean']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  completeOnboarding: OnboardingResult;
  registerPushDevice: UserDevice;
};

export type MutationCompleteOnboardingArgs = {
  input: CompleteOnboardingInput;
};

export type MutationRegisterPushDeviceArgs = {
  input: RegisterPushDeviceInput;
};

export type OnboardingBudgetSummary = {
  __typename?: 'OnboardingBudgetSummary';
  amount: Scalars['Int']['output'];
  cycleEnd: Scalars['String']['output'];
  cycleStart: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  tier: Scalars['String']['output'];
};

export type OnboardingResult = {
  __typename?: 'OnboardingResult';
  budget: OnboardingBudgetSummary;
  user: AuthUser;
};

export type Query = {
  __typename?: 'Query';
  me: AuthUser;
};

export type RegisterPushDeviceInput = {
  appVersion?: InputMaybe<Scalars['String']['input']>;
  expoPushToken: Scalars['String']['input'];
  platform: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  serverHeartbeat: Scalars['String']['output'];
};

export type UserDevice = {
  __typename?: 'UserDevice';
  id: Scalars['ID']['output'];
  platform: Scalars['String']['output'];
  registeredAt: Scalars['String']['output'];
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'AuthUser';
    id: string;
    email: string;
    displayName: string | null;
    onboardingDone: boolean;
  };
};

export type ServerHeartbeatSubscriptionVariables = Exact<{ [key: string]: never }>;

export type ServerHeartbeatSubscription = { __typename?: 'Subscription'; serverHeartbeat: string };

export type RegisterPushDeviceMutationVariables = Exact<{
  input: RegisterPushDeviceInput;
}>;

export type RegisterPushDeviceMutation = {
  __typename?: 'Mutation';
  registerPushDevice: {
    __typename?: 'UserDevice';
    id: string;
    platform: string;
    registeredAt: string;
  };
};

export type CompleteOnboardingMutationVariables = Exact<{
  input: CompleteOnboardingInput;
}>;

export type CompleteOnboardingMutation = {
  __typename?: 'Mutation';
  completeOnboarding: {
    __typename?: 'OnboardingResult';
    user: {
      __typename?: 'AuthUser';
      id: string;
      email: string;
      displayName: string | null;
      onboardingDone: boolean;
    };
    budget: {
      __typename?: 'OnboardingBudgetSummary';
      id: string;
      tier: string;
      amount: number;
      cycleStart: string;
      cycleEnd: string;
    };
  };
};

export const MeDocument = gql`
  query Me {
    me {
      id
      email
      displayName
      onboardingDone
    }
  }
`;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
}
export function useMeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
}
// @ts-ignore
export function useMeSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>,
): Apollo.UseSuspenseQueryResult<MeQuery, MeQueryVariables>;
export function useMeSuspenseQuery(
  baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>,
): Apollo.UseSuspenseQueryResult<MeQuery | undefined, MeQueryVariables>;
export function useMeSuspenseQuery(
  baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
}
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const ServerHeartbeatDocument = gql`
  subscription ServerHeartbeat {
    serverHeartbeat
  }
`;

/**
 * __useServerHeartbeatSubscription__
 *
 * To run a query within a React component, call `useServerHeartbeatSubscription` and pass it any options that fit your needs.
 * When your component renders, `useServerHeartbeatSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServerHeartbeatSubscription({
 *   variables: {
 *   },
 * });
 */
export function useServerHeartbeatSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    ServerHeartbeatSubscription,
    ServerHeartbeatSubscriptionVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<ServerHeartbeatSubscription, ServerHeartbeatSubscriptionVariables>(
    ServerHeartbeatDocument,
    options,
  );
}
export type ServerHeartbeatSubscriptionHookResult = ReturnType<
  typeof useServerHeartbeatSubscription
>;
export type ServerHeartbeatSubscriptionResult =
  Apollo.SubscriptionResult<ServerHeartbeatSubscription>;
export const RegisterPushDeviceDocument = gql`
  mutation RegisterPushDevice($input: RegisterPushDeviceInput!) {
    registerPushDevice(input: $input) {
      id
      platform
      registeredAt
    }
  }
`;
export type RegisterPushDeviceMutationFn = Apollo.MutationFunction<
  RegisterPushDeviceMutation,
  RegisterPushDeviceMutationVariables
>;

/**
 * __useRegisterPushDeviceMutation__
 *
 * To run a mutation, you first call `useRegisterPushDeviceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterPushDeviceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerPushDeviceMutation, { data, loading, error }] = useRegisterPushDeviceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRegisterPushDeviceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RegisterPushDeviceMutation,
    RegisterPushDeviceMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<RegisterPushDeviceMutation, RegisterPushDeviceMutationVariables>(
    RegisterPushDeviceDocument,
    options,
  );
}
export type RegisterPushDeviceMutationHookResult = ReturnType<typeof useRegisterPushDeviceMutation>;
export type RegisterPushDeviceMutationResult = Apollo.MutationResult<RegisterPushDeviceMutation>;
export type RegisterPushDeviceMutationOptions = Apollo.BaseMutationOptions<
  RegisterPushDeviceMutation,
  RegisterPushDeviceMutationVariables
>;
export const CompleteOnboardingDocument = gql`
  mutation CompleteOnboarding($input: CompleteOnboardingInput!) {
    completeOnboarding(input: $input) {
      user {
        id
        email
        displayName
        onboardingDone
      }
      budget {
        id
        tier
        amount
        cycleStart
        cycleEnd
      }
    }
  }
`;
export type CompleteOnboardingMutationFn = Apollo.MutationFunction<
  CompleteOnboardingMutation,
  CompleteOnboardingMutationVariables
>;

/**
 * __useCompleteOnboardingMutation__
 *
 * To run a mutation, you first call `useCompleteOnboardingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCompleteOnboardingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [completeOnboardingMutation, { data, loading, error }] = useCompleteOnboardingMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCompleteOnboardingMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CompleteOnboardingMutation,
    CompleteOnboardingMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CompleteOnboardingMutation, CompleteOnboardingMutationVariables>(
    CompleteOnboardingDocument,
    options,
  );
}
export type CompleteOnboardingMutationHookResult = ReturnType<typeof useCompleteOnboardingMutation>;
export type CompleteOnboardingMutationResult = Apollo.MutationResult<CompleteOnboardingMutation>;
export type CompleteOnboardingMutationOptions = Apollo.BaseMutationOptions<
  CompleteOnboardingMutation,
  CompleteOnboardingMutationVariables
>;
