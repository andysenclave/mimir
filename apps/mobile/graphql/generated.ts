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
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string };
};

export type AiInsightGql = {
  __typename?: 'AIInsightGql';
  body: Scalars['String']['output'];
  fromQuota: Scalars['Boolean']['output'];
  generatedAt: Scalars['Float']['output'];
  model: Scalars['String']['output'];
  promptVersion: Scalars['String']['output'];
  quotaWarning: Scalars['Boolean']['output'];
  symbol: Scalars['String']['output'];
};

export type AiSuggestion = {
  __typename?: 'AISuggestion';
  body: Scalars['String']['output'];
  /** "course:<courseId>" or "concept:<conceptId>" */
  ctaLink: Scalars['String']['output'];
  generatedAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type AnswerFeedback = {
  __typename?: 'AnswerFeedback';
  correctIndex: Scalars['Int']['output'];
  explanation: Scalars['String']['output'];
  questionId: Scalars['ID']['output'];
};

export type AuthUser = {
  __typename?: 'AuthUser';
  displayName: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  onboardingDone: Scalars['Boolean']['output'];
  streakCount: Scalars['Float']['output'];
};

export type CompleteLessonInput = {
  lessonId: Scalars['ID']['input'];
};

export type CompleteOnboardingInput = {
  ageAttested: Scalars['Boolean']['input'];
  /** TIER_10K | TIER_25K | TIER_50K | TIER_1L | CUSTOM */
  budgetTierId: Scalars['String']['input'];
  /** Required when budgetTierId === CUSTOM */
  customAmount?: InputMaybe<Scalars['Int']['input']>;
  termsAccepted: Scalars['Boolean']['input'];
};

export type Concept = {
  __typename?: 'Concept';
  body: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  orderIndex: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type Course = {
  __typename?: 'Course';
  description: Scalars['String']['output'];
  difficulty: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lessons: Array<Lesson>;
  orderIndex: Scalars['Int']['output'];
  progress: Maybe<CourseProgress>;
  title: Scalars['String']['output'];
  totalTimeMin: Scalars['Int']['output'];
};

export type CourseProgress = {
  __typename?: 'CourseProgress';
  completedAt: Maybe<Scalars['String']['output']>;
  courseId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lessonsComplete: Scalars['Int']['output'];
  /** Best quiz score (percentage 0-100). */
  quizScore: Maybe<Scalars['Int']['output']>;
};

export type EquityPoint = {
  __typename?: 'EquityPoint';
  /** ISO date string (YYYY-MM-DD). */
  date: Scalars['String']['output'];
  /** Portfolio value in INR at that date. */
  value: Scalars['Float']['output'];
};

export type IndexQuoteGql = {
  __typename?: 'IndexQuoteGql';
  change: Scalars['Float']['output'];
  changePct: Scalars['Float']['output'];
  fetchedAt: Scalars['DateTime']['output'];
  ltp: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
};

export type IntradayPoint = {
  __typename?: 'IntradayPoint';
  /** Price in INR at this point. */
  price: Scalars['Float']['output'];
  /** Unix timestamp in milliseconds. */
  timestamp: Scalars['Float']['output'];
};

export type Lesson = {
  __typename?: 'Lesson';
  completed: Scalars['Boolean']['output'];
  content: Scalars['String']['output'];
  courseId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  orderIndex: Scalars['Int']['output'];
  readTimeMin: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type MarketOverviewGql = {
  __typename?: 'MarketOverviewGql';
  fetchedAt: Scalars['DateTime']['output'];
  /** Global indices (S&P 500, NASDAQ). */
  globalIndices: Array<IndexQuoteGql>;
  indices: Array<IndexQuoteGql>;
  sectors: Array<SectorPerformanceGql>;
  topGainers: Array<StockQuoteGql>;
  topLosers: Array<StockQuoteGql>;
};

/** A user's virtual budget for the current cycle. */
export type MonthlyBudget = {
  __typename?: 'MonthlyBudget';
  /** Initial budget amount for this cycle (INR). */
  amount: Scalars['Float']['output'];
  /** Remaining spendable cash (INR). Decrements on BUY, increments on SELL. */
  cashRemaining: Scalars['Float']['output'];
  /** End of the monthly cycle (exclusive). */
  cycleEnd: Scalars['DateTime']['output'];
  /** Start of the monthly cycle. */
  cycleStart: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** ACTIVE | EXPIRED. */
  status: Scalars['String']['output'];
  /** Budget tier: TIER_10K | TIER_25K | TIER_50K | TIER_1L | CUSTOM. */
  tier: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Add a stock to the authenticated user's watchlist. Idempotent if already present. Throws WATCHLIST_LIMIT if the watchlist already has 50 entries. */
  addToWatchlist: WatchlistItemGql;
  /** Mark a lesson as complete. Idempotent — re-calling has no effect. */
  completeLesson: CourseProgress;
  /** Complete onboarding by setting the monthly budget tier. Creates the first ACTIVE MonthlyBudget and flips User.onboardingDone. Idempotent. */
  completeOnboarding: OnboardingResult;
  /** Place a simulated market order (BUY or SELL). Idempotent: submitting the same clientGeneratedOrderId returns the existing order. Atomic: Order, Holding, and MonthlyBudget update in a single transaction. */
  placeOrder: Order;
  /** Register an Expo push token for the authenticated user. Idempotent on (userId, expoPushToken). */
  registerPushDevice: UserDevice;
  /** Remove a stock from the authenticated user's watchlist. Idempotent — returns true even if the symbol was not present. */
  removeFromWatchlist: Scalars['Boolean']['output'];
  /** DPDP account deletion request — soft-deletes now; hard cascade-delete within 30 days. */
  requestAccountDeletion: Scalars['Boolean']['output'];
  /** DPDP data-export request — records the request; export bundle produced offline. */
  requestDataExport: Scalars['Boolean']['output'];
  /** Score a quiz server-side. Best score is kept on CourseProgress. */
  submitQuiz: QuizResult;
  /** Enable or disable price-alert pushes for a watchlist item. */
  toggleWatchlistAlert: WatchlistItemGql;
  /** Add virtual cash to the current month's budget. Fails if the top-up would exceed the tier ceiling (budget.amount). */
  topupBudget: MonthlyBudget;
  /** Update the display name (1–40 chars). */
  updateDisplayName: UserProfileGql;
  /** Update the authenticated user's notification preferences. Partial update — only provided fields are changed. TRANSACTIONAL notifications cannot be disabled. */
  updateNotificationPreferences: NotificationPreferencesGql;
  /** Set the budget tier for the next cycle. Applied by the monthly rollover; the active budget is untouched (CLAUDE.md §8). */
  updatePreferredTier: UserProfileGql;
};

export type MutationAddToWatchlistArgs = {
  symbol: Scalars['String']['input'];
};

export type MutationCompleteLessonArgs = {
  input: CompleteLessonInput;
};

export type MutationCompleteOnboardingArgs = {
  input: CompleteOnboardingInput;
};

export type MutationPlaceOrderArgs = {
  input: PlaceOrderInput;
};

export type MutationRegisterPushDeviceArgs = {
  input: RegisterPushDeviceInput;
};

export type MutationRemoveFromWatchlistArgs = {
  symbol: Scalars['String']['input'];
};

export type MutationSubmitQuizArgs = {
  input: SubmitQuizInput;
};

export type MutationToggleWatchlistAlertArgs = {
  enabled: Scalars['Boolean']['input'];
  symbol: Scalars['String']['input'];
};

export type MutationTopupBudgetArgs = {
  input: TopupBudgetInput;
};

export type MutationUpdateDisplayNameArgs = {
  name: Scalars['String']['input'];
};

export type MutationUpdateNotificationPreferencesArgs = {
  input: UpdateNotificationPreferencesInput;
};

export type MutationUpdatePreferredTierArgs = {
  tier: Scalars['String']['input'];
};

export type NotificationPreferencesGql = {
  __typename?: 'NotificationPreferencesGql';
  budgetEnabled: Scalars['Boolean']['output'];
  dailyCap: Scalars['Int']['output'];
  educationalEnabled: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  portfolioEvtEnabled: Scalars['Boolean']['output'];
  priceAlertsEnabled: Scalars['Boolean']['output'];
  quietHoursEnd: Scalars['String']['output'];
  quietHoursStart: Scalars['String']['output'];
  streakEnabled: Scalars['Boolean']['output'];
};

export type OnboardingBudgetSummary = {
  __typename?: 'OnboardingBudgetSummary';
  /** Allocated cash in INR (Decimal serialized as paise/INR int) */
  amount: Scalars['Int']['output'];
  /** ISO date — end of the active cycle */
  cycleEnd: Scalars['String']['output'];
  /** ISO date — start of the active cycle */
  cycleStart: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** TIER_10K | TIER_25K | TIER_50K | TIER_1L | CUSTOM */
  tier: Scalars['String']['output'];
};

export type OnboardingResult = {
  __typename?: 'OnboardingResult';
  budget: OnboardingBudgetSummary;
  user: AuthUser;
};

/** A completed simulated market order. */
export type Order = {
  __typename?: 'Order';
  /** Client-generated UUID used for idempotency. */
  correlationId: Scalars['String']['output'];
  /** Timestamp when the order was executed. */
  executedAt: Scalars['DateTime']['output'];
  /** Reason for REJECTED status, if applicable. */
  failureReason: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Total order value = priceAtExecution × quantity. */
  orderValue: Scalars['Float']['output'];
  /** Price per share at execution (LTP). */
  priceAtExecution: Scalars['Float']['output'];
  /** Number of shares traded. */
  quantity: Scalars['Int']['output'];
  /** Realized P&L for SELL orders. Null for BUY orders. */
  realizedPnl: Maybe<Scalars['Float']['output']>;
  /** PENDING | FILLED | REJECTED. */
  status: Scalars['String']['output'];
  /** NSE symbol, e.g. RELIANCE. */
  symbol: Scalars['String']['output'];
  /** BUY or SELL. */
  type: Scalars['String']['output'];
};

/** Input for placing a simulated market order (BUY or SELL). */
export type PlaceOrderInput = {
  /** UUID v4 generated by mobile before the call. Used for idempotency: submitting the same ID twice returns the existing order. */
  clientGeneratedOrderId: Scalars['String']['input'];
  /** Number of shares. Min 1, max 1,000,000. */
  quantity: Scalars['Int']['input'];
  /** NSE symbol, e.g. RELIANCE, TCS.NS. */
  symbol: Scalars['String']['input'];
  /** BUY or SELL. */
  type: Scalars['String']['input'];
};

/** Full portfolio snapshot for the Portfolio screen. */
export type Portfolio = {
  __typename?: 'Portfolio';
  /** Active monthly budget. */
  budget: MonthlyBudget;
  /** Approximate 30-day equity curve. Values use current LTP (not historical prices) as a proxy. */
  equityCurve: Array<EquityPoint>;
  holdings: Array<PortfolioHolding>;
  /** Total cost basis (avgBuyPrice × qty) across all holdings. */
  totalInvested: Scalars['Float']['output'];
  /** Aggregate unrealized P&L in INR. */
  totalPnl: Scalars['Float']['output'];
  /** Aggregate unrealized P&L as % of totalInvested. */
  totalPnlPct: Scalars['Float']['output'];
  /** Total market value of all holdings. */
  totalValue: Scalars['Float']['output'];
};

/** A stock holding with live P&L metrics. */
export type PortfolioHolding = {
  __typename?: 'PortfolioHolding';
  /** Volume-weighted average buy price. */
  avgBuyPrice: Scalars['Float']['output'];
  /** Last traded price. */
  ltp: Scalars['Float']['output'];
  name: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Int']['output'];
  symbol: Scalars['String']['output'];
  /** Current market value = quantity × LTP. */
  totalValue: Scalars['Float']['output'];
  /** Unrealized P&L in INR. */
  unrealizedPnl: Scalars['Float']['output'];
  /** Unrealized P&L as % of invested. */
  unrealizedPnlPct: Scalars['Float']['output'];
};

export type PortfolioPerformanceGql = {
  __typename?: 'PortfolioPerformanceGql';
  /** Template-based motivational copy. Never LLM-generated (CLAUDE.md §9). */
  copy: Scalars['String']['output'];
  /** False when the user has no holdings — card renders benchmark-only mode. */
  hasHoldings: Scalars['Boolean']['output'];
  /** NIFTY 50 daily % change. */
  niftyChangePct: Scalars['Float']['output'];
  /** User's portfolio daily % change. Null when the user has no holdings or prices are unavailable. */
  portfolioChangePct: Maybe<Scalars['Float']['output']>;
  /** S&P 500 daily % change. Null when Yahoo Finance is unavailable. */
  sp500ChangePct: Maybe<Scalars['Float']['output']>;
};

/** Real-time portfolio P&L snapshot (1Hz max). */
export type PortfolioUpdate = {
  __typename?: 'PortfolioUpdate';
  /** Cash remaining in the active budget. */
  cashRemaining: Scalars['Float']['output'];
  /** Updated per-holding metrics. */
  holdings: Array<PortfolioHolding>;
  totalInvested: Scalars['Float']['output'];
  totalPnl: Scalars['Float']['output'];
  totalPnlPct: Scalars['Float']['output'];
  totalValue: Scalars['Float']['output'];
};

export type ProfileStatsGql = {
  __typename?: 'ProfileStatsGql';
  budgetTierId: Scalars['String']['output'];
  budgetTierLabel: Scalars['String']['output'];
  cashRemaining: Scalars['Float']['output'];
  coursesDone: Scalars['Float']['output'];
  preferredTierId: Maybe<Scalars['String']['output']>;
  quizScore: Scalars['Float']['output'];
  totalReturnInr: Scalars['Float']['output'];
  totalReturnPct: Scalars['Float']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** AI-generated educational context for a stock. Returns null when the feature flag is off, quota is exhausted, or insight generation failed. Mobile hides the section on null. */
  aiInsight: Maybe<AiInsightGql>;
  /** Portfolio-aware learning suggestions — 2-3 cards, regenerated at most every 24h. */
  aiSuggestions: Array<AiSuggestion>;
  /** Correct answer + explanation for one question, fetched after the user answers. */
  answerFeedback: AnswerFeedback;
  /** Single course with lessons and user progress. */
  course: Course;
  /** All courses with user progress. */
  courses: Array<Course>;
  /** Current market overview: indices, sectors, top movers. */
  marketOverview: MarketOverviewGql;
  /** The currently authenticated user. Requires a valid JWT. */
  me: AuthUser;
  /** Read the authenticated user's notification preferences. Auto-created with defaults if the user has never saved preferences. */
  notificationPreferences: NotificationPreferencesGql;
  /** Chronological trade history for the authenticated user, newest first. */
  orderHistory: Array<Order>;
  /** Full portfolio snapshot: holdings with live P&L, active budget, aggregate metrics, and approximate 30-day equity curve. */
  portfolio: Portfolio;
  /** Daily portfolio return vs NIFTY 50 and S&P 500. Returns null portfolioChangePct when the user has no holdings. */
  portfolioPerformance: PortfolioPerformanceGql;
  /** Aggregated profile data for the Profile tab: identity, stats, top-3 watchlist. Watchlist LTP is populated from MarketSnapshot; no live prices here — mobile subscribes to stockPrice subscription for live ticks. */
  profile: UserProfileGql;
  /** Quiz for a course. Never exposes correct answers. */
  quiz: Quiz;
  /** Search the tradeable NSE universe by symbol substring (max 20 results). */
  searchStocks: Array<StockQuoteGql>;
  /** Last-known snapshot for a single NSE symbol. */
  stock: Maybe<StockQuoteGql>;
  /** Intraday price series for a symbol (1-day, ~5-min intervals). Returns [] when market is closed. */
  stockIntraday: Array<IntradayPoint>;
  /** Today's concept — deterministic daily rotation. */
  todaysConcept: Concept;
};

export type QueryAiInsightArgs = {
  symbol: Scalars['String']['input'];
};

export type QueryAnswerFeedbackArgs = {
  questionId: Scalars['ID']['input'];
};

export type QueryCourseArgs = {
  id: Scalars['ID']['input'];
};

export type QueryOrderHistoryArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};

export type QueryQuizArgs = {
  courseId: Scalars['ID']['input'];
};

export type QuerySearchStocksArgs = {
  query: Scalars['String']['input'];
};

export type QueryStockArgs = {
  symbol: Scalars['String']['input'];
};

export type QueryStockIntradayArgs = {
  symbol: Scalars['String']['input'];
};

export type Quiz = {
  __typename?: 'Quiz';
  courseId: Scalars['ID']['output'];
  /** Course title, for the quiz screen header. */
  courseTitle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  questions: Array<QuizQuestion>;
  title: Scalars['String']['output'];
};

export type QuizAnswerInput = {
  questionId: Scalars['ID']['input'];
  selectedIndex: Scalars['Int']['input'];
};

export type QuizQuestion = {
  __typename?: 'QuizQuestion';
  id: Scalars['ID']['output'];
  options: Array<Scalars['String']['output']>;
  orderIndex: Scalars['Int']['output'];
  question: Scalars['String']['output'];
};

export type QuizResult = {
  __typename?: 'QuizResult';
  attemptId: Scalars['ID']['output'];
  /** Number of correctly answered questions. */
  correct: Scalars['Int']['output'];
  /** Percentage score 0-100. */
  score: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type RegisterPushDeviceInput = {
  appVersion?: InputMaybe<Scalars['String']['input']>;
  /** Expo push token (ExponentPushToken[...]). */
  expoPushToken: Scalars['String']['input'];
  /** IOS | ANDROID | WEB */
  platform: Scalars['String']['input'];
};

export type SectorPerformanceGql = {
  __typename?: 'SectorPerformanceGql';
  changePct: Scalars['Float']['output'];
  displayName: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type StockPriceUpdate = {
  __typename?: 'StockPriceUpdate';
  change: Scalars['Float']['output'];
  changePct: Scalars['Float']['output'];
  fetchedAt: Scalars['String']['output'];
  ltp: Scalars['Float']['output'];
  symbol: Scalars['String']['output'];
};

export type StockQuoteGql = {
  __typename?: 'StockQuoteGql';
  change: Maybe<Scalars['Float']['output']>;
  changePct: Maybe<Scalars['Float']['output']>;
  close: Maybe<Scalars['Float']['output']>;
  fetchedAt: Scalars['DateTime']['output'];
  high: Maybe<Scalars['Float']['output']>;
  low: Maybe<Scalars['Float']['output']>;
  ltp: Scalars['Float']['output'];
  name: Maybe<Scalars['String']['output']>;
  open: Maybe<Scalars['Float']['output']>;
  symbol: Scalars['String']['output'];
  volume: Maybe<Scalars['Float']['output']>;
};

export type SubmitQuizInput = {
  answers: Array<QuizAnswerInput>;
  quizId: Scalars['ID']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Real-time portfolio P&L updates as prices tick (max 1Hz per user). Emits when any held symbol receives a price update. Yields nothing if the user has no holdings. */
  portfolioUpdate: PortfolioUpdate;
  /** Server-driven heartbeat (MM-006 smoke test). Removed when MM-023 lands. */
  serverHeartbeat: Scalars['String']['output'];
  /** Live LTP ticks for the requested symbols (15s cadence during market hours). */
  stockPrice: StockPriceUpdate;
};

export type SubscriptionStockPriceArgs = {
  symbols: Array<Scalars['String']['input']>;
};

/** Add virtual cash to the current month's budget. */
export type TopupBudgetInput = {
  /** Amount in INR to add. Must be positive and within tier headroom. */
  amount: Scalars['Float']['input'];
};

export type UpdateNotificationPreferencesInput = {
  budgetEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  dailyCap?: InputMaybe<Scalars['Int']['input']>;
  educationalEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  portfolioEvtEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  priceAlertsEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  quietHoursEnd?: InputMaybe<Scalars['String']['input']>;
  quietHoursStart?: InputMaybe<Scalars['String']['input']>;
  streakEnabled?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UserDevice = {
  __typename?: 'UserDevice';
  id: Scalars['ID']['output'];
  platform: Scalars['String']['output'];
  registeredAt: Scalars['String']['output'];
};

export type UserProfileGql = {
  __typename?: 'UserProfileGql';
  displayName: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  memberSince: Scalars['Float']['output'];
  stats: ProfileStatsGql;
  streakCount: Scalars['Float']['output'];
  watchlist: Array<WatchlistItemGql>;
};

export type WatchlistItemGql = {
  __typename?: 'WatchlistItemGql';
  alertEnabled: Scalars['Boolean']['output'];
  changePct: Maybe<Scalars['Float']['output']>;
  ltp: Maybe<Scalars['Float']['output']>;
  symbol: Scalars['ID']['output'];
};

export type CoursesQueryVariables = Exact<{ [key: string]: never }>;

export type CoursesQuery = {
  __typename?: 'Query';
  courses: Array<{
    __typename?: 'Course';
    id: string;
    title: string;
    description: string;
    difficulty: string;
    totalTimeMin: number;
    orderIndex: number;
    progress: {
      __typename?: 'CourseProgress';
      id: string;
      lessonsComplete: number;
      completedAt: string | null;
      quizScore: number | null;
    } | null;
    lessons: Array<{
      __typename?: 'Lesson';
      id: string;
      title: string;
      orderIndex: number;
      readTimeMin: number;
      completed: boolean;
    }>;
  }>;
};

export type CourseDetailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type CourseDetailQuery = {
  __typename?: 'Query';
  course: {
    __typename?: 'Course';
    id: string;
    title: string;
    description: string;
    difficulty: string;
    totalTimeMin: number;
    orderIndex: number;
    progress: {
      __typename?: 'CourseProgress';
      id: string;
      lessonsComplete: number;
      completedAt: string | null;
      quizScore: number | null;
    } | null;
    lessons: Array<{
      __typename?: 'Lesson';
      id: string;
      title: string;
      orderIndex: number;
      readTimeMin: number;
      completed: boolean;
      content: string;
    }>;
  };
};

export type TodaysConceptQueryVariables = Exact<{ [key: string]: never }>;

export type TodaysConceptQuery = {
  __typename?: 'Query';
  todaysConcept: {
    __typename?: 'Concept';
    id: string;
    title: string;
    body: string;
    orderIndex: number;
  };
};

export type AiSuggestionsQueryVariables = Exact<{ [key: string]: never }>;

export type AiSuggestionsQuery = {
  __typename?: 'Query';
  aiSuggestions: Array<{
    __typename?: 'AISuggestion';
    id: string;
    title: string;
    body: string;
    ctaLink: string;
    generatedAt: string;
  }>;
};

export type CourseQuizQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
}>;

export type CourseQuizQuery = {
  __typename?: 'Query';
  quiz: {
    __typename?: 'Quiz';
    id: string;
    courseId: string;
    title: string;
    courseTitle: string;
    questions: Array<{
      __typename?: 'QuizQuestion';
      id: string;
      question: string;
      options: Array<string>;
      orderIndex: number;
    }>;
  };
};

export type AnswerFeedbackQueryVariables = Exact<{
  questionId: Scalars['ID']['input'];
}>;

export type AnswerFeedbackQuery = {
  __typename?: 'Query';
  answerFeedback: {
    __typename?: 'AnswerFeedback';
    questionId: string;
    correctIndex: number;
    explanation: string;
  };
};

export type SubmitQuizMutationVariables = Exact<{
  input: SubmitQuizInput;
}>;

export type SubmitQuizMutation = {
  __typename?: 'Mutation';
  submitQuiz: {
    __typename?: 'QuizResult';
    score: number;
    total: number;
    correct: number;
    attemptId: string;
  };
};

export type CompleteLessonMutationVariables = Exact<{
  input: CompleteLessonInput;
}>;

export type CompleteLessonMutation = {
  __typename?: 'Mutation';
  completeLesson: {
    __typename?: 'CourseProgress';
    id: string;
    courseId: string;
    lessonsComplete: number;
    completedAt: string | null;
  };
};

export type MarketOverviewQueryVariables = Exact<{ [key: string]: never }>;

export type MarketOverviewQuery = {
  __typename?: 'Query';
  marketOverview: {
    __typename?: 'MarketOverviewGql';
    fetchedAt: string;
    indices: Array<{
      __typename?: 'IndexQuoteGql';
      symbol: string;
      name: string;
      ltp: number;
      change: number;
      changePct: number;
      fetchedAt: string;
    }>;
    globalIndices: Array<{
      __typename?: 'IndexQuoteGql';
      symbol: string;
      name: string;
      ltp: number;
      change: number;
      changePct: number;
      fetchedAt: string;
    }>;
    topGainers: Array<{
      __typename?: 'StockQuoteGql';
      symbol: string;
      name: string | null;
      ltp: number;
      change: number | null;
      changePct: number | null;
    }>;
    topLosers: Array<{
      __typename?: 'StockQuoteGql';
      symbol: string;
      name: string | null;
      ltp: number;
      change: number | null;
      changePct: number | null;
    }>;
    sectors: Array<{
      __typename?: 'SectorPerformanceGql';
      name: string;
      displayName: string;
      changePct: number;
    }>;
  };
};

export type StockPriceUpdateSubscriptionVariables = Exact<{
  symbols: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;

export type StockPriceUpdateSubscription = {
  __typename?: 'Subscription';
  stockPrice: {
    __typename?: 'StockPriceUpdate';
    symbol: string;
    ltp: number;
    change: number;
    changePct: number;
    fetchedAt: string;
  };
};

export type SearchStocksQueryVariables = Exact<{
  query: Scalars['String']['input'];
}>;

export type SearchStocksQuery = {
  __typename?: 'Query';
  searchStocks: Array<{
    __typename?: 'StockQuoteGql';
    symbol: string;
    ltp: number;
    change: number | null;
    changePct: number | null;
  }>;
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
    streakCount: number;
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

export type PortfolioPerformanceQueryVariables = Exact<{ [key: string]: never }>;

export type PortfolioPerformanceQuery = {
  __typename?: 'Query';
  portfolioPerformance: {
    __typename?: 'PortfolioPerformanceGql';
    portfolioChangePct: number | null;
    niftyChangePct: number;
    sp500ChangePct: number | null;
    copy: string;
    hasHoldings: boolean;
  };
};

export type PortfolioQueryVariables = Exact<{ [key: string]: never }>;

export type PortfolioQuery = {
  __typename?: 'Query';
  portfolio: {
    __typename?: 'Portfolio';
    totalValue: number;
    totalInvested: number;
    totalPnl: number;
    totalPnlPct: number;
    holdings: Array<{
      __typename?: 'PortfolioHolding';
      symbol: string;
      name: string | null;
      quantity: number;
      avgBuyPrice: number;
      ltp: number;
      unrealizedPnl: number;
      unrealizedPnlPct: number;
      totalValue: number;
    }>;
    budget: {
      __typename?: 'MonthlyBudget';
      id: string;
      tier: string;
      amount: number;
      cashRemaining: number;
      status: string;
      cycleStart: string;
      cycleEnd: string;
    };
    equityCurve: Array<{ __typename?: 'EquityPoint'; date: string; value: number }>;
  };
};

export type PortfolioUpdateSubscriptionVariables = Exact<{ [key: string]: never }>;

export type PortfolioUpdateSubscription = {
  __typename?: 'Subscription';
  portfolioUpdate: {
    __typename?: 'PortfolioUpdate';
    totalValue: number;
    totalInvested: number;
    totalPnl: number;
    totalPnlPct: number;
    cashRemaining: number;
    holdings: Array<{
      __typename?: 'PortfolioHolding';
      symbol: string;
      ltp: number;
      unrealizedPnl: number;
      unrealizedPnlPct: number;
      totalValue: number;
    }>;
  };
};

export type ProfileFieldsFragment = {
  __typename?: 'UserProfileGql';
  id: string;
  email: string;
  displayName: string | null;
  memberSince: number;
  streakCount: number;
  stats: {
    __typename?: 'ProfileStatsGql';
    totalReturnInr: number;
    totalReturnPct: number;
    budgetTierLabel: string;
    budgetTierId: string;
    preferredTierId: string | null;
    cashRemaining: number;
    coursesDone: number;
    quizScore: number;
  };
  watchlist: Array<{
    __typename?: 'WatchlistItemGql';
    symbol: string;
    ltp: number | null;
    changePct: number | null;
    alertEnabled: boolean;
  }>;
};

export type ProfileQueryVariables = Exact<{ [key: string]: never }>;

export type ProfileQuery = {
  __typename?: 'Query';
  profile: {
    __typename?: 'UserProfileGql';
    id: string;
    email: string;
    displayName: string | null;
    memberSince: number;
    streakCount: number;
    stats: {
      __typename?: 'ProfileStatsGql';
      totalReturnInr: number;
      totalReturnPct: number;
      budgetTierLabel: string;
      budgetTierId: string;
      preferredTierId: string | null;
      cashRemaining: number;
      coursesDone: number;
      quizScore: number;
    };
    watchlist: Array<{
      __typename?: 'WatchlistItemGql';
      symbol: string;
      ltp: number | null;
      changePct: number | null;
      alertEnabled: boolean;
    }>;
  };
};

export type UpdateDisplayNameMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;

export type UpdateDisplayNameMutation = {
  __typename?: 'Mutation';
  updateDisplayName: {
    __typename?: 'UserProfileGql';
    id: string;
    email: string;
    displayName: string | null;
    memberSince: number;
    streakCount: number;
    stats: {
      __typename?: 'ProfileStatsGql';
      totalReturnInr: number;
      totalReturnPct: number;
      budgetTierLabel: string;
      budgetTierId: string;
      preferredTierId: string | null;
      cashRemaining: number;
      coursesDone: number;
      quizScore: number;
    };
    watchlist: Array<{
      __typename?: 'WatchlistItemGql';
      symbol: string;
      ltp: number | null;
      changePct: number | null;
      alertEnabled: boolean;
    }>;
  };
};

export type UpdatePreferredTierMutationVariables = Exact<{
  tier: Scalars['String']['input'];
}>;

export type UpdatePreferredTierMutation = {
  __typename?: 'Mutation';
  updatePreferredTier: {
    __typename?: 'UserProfileGql';
    id: string;
    email: string;
    displayName: string | null;
    memberSince: number;
    streakCount: number;
    stats: {
      __typename?: 'ProfileStatsGql';
      totalReturnInr: number;
      totalReturnPct: number;
      budgetTierLabel: string;
      budgetTierId: string;
      preferredTierId: string | null;
      cashRemaining: number;
      coursesDone: number;
      quizScore: number;
    };
    watchlist: Array<{
      __typename?: 'WatchlistItemGql';
      symbol: string;
      ltp: number | null;
      changePct: number | null;
      alertEnabled: boolean;
    }>;
  };
};

export type RequestAccountDeletionMutationVariables = Exact<{ [key: string]: never }>;

export type RequestAccountDeletionMutation = {
  __typename?: 'Mutation';
  requestAccountDeletion: boolean;
};

export type RequestDataExportMutationVariables = Exact<{ [key: string]: never }>;

export type RequestDataExportMutation = { __typename?: 'Mutation'; requestDataExport: boolean };

export type AiInsightQueryVariables = Exact<{
  symbol: Scalars['String']['input'];
}>;

export type AiInsightQuery = {
  __typename?: 'Query';
  aiInsight: {
    __typename?: 'AIInsightGql';
    symbol: string;
    body: string;
    promptVersion: string;
    generatedAt: number;
    fromQuota: boolean;
    quotaWarning: boolean;
  } | null;
};

export type AddToWatchlistMutationVariables = Exact<{
  symbol: Scalars['String']['input'];
}>;

export type AddToWatchlistMutation = {
  __typename?: 'Mutation';
  addToWatchlist: {
    __typename?: 'WatchlistItemGql';
    symbol: string;
    alertEnabled: boolean;
    ltp: number | null;
    changePct: number | null;
  };
};

export type RemoveFromWatchlistMutationVariables = Exact<{
  symbol: Scalars['String']['input'];
}>;

export type RemoveFromWatchlistMutation = { __typename?: 'Mutation'; removeFromWatchlist: boolean };

export type ToggleWatchlistAlertMutationVariables = Exact<{
  symbol: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;

export type ToggleWatchlistAlertMutation = {
  __typename?: 'Mutation';
  toggleWatchlistAlert: { __typename?: 'WatchlistItemGql'; symbol: string; alertEnabled: boolean };
};

export type NotificationPreferencesQueryVariables = Exact<{ [key: string]: never }>;

export type NotificationPreferencesQuery = {
  __typename?: 'Query';
  notificationPreferences: {
    __typename?: 'NotificationPreferencesGql';
    id: string;
    streakEnabled: boolean;
    budgetEnabled: boolean;
    priceAlertsEnabled: boolean;
    portfolioEvtEnabled: boolean;
    educationalEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    dailyCap: number;
  };
};

export type UpdateNotificationPreferencesMutationVariables = Exact<{
  input: UpdateNotificationPreferencesInput;
}>;

export type UpdateNotificationPreferencesMutation = {
  __typename?: 'Mutation';
  updateNotificationPreferences: {
    __typename?: 'NotificationPreferencesGql';
    id: string;
    streakEnabled: boolean;
    budgetEnabled: boolean;
    priceAlertsEnabled: boolean;
    portfolioEvtEnabled: boolean;
    educationalEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    dailyCap: number;
  };
};

export type StockDetailQueryVariables = Exact<{
  symbol: Scalars['String']['input'];
}>;

export type StockDetailQuery = {
  __typename?: 'Query';
  stock: {
    __typename?: 'StockQuoteGql';
    symbol: string;
    name: string | null;
    ltp: number;
    change: number | null;
    changePct: number | null;
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
    volume: number | null;
    fetchedAt: string;
  } | null;
};

export type StockIntradayQueryVariables = Exact<{
  symbol: Scalars['String']['input'];
}>;

export type StockIntradayQuery = {
  __typename?: 'Query';
  stockIntraday: Array<{ __typename?: 'IntradayPoint'; timestamp: number; price: number }>;
};

export type OrderHistoryQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;

export type OrderHistoryQuery = {
  __typename?: 'Query';
  orderHistory: Array<{
    __typename?: 'Order';
    id: string;
    symbol: string;
    type: string;
    quantity: number;
    priceAtExecution: number;
    orderValue: number;
    realizedPnl: number | null;
    status: string;
    correlationId: string;
    executedAt: string;
  }>;
};

export type PlaceOrderMutationVariables = Exact<{
  input: PlaceOrderInput;
}>;

export type PlaceOrderMutation = {
  __typename?: 'Mutation';
  placeOrder: {
    __typename?: 'Order';
    id: string;
    symbol: string;
    type: string;
    quantity: number;
    priceAtExecution: number;
    orderValue: number;
    realizedPnl: number | null;
    status: string;
    correlationId: string;
    executedAt: string;
  };
};

export const ProfileFieldsFragmentDoc = gql`
  fragment ProfileFields on UserProfileGql {
    id
    email
    displayName
    memberSince
    streakCount
    stats {
      totalReturnInr
      totalReturnPct
      budgetTierLabel
      budgetTierId
      preferredTierId
      cashRemaining
      coursesDone
      quizScore
    }
    watchlist {
      symbol
      ltp
      changePct
      alertEnabled
    }
  }
`;
export const CoursesDocument = gql`
  query Courses {
    courses {
      id
      title
      description
      difficulty
      totalTimeMin
      orderIndex
      progress {
        id
        lessonsComplete
        completedAt
        quizScore
      }
      lessons {
        id
        title
        orderIndex
        readTimeMin
        completed
      }
    }
  }
`;

/**
 * __useCoursesQuery__
 *
 * To run a query within a React component, call `useCoursesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCoursesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCoursesQuery({
 *   variables: {
 *   },
 * });
 */
export function useCoursesQuery(
  baseOptions?: Apollo.QueryHookOptions<CoursesQuery, CoursesQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CoursesQuery, CoursesQueryVariables>(CoursesDocument, options);
}
export function useCoursesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<CoursesQuery, CoursesQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CoursesQuery, CoursesQueryVariables>(CoursesDocument, options);
}
// @ts-ignore
export function useCoursesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<CoursesQuery, CoursesQueryVariables>,
): Apollo.UseSuspenseQueryResult<CoursesQuery, CoursesQueryVariables>;
export function useCoursesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<CoursesQuery, CoursesQueryVariables>,
): Apollo.UseSuspenseQueryResult<CoursesQuery | undefined, CoursesQueryVariables>;
export function useCoursesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<CoursesQuery, CoursesQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<CoursesQuery, CoursesQueryVariables>(CoursesDocument, options);
}
export type CoursesQueryHookResult = ReturnType<typeof useCoursesQuery>;
export type CoursesLazyQueryHookResult = ReturnType<typeof useCoursesLazyQuery>;
export type CoursesSuspenseQueryHookResult = ReturnType<typeof useCoursesSuspenseQuery>;
export type CoursesQueryResult = Apollo.QueryResult<CoursesQuery, CoursesQueryVariables>;
export const CourseDetailDocument = gql`
  query CourseDetail($id: ID!) {
    course(id: $id) {
      id
      title
      description
      difficulty
      totalTimeMin
      orderIndex
      progress {
        id
        lessonsComplete
        completedAt
        quizScore
      }
      lessons {
        id
        title
        orderIndex
        readTimeMin
        completed
        content
      }
    }
  }
`;

/**
 * __useCourseDetailQuery__
 *
 * To run a query within a React component, call `useCourseDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useCourseDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCourseDetailQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCourseDetailQuery(
  baseOptions: Apollo.QueryHookOptions<CourseDetailQuery, CourseDetailQueryVariables> &
    ({ variables: CourseDetailQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CourseDetailQuery, CourseDetailQueryVariables>(
    CourseDetailDocument,
    options,
  );
}
export function useCourseDetailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<CourseDetailQuery, CourseDetailQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CourseDetailQuery, CourseDetailQueryVariables>(
    CourseDetailDocument,
    options,
  );
}
// @ts-ignore
export function useCourseDetailSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<CourseDetailQuery, CourseDetailQueryVariables>,
): Apollo.UseSuspenseQueryResult<CourseDetailQuery, CourseDetailQueryVariables>;
export function useCourseDetailSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<CourseDetailQuery, CourseDetailQueryVariables>,
): Apollo.UseSuspenseQueryResult<CourseDetailQuery | undefined, CourseDetailQueryVariables>;
export function useCourseDetailSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<CourseDetailQuery, CourseDetailQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<CourseDetailQuery, CourseDetailQueryVariables>(
    CourseDetailDocument,
    options,
  );
}
export type CourseDetailQueryHookResult = ReturnType<typeof useCourseDetailQuery>;
export type CourseDetailLazyQueryHookResult = ReturnType<typeof useCourseDetailLazyQuery>;
export type CourseDetailSuspenseQueryHookResult = ReturnType<typeof useCourseDetailSuspenseQuery>;
export type CourseDetailQueryResult = Apollo.QueryResult<
  CourseDetailQuery,
  CourseDetailQueryVariables
>;
export const TodaysConceptDocument = gql`
  query TodaysConcept {
    todaysConcept {
      id
      title
      body
      orderIndex
    }
  }
`;

/**
 * __useTodaysConceptQuery__
 *
 * To run a query within a React component, call `useTodaysConceptQuery` and pass it any options that fit your needs.
 * When your component renders, `useTodaysConceptQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTodaysConceptQuery({
 *   variables: {
 *   },
 * });
 */
export function useTodaysConceptQuery(
  baseOptions?: Apollo.QueryHookOptions<TodaysConceptQuery, TodaysConceptQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<TodaysConceptQuery, TodaysConceptQueryVariables>(
    TodaysConceptDocument,
    options,
  );
}
export function useTodaysConceptLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<TodaysConceptQuery, TodaysConceptQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<TodaysConceptQuery, TodaysConceptQueryVariables>(
    TodaysConceptDocument,
    options,
  );
}
// @ts-ignore
export function useTodaysConceptSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<TodaysConceptQuery, TodaysConceptQueryVariables>,
): Apollo.UseSuspenseQueryResult<TodaysConceptQuery, TodaysConceptQueryVariables>;
export function useTodaysConceptSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<TodaysConceptQuery, TodaysConceptQueryVariables>,
): Apollo.UseSuspenseQueryResult<TodaysConceptQuery | undefined, TodaysConceptQueryVariables>;
export function useTodaysConceptSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<TodaysConceptQuery, TodaysConceptQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<TodaysConceptQuery, TodaysConceptQueryVariables>(
    TodaysConceptDocument,
    options,
  );
}
export type TodaysConceptQueryHookResult = ReturnType<typeof useTodaysConceptQuery>;
export type TodaysConceptLazyQueryHookResult = ReturnType<typeof useTodaysConceptLazyQuery>;
export type TodaysConceptSuspenseQueryHookResult = ReturnType<typeof useTodaysConceptSuspenseQuery>;
export type TodaysConceptQueryResult = Apollo.QueryResult<
  TodaysConceptQuery,
  TodaysConceptQueryVariables
>;
export const AiSuggestionsDocument = gql`
  query AISuggestions {
    aiSuggestions {
      id
      title
      body
      ctaLink
      generatedAt
    }
  }
`;

/**
 * __useAiSuggestionsQuery__
 *
 * To run a query within a React component, call `useAiSuggestionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAiSuggestionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAiSuggestionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAiSuggestionsQuery(
  baseOptions?: Apollo.QueryHookOptions<AiSuggestionsQuery, AiSuggestionsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<AiSuggestionsQuery, AiSuggestionsQueryVariables>(
    AiSuggestionsDocument,
    options,
  );
}
export function useAiSuggestionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<AiSuggestionsQuery, AiSuggestionsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<AiSuggestionsQuery, AiSuggestionsQueryVariables>(
    AiSuggestionsDocument,
    options,
  );
}
// @ts-ignore
export function useAiSuggestionsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<AiSuggestionsQuery, AiSuggestionsQueryVariables>,
): Apollo.UseSuspenseQueryResult<AiSuggestionsQuery, AiSuggestionsQueryVariables>;
export function useAiSuggestionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<AiSuggestionsQuery, AiSuggestionsQueryVariables>,
): Apollo.UseSuspenseQueryResult<AiSuggestionsQuery | undefined, AiSuggestionsQueryVariables>;
export function useAiSuggestionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<AiSuggestionsQuery, AiSuggestionsQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<AiSuggestionsQuery, AiSuggestionsQueryVariables>(
    AiSuggestionsDocument,
    options,
  );
}
export type AiSuggestionsQueryHookResult = ReturnType<typeof useAiSuggestionsQuery>;
export type AiSuggestionsLazyQueryHookResult = ReturnType<typeof useAiSuggestionsLazyQuery>;
export type AiSuggestionsSuspenseQueryHookResult = ReturnType<typeof useAiSuggestionsSuspenseQuery>;
export type AiSuggestionsQueryResult = Apollo.QueryResult<
  AiSuggestionsQuery,
  AiSuggestionsQueryVariables
>;
export const CourseQuizDocument = gql`
  query CourseQuiz($courseId: ID!) {
    quiz(courseId: $courseId) {
      id
      courseId
      title
      courseTitle
      questions {
        id
        question
        options
        orderIndex
      }
    }
  }
`;

/**
 * __useCourseQuizQuery__
 *
 * To run a query within a React component, call `useCourseQuizQuery` and pass it any options that fit your needs.
 * When your component renders, `useCourseQuizQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCourseQuizQuery({
 *   variables: {
 *      courseId: // value for 'courseId'
 *   },
 * });
 */
export function useCourseQuizQuery(
  baseOptions: Apollo.QueryHookOptions<CourseQuizQuery, CourseQuizQueryVariables> &
    ({ variables: CourseQuizQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CourseQuizQuery, CourseQuizQueryVariables>(CourseQuizDocument, options);
}
export function useCourseQuizLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<CourseQuizQuery, CourseQuizQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CourseQuizQuery, CourseQuizQueryVariables>(
    CourseQuizDocument,
    options,
  );
}
// @ts-ignore
export function useCourseQuizSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<CourseQuizQuery, CourseQuizQueryVariables>,
): Apollo.UseSuspenseQueryResult<CourseQuizQuery, CourseQuizQueryVariables>;
export function useCourseQuizSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<CourseQuizQuery, CourseQuizQueryVariables>,
): Apollo.UseSuspenseQueryResult<CourseQuizQuery | undefined, CourseQuizQueryVariables>;
export function useCourseQuizSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<CourseQuizQuery, CourseQuizQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<CourseQuizQuery, CourseQuizQueryVariables>(
    CourseQuizDocument,
    options,
  );
}
export type CourseQuizQueryHookResult = ReturnType<typeof useCourseQuizQuery>;
export type CourseQuizLazyQueryHookResult = ReturnType<typeof useCourseQuizLazyQuery>;
export type CourseQuizSuspenseQueryHookResult = ReturnType<typeof useCourseQuizSuspenseQuery>;
export type CourseQuizQueryResult = Apollo.QueryResult<CourseQuizQuery, CourseQuizQueryVariables>;
export const AnswerFeedbackDocument = gql`
  query AnswerFeedback($questionId: ID!) {
    answerFeedback(questionId: $questionId) {
      questionId
      correctIndex
      explanation
    }
  }
`;

/**
 * __useAnswerFeedbackQuery__
 *
 * To run a query within a React component, call `useAnswerFeedbackQuery` and pass it any options that fit your needs.
 * When your component renders, `useAnswerFeedbackQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAnswerFeedbackQuery({
 *   variables: {
 *      questionId: // value for 'questionId'
 *   },
 * });
 */
export function useAnswerFeedbackQuery(
  baseOptions: Apollo.QueryHookOptions<AnswerFeedbackQuery, AnswerFeedbackQueryVariables> &
    ({ variables: AnswerFeedbackQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<AnswerFeedbackQuery, AnswerFeedbackQueryVariables>(
    AnswerFeedbackDocument,
    options,
  );
}
export function useAnswerFeedbackLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<AnswerFeedbackQuery, AnswerFeedbackQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<AnswerFeedbackQuery, AnswerFeedbackQueryVariables>(
    AnswerFeedbackDocument,
    options,
  );
}
// @ts-ignore
export function useAnswerFeedbackSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<AnswerFeedbackQuery, AnswerFeedbackQueryVariables>,
): Apollo.UseSuspenseQueryResult<AnswerFeedbackQuery, AnswerFeedbackQueryVariables>;
export function useAnswerFeedbackSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<AnswerFeedbackQuery, AnswerFeedbackQueryVariables>,
): Apollo.UseSuspenseQueryResult<AnswerFeedbackQuery | undefined, AnswerFeedbackQueryVariables>;
export function useAnswerFeedbackSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<AnswerFeedbackQuery, AnswerFeedbackQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<AnswerFeedbackQuery, AnswerFeedbackQueryVariables>(
    AnswerFeedbackDocument,
    options,
  );
}
export type AnswerFeedbackQueryHookResult = ReturnType<typeof useAnswerFeedbackQuery>;
export type AnswerFeedbackLazyQueryHookResult = ReturnType<typeof useAnswerFeedbackLazyQuery>;
export type AnswerFeedbackSuspenseQueryHookResult = ReturnType<
  typeof useAnswerFeedbackSuspenseQuery
>;
export type AnswerFeedbackQueryResult = Apollo.QueryResult<
  AnswerFeedbackQuery,
  AnswerFeedbackQueryVariables
>;
export const SubmitQuizDocument = gql`
  mutation SubmitQuiz($input: SubmitQuizInput!) {
    submitQuiz(input: $input) {
      score
      total
      correct
      attemptId
    }
  }
`;
export type SubmitQuizMutationFn = Apollo.MutationFunction<
  SubmitQuizMutation,
  SubmitQuizMutationVariables
>;

/**
 * __useSubmitQuizMutation__
 *
 * To run a mutation, you first call `useSubmitQuizMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitQuizMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitQuizMutation, { data, loading, error }] = useSubmitQuizMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSubmitQuizMutation(
  baseOptions?: Apollo.MutationHookOptions<SubmitQuizMutation, SubmitQuizMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SubmitQuizMutation, SubmitQuizMutationVariables>(
    SubmitQuizDocument,
    options,
  );
}
export type SubmitQuizMutationHookResult = ReturnType<typeof useSubmitQuizMutation>;
export type SubmitQuizMutationResult = Apollo.MutationResult<SubmitQuizMutation>;
export type SubmitQuizMutationOptions = Apollo.BaseMutationOptions<
  SubmitQuizMutation,
  SubmitQuizMutationVariables
>;
export const CompleteLessonDocument = gql`
  mutation CompleteLesson($input: CompleteLessonInput!) {
    completeLesson(input: $input) {
      id
      courseId
      lessonsComplete
      completedAt
    }
  }
`;
export type CompleteLessonMutationFn = Apollo.MutationFunction<
  CompleteLessonMutation,
  CompleteLessonMutationVariables
>;

/**
 * __useCompleteLessonMutation__
 *
 * To run a mutation, you first call `useCompleteLessonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCompleteLessonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [completeLessonMutation, { data, loading, error }] = useCompleteLessonMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCompleteLessonMutation(
  baseOptions?: Apollo.MutationHookOptions<CompleteLessonMutation, CompleteLessonMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CompleteLessonMutation, CompleteLessonMutationVariables>(
    CompleteLessonDocument,
    options,
  );
}
export type CompleteLessonMutationHookResult = ReturnType<typeof useCompleteLessonMutation>;
export type CompleteLessonMutationResult = Apollo.MutationResult<CompleteLessonMutation>;
export type CompleteLessonMutationOptions = Apollo.BaseMutationOptions<
  CompleteLessonMutation,
  CompleteLessonMutationVariables
>;
export const MarketOverviewDocument = gql`
  query MarketOverview {
    marketOverview {
      fetchedAt
      indices {
        symbol
        name
        ltp
        change
        changePct
        fetchedAt
      }
      globalIndices {
        symbol
        name
        ltp
        change
        changePct
        fetchedAt
      }
      topGainers {
        symbol
        name
        ltp
        change
        changePct
      }
      topLosers {
        symbol
        name
        ltp
        change
        changePct
      }
      sectors {
        name
        displayName
        changePct
      }
    }
  }
`;

/**
 * __useMarketOverviewQuery__
 *
 * To run a query within a React component, call `useMarketOverviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketOverviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketOverviewQuery({
 *   variables: {
 *   },
 * });
 */
export function useMarketOverviewQuery(
  baseOptions?: Apollo.QueryHookOptions<MarketOverviewQuery, MarketOverviewQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<MarketOverviewQuery, MarketOverviewQueryVariables>(
    MarketOverviewDocument,
    options,
  );
}
export function useMarketOverviewLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<MarketOverviewQuery, MarketOverviewQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<MarketOverviewQuery, MarketOverviewQueryVariables>(
    MarketOverviewDocument,
    options,
  );
}
// @ts-ignore
export function useMarketOverviewSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<MarketOverviewQuery, MarketOverviewQueryVariables>,
): Apollo.UseSuspenseQueryResult<MarketOverviewQuery, MarketOverviewQueryVariables>;
export function useMarketOverviewSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<MarketOverviewQuery, MarketOverviewQueryVariables>,
): Apollo.UseSuspenseQueryResult<MarketOverviewQuery | undefined, MarketOverviewQueryVariables>;
export function useMarketOverviewSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<MarketOverviewQuery, MarketOverviewQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<MarketOverviewQuery, MarketOverviewQueryVariables>(
    MarketOverviewDocument,
    options,
  );
}
export type MarketOverviewQueryHookResult = ReturnType<typeof useMarketOverviewQuery>;
export type MarketOverviewLazyQueryHookResult = ReturnType<typeof useMarketOverviewLazyQuery>;
export type MarketOverviewSuspenseQueryHookResult = ReturnType<
  typeof useMarketOverviewSuspenseQuery
>;
export type MarketOverviewQueryResult = Apollo.QueryResult<
  MarketOverviewQuery,
  MarketOverviewQueryVariables
>;
export const StockPriceUpdateDocument = gql`
  subscription StockPriceUpdate($symbols: [String!]!) {
    stockPrice(symbols: $symbols) {
      symbol
      ltp
      change
      changePct
      fetchedAt
    }
  }
`;

/**
 * __useStockPriceUpdateSubscription__
 *
 * To run a query within a React component, call `useStockPriceUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useStockPriceUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStockPriceUpdateSubscription({
 *   variables: {
 *      symbols: // value for 'symbols'
 *   },
 * });
 */
export function useStockPriceUpdateSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    StockPriceUpdateSubscription,
    StockPriceUpdateSubscriptionVariables
  > &
    ({ variables: StockPriceUpdateSubscriptionVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    StockPriceUpdateSubscription,
    StockPriceUpdateSubscriptionVariables
  >(StockPriceUpdateDocument, options);
}
export type StockPriceUpdateSubscriptionHookResult = ReturnType<
  typeof useStockPriceUpdateSubscription
>;
export type StockPriceUpdateSubscriptionResult =
  Apollo.SubscriptionResult<StockPriceUpdateSubscription>;
export const SearchStocksDocument = gql`
  query SearchStocks($query: String!) {
    searchStocks(query: $query) {
      symbol
      ltp
      change
      changePct
    }
  }
`;

/**
 * __useSearchStocksQuery__
 *
 * To run a query within a React component, call `useSearchStocksQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchStocksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchStocksQuery({
 *   variables: {
 *      query: // value for 'query'
 *   },
 * });
 */
export function useSearchStocksQuery(
  baseOptions: Apollo.QueryHookOptions<SearchStocksQuery, SearchStocksQueryVariables> &
    ({ variables: SearchStocksQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SearchStocksQuery, SearchStocksQueryVariables>(
    SearchStocksDocument,
    options,
  );
}
export function useSearchStocksLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SearchStocksQuery, SearchStocksQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SearchStocksQuery, SearchStocksQueryVariables>(
    SearchStocksDocument,
    options,
  );
}
// @ts-ignore
export function useSearchStocksSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<SearchStocksQuery, SearchStocksQueryVariables>,
): Apollo.UseSuspenseQueryResult<SearchStocksQuery, SearchStocksQueryVariables>;
export function useSearchStocksSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SearchStocksQuery, SearchStocksQueryVariables>,
): Apollo.UseSuspenseQueryResult<SearchStocksQuery | undefined, SearchStocksQueryVariables>;
export function useSearchStocksSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SearchStocksQuery, SearchStocksQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SearchStocksQuery, SearchStocksQueryVariables>(
    SearchStocksDocument,
    options,
  );
}
export type SearchStocksQueryHookResult = ReturnType<typeof useSearchStocksQuery>;
export type SearchStocksLazyQueryHookResult = ReturnType<typeof useSearchStocksLazyQuery>;
export type SearchStocksSuspenseQueryHookResult = ReturnType<typeof useSearchStocksSuspenseQuery>;
export type SearchStocksQueryResult = Apollo.QueryResult<
  SearchStocksQuery,
  SearchStocksQueryVariables
>;
export const MeDocument = gql`
  query Me {
    me {
      id
      email
      displayName
      onboardingDone
      streakCount
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
export const PortfolioPerformanceDocument = gql`
  query PortfolioPerformance {
    portfolioPerformance {
      portfolioChangePct
      niftyChangePct
      sp500ChangePct
      copy
      hasHoldings
    }
  }
`;

/**
 * __usePortfolioPerformanceQuery__
 *
 * To run a query within a React component, call `usePortfolioPerformanceQuery` and pass it any options that fit your needs.
 * When your component renders, `usePortfolioPerformanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePortfolioPerformanceQuery({
 *   variables: {
 *   },
 * });
 */
export function usePortfolioPerformanceQuery(
  baseOptions?: Apollo.QueryHookOptions<
    PortfolioPerformanceQuery,
    PortfolioPerformanceQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<PortfolioPerformanceQuery, PortfolioPerformanceQueryVariables>(
    PortfolioPerformanceDocument,
    options,
  );
}
export function usePortfolioPerformanceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    PortfolioPerformanceQuery,
    PortfolioPerformanceQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<PortfolioPerformanceQuery, PortfolioPerformanceQueryVariables>(
    PortfolioPerformanceDocument,
    options,
  );
}
// @ts-ignore
export function usePortfolioPerformanceSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    PortfolioPerformanceQuery,
    PortfolioPerformanceQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<PortfolioPerformanceQuery, PortfolioPerformanceQueryVariables>;
export function usePortfolioPerformanceSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        PortfolioPerformanceQuery,
        PortfolioPerformanceQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  PortfolioPerformanceQuery | undefined,
  PortfolioPerformanceQueryVariables
>;
export function usePortfolioPerformanceSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        PortfolioPerformanceQuery,
        PortfolioPerformanceQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<PortfolioPerformanceQuery, PortfolioPerformanceQueryVariables>(
    PortfolioPerformanceDocument,
    options,
  );
}
export type PortfolioPerformanceQueryHookResult = ReturnType<typeof usePortfolioPerformanceQuery>;
export type PortfolioPerformanceLazyQueryHookResult = ReturnType<
  typeof usePortfolioPerformanceLazyQuery
>;
export type PortfolioPerformanceSuspenseQueryHookResult = ReturnType<
  typeof usePortfolioPerformanceSuspenseQuery
>;
export type PortfolioPerformanceQueryResult = Apollo.QueryResult<
  PortfolioPerformanceQuery,
  PortfolioPerformanceQueryVariables
>;
export const PortfolioDocument = gql`
  query Portfolio {
    portfolio {
      holdings {
        symbol
        name
        quantity
        avgBuyPrice
        ltp
        unrealizedPnl
        unrealizedPnlPct
        totalValue
      }
      budget {
        id
        tier
        amount
        cashRemaining
        status
        cycleStart
        cycleEnd
      }
      totalValue
      totalInvested
      totalPnl
      totalPnlPct
      equityCurve {
        date
        value
      }
    }
  }
`;

/**
 * __usePortfolioQuery__
 *
 * To run a query within a React component, call `usePortfolioQuery` and pass it any options that fit your needs.
 * When your component renders, `usePortfolioQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePortfolioQuery({
 *   variables: {
 *   },
 * });
 */
export function usePortfolioQuery(
  baseOptions?: Apollo.QueryHookOptions<PortfolioQuery, PortfolioQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<PortfolioQuery, PortfolioQueryVariables>(PortfolioDocument, options);
}
export function usePortfolioLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<PortfolioQuery, PortfolioQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<PortfolioQuery, PortfolioQueryVariables>(PortfolioDocument, options);
}
// @ts-ignore
export function usePortfolioSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<PortfolioQuery, PortfolioQueryVariables>,
): Apollo.UseSuspenseQueryResult<PortfolioQuery, PortfolioQueryVariables>;
export function usePortfolioSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<PortfolioQuery, PortfolioQueryVariables>,
): Apollo.UseSuspenseQueryResult<PortfolioQuery | undefined, PortfolioQueryVariables>;
export function usePortfolioSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<PortfolioQuery, PortfolioQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<PortfolioQuery, PortfolioQueryVariables>(
    PortfolioDocument,
    options,
  );
}
export type PortfolioQueryHookResult = ReturnType<typeof usePortfolioQuery>;
export type PortfolioLazyQueryHookResult = ReturnType<typeof usePortfolioLazyQuery>;
export type PortfolioSuspenseQueryHookResult = ReturnType<typeof usePortfolioSuspenseQuery>;
export type PortfolioQueryResult = Apollo.QueryResult<PortfolioQuery, PortfolioQueryVariables>;
export const PortfolioUpdateDocument = gql`
  subscription PortfolioUpdate {
    portfolioUpdate {
      totalValue
      totalInvested
      totalPnl
      totalPnlPct
      cashRemaining
      holdings {
        symbol
        ltp
        unrealizedPnl
        unrealizedPnlPct
        totalValue
      }
    }
  }
`;

/**
 * __usePortfolioUpdateSubscription__
 *
 * To run a query within a React component, call `usePortfolioUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `usePortfolioUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePortfolioUpdateSubscription({
 *   variables: {
 *   },
 * });
 */
export function usePortfolioUpdateSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    PortfolioUpdateSubscription,
    PortfolioUpdateSubscriptionVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<PortfolioUpdateSubscription, PortfolioUpdateSubscriptionVariables>(
    PortfolioUpdateDocument,
    options,
  );
}
export type PortfolioUpdateSubscriptionHookResult = ReturnType<
  typeof usePortfolioUpdateSubscription
>;
export type PortfolioUpdateSubscriptionResult =
  Apollo.SubscriptionResult<PortfolioUpdateSubscription>;
export const ProfileDocument = gql`
  query Profile {
    profile {
      ...ProfileFields
    }
  }
  ${ProfileFieldsFragmentDoc}
`;

/**
 * __useProfileQuery__
 *
 * To run a query within a React component, call `useProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useProfileQuery(
  baseOptions?: Apollo.QueryHookOptions<ProfileQuery, ProfileQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, options);
}
export function useProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ProfileQuery, ProfileQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, options);
}
// @ts-ignore
export function useProfileSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<ProfileQuery, ProfileQueryVariables>,
): Apollo.UseSuspenseQueryResult<ProfileQuery, ProfileQueryVariables>;
export function useProfileSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<ProfileQuery, ProfileQueryVariables>,
): Apollo.UseSuspenseQueryResult<ProfileQuery | undefined, ProfileQueryVariables>;
export function useProfileSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<ProfileQuery, ProfileQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, options);
}
export type ProfileQueryHookResult = ReturnType<typeof useProfileQuery>;
export type ProfileLazyQueryHookResult = ReturnType<typeof useProfileLazyQuery>;
export type ProfileSuspenseQueryHookResult = ReturnType<typeof useProfileSuspenseQuery>;
export type ProfileQueryResult = Apollo.QueryResult<ProfileQuery, ProfileQueryVariables>;
export const UpdateDisplayNameDocument = gql`
  mutation UpdateDisplayName($name: String!) {
    updateDisplayName(name: $name) {
      ...ProfileFields
    }
  }
  ${ProfileFieldsFragmentDoc}
`;
export type UpdateDisplayNameMutationFn = Apollo.MutationFunction<
  UpdateDisplayNameMutation,
  UpdateDisplayNameMutationVariables
>;

/**
 * __useUpdateDisplayNameMutation__
 *
 * To run a mutation, you first call `useUpdateDisplayNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDisplayNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDisplayNameMutation, { data, loading, error }] = useUpdateDisplayNameMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateDisplayNameMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateDisplayNameMutation,
    UpdateDisplayNameMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateDisplayNameMutation, UpdateDisplayNameMutationVariables>(
    UpdateDisplayNameDocument,
    options,
  );
}
export type UpdateDisplayNameMutationHookResult = ReturnType<typeof useUpdateDisplayNameMutation>;
export type UpdateDisplayNameMutationResult = Apollo.MutationResult<UpdateDisplayNameMutation>;
export type UpdateDisplayNameMutationOptions = Apollo.BaseMutationOptions<
  UpdateDisplayNameMutation,
  UpdateDisplayNameMutationVariables
>;
export const UpdatePreferredTierDocument = gql`
  mutation UpdatePreferredTier($tier: String!) {
    updatePreferredTier(tier: $tier) {
      ...ProfileFields
    }
  }
  ${ProfileFieldsFragmentDoc}
`;
export type UpdatePreferredTierMutationFn = Apollo.MutationFunction<
  UpdatePreferredTierMutation,
  UpdatePreferredTierMutationVariables
>;

/**
 * __useUpdatePreferredTierMutation__
 *
 * To run a mutation, you first call `useUpdatePreferredTierMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePreferredTierMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePreferredTierMutation, { data, loading, error }] = useUpdatePreferredTierMutation({
 *   variables: {
 *      tier: // value for 'tier'
 *   },
 * });
 */
export function useUpdatePreferredTierMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdatePreferredTierMutation,
    UpdatePreferredTierMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdatePreferredTierMutation, UpdatePreferredTierMutationVariables>(
    UpdatePreferredTierDocument,
    options,
  );
}
export type UpdatePreferredTierMutationHookResult = ReturnType<
  typeof useUpdatePreferredTierMutation
>;
export type UpdatePreferredTierMutationResult = Apollo.MutationResult<UpdatePreferredTierMutation>;
export type UpdatePreferredTierMutationOptions = Apollo.BaseMutationOptions<
  UpdatePreferredTierMutation,
  UpdatePreferredTierMutationVariables
>;
export const RequestAccountDeletionDocument = gql`
  mutation RequestAccountDeletion {
    requestAccountDeletion
  }
`;
export type RequestAccountDeletionMutationFn = Apollo.MutationFunction<
  RequestAccountDeletionMutation,
  RequestAccountDeletionMutationVariables
>;

/**
 * __useRequestAccountDeletionMutation__
 *
 * To run a mutation, you first call `useRequestAccountDeletionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestAccountDeletionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestAccountDeletionMutation, { data, loading, error }] = useRequestAccountDeletionMutation({
 *   variables: {
 *   },
 * });
 */
export function useRequestAccountDeletionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RequestAccountDeletionMutation,
    RequestAccountDeletionMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RequestAccountDeletionMutation,
    RequestAccountDeletionMutationVariables
  >(RequestAccountDeletionDocument, options);
}
export type RequestAccountDeletionMutationHookResult = ReturnType<
  typeof useRequestAccountDeletionMutation
>;
export type RequestAccountDeletionMutationResult =
  Apollo.MutationResult<RequestAccountDeletionMutation>;
export type RequestAccountDeletionMutationOptions = Apollo.BaseMutationOptions<
  RequestAccountDeletionMutation,
  RequestAccountDeletionMutationVariables
>;
export const RequestDataExportDocument = gql`
  mutation RequestDataExport {
    requestDataExport
  }
`;
export type RequestDataExportMutationFn = Apollo.MutationFunction<
  RequestDataExportMutation,
  RequestDataExportMutationVariables
>;

/**
 * __useRequestDataExportMutation__
 *
 * To run a mutation, you first call `useRequestDataExportMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestDataExportMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestDataExportMutation, { data, loading, error }] = useRequestDataExportMutation({
 *   variables: {
 *   },
 * });
 */
export function useRequestDataExportMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RequestDataExportMutation,
    RequestDataExportMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<RequestDataExportMutation, RequestDataExportMutationVariables>(
    RequestDataExportDocument,
    options,
  );
}
export type RequestDataExportMutationHookResult = ReturnType<typeof useRequestDataExportMutation>;
export type RequestDataExportMutationResult = Apollo.MutationResult<RequestDataExportMutation>;
export type RequestDataExportMutationOptions = Apollo.BaseMutationOptions<
  RequestDataExportMutation,
  RequestDataExportMutationVariables
>;
export const AiInsightDocument = gql`
  query AiInsight($symbol: String!) {
    aiInsight(symbol: $symbol) {
      symbol
      body
      promptVersion
      generatedAt
      fromQuota
      quotaWarning
    }
  }
`;

/**
 * __useAiInsightQuery__
 *
 * To run a query within a React component, call `useAiInsightQuery` and pass it any options that fit your needs.
 * When your component renders, `useAiInsightQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAiInsightQuery({
 *   variables: {
 *      symbol: // value for 'symbol'
 *   },
 * });
 */
export function useAiInsightQuery(
  baseOptions: Apollo.QueryHookOptions<AiInsightQuery, AiInsightQueryVariables> &
    ({ variables: AiInsightQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<AiInsightQuery, AiInsightQueryVariables>(AiInsightDocument, options);
}
export function useAiInsightLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<AiInsightQuery, AiInsightQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<AiInsightQuery, AiInsightQueryVariables>(AiInsightDocument, options);
}
// @ts-ignore
export function useAiInsightSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<AiInsightQuery, AiInsightQueryVariables>,
): Apollo.UseSuspenseQueryResult<AiInsightQuery, AiInsightQueryVariables>;
export function useAiInsightSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<AiInsightQuery, AiInsightQueryVariables>,
): Apollo.UseSuspenseQueryResult<AiInsightQuery | undefined, AiInsightQueryVariables>;
export function useAiInsightSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<AiInsightQuery, AiInsightQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<AiInsightQuery, AiInsightQueryVariables>(
    AiInsightDocument,
    options,
  );
}
export type AiInsightQueryHookResult = ReturnType<typeof useAiInsightQuery>;
export type AiInsightLazyQueryHookResult = ReturnType<typeof useAiInsightLazyQuery>;
export type AiInsightSuspenseQueryHookResult = ReturnType<typeof useAiInsightSuspenseQuery>;
export type AiInsightQueryResult = Apollo.QueryResult<AiInsightQuery, AiInsightQueryVariables>;
export const AddToWatchlistDocument = gql`
  mutation AddToWatchlist($symbol: String!) {
    addToWatchlist(symbol: $symbol) {
      symbol
      alertEnabled
      ltp
      changePct
    }
  }
`;
export type AddToWatchlistMutationFn = Apollo.MutationFunction<
  AddToWatchlistMutation,
  AddToWatchlistMutationVariables
>;

/**
 * __useAddToWatchlistMutation__
 *
 * To run a mutation, you first call `useAddToWatchlistMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddToWatchlistMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addToWatchlistMutation, { data, loading, error }] = useAddToWatchlistMutation({
 *   variables: {
 *      symbol: // value for 'symbol'
 *   },
 * });
 */
export function useAddToWatchlistMutation(
  baseOptions?: Apollo.MutationHookOptions<AddToWatchlistMutation, AddToWatchlistMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<AddToWatchlistMutation, AddToWatchlistMutationVariables>(
    AddToWatchlistDocument,
    options,
  );
}
export type AddToWatchlistMutationHookResult = ReturnType<typeof useAddToWatchlistMutation>;
export type AddToWatchlistMutationResult = Apollo.MutationResult<AddToWatchlistMutation>;
export type AddToWatchlistMutationOptions = Apollo.BaseMutationOptions<
  AddToWatchlistMutation,
  AddToWatchlistMutationVariables
>;
export const RemoveFromWatchlistDocument = gql`
  mutation RemoveFromWatchlist($symbol: String!) {
    removeFromWatchlist(symbol: $symbol)
  }
`;
export type RemoveFromWatchlistMutationFn = Apollo.MutationFunction<
  RemoveFromWatchlistMutation,
  RemoveFromWatchlistMutationVariables
>;

/**
 * __useRemoveFromWatchlistMutation__
 *
 * To run a mutation, you first call `useRemoveFromWatchlistMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveFromWatchlistMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeFromWatchlistMutation, { data, loading, error }] = useRemoveFromWatchlistMutation({
 *   variables: {
 *      symbol: // value for 'symbol'
 *   },
 * });
 */
export function useRemoveFromWatchlistMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RemoveFromWatchlistMutation,
    RemoveFromWatchlistMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<RemoveFromWatchlistMutation, RemoveFromWatchlistMutationVariables>(
    RemoveFromWatchlistDocument,
    options,
  );
}
export type RemoveFromWatchlistMutationHookResult = ReturnType<
  typeof useRemoveFromWatchlistMutation
>;
export type RemoveFromWatchlistMutationResult = Apollo.MutationResult<RemoveFromWatchlistMutation>;
export type RemoveFromWatchlistMutationOptions = Apollo.BaseMutationOptions<
  RemoveFromWatchlistMutation,
  RemoveFromWatchlistMutationVariables
>;
export const ToggleWatchlistAlertDocument = gql`
  mutation ToggleWatchlistAlert($symbol: String!, $enabled: Boolean!) {
    toggleWatchlistAlert(symbol: $symbol, enabled: $enabled) {
      symbol
      alertEnabled
    }
  }
`;
export type ToggleWatchlistAlertMutationFn = Apollo.MutationFunction<
  ToggleWatchlistAlertMutation,
  ToggleWatchlistAlertMutationVariables
>;

/**
 * __useToggleWatchlistAlertMutation__
 *
 * To run a mutation, you first call `useToggleWatchlistAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleWatchlistAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleWatchlistAlertMutation, { data, loading, error }] = useToggleWatchlistAlertMutation({
 *   variables: {
 *      symbol: // value for 'symbol'
 *      enabled: // value for 'enabled'
 *   },
 * });
 */
export function useToggleWatchlistAlertMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ToggleWatchlistAlertMutation,
    ToggleWatchlistAlertMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ToggleWatchlistAlertMutation, ToggleWatchlistAlertMutationVariables>(
    ToggleWatchlistAlertDocument,
    options,
  );
}
export type ToggleWatchlistAlertMutationHookResult = ReturnType<
  typeof useToggleWatchlistAlertMutation
>;
export type ToggleWatchlistAlertMutationResult =
  Apollo.MutationResult<ToggleWatchlistAlertMutation>;
export type ToggleWatchlistAlertMutationOptions = Apollo.BaseMutationOptions<
  ToggleWatchlistAlertMutation,
  ToggleWatchlistAlertMutationVariables
>;
export const NotificationPreferencesDocument = gql`
  query NotificationPreferences {
    notificationPreferences {
      id
      streakEnabled
      budgetEnabled
      priceAlertsEnabled
      portfolioEvtEnabled
      educationalEnabled
      quietHoursStart
      quietHoursEnd
      dailyCap
    }
  }
`;

/**
 * __useNotificationPreferencesQuery__
 *
 * To run a query within a React component, call `useNotificationPreferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useNotificationPreferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNotificationPreferencesQuery({
 *   variables: {
 *   },
 * });
 */
export function useNotificationPreferencesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    NotificationPreferencesQuery,
    NotificationPreferencesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<NotificationPreferencesQuery, NotificationPreferencesQueryVariables>(
    NotificationPreferencesDocument,
    options,
  );
}
export function useNotificationPreferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    NotificationPreferencesQuery,
    NotificationPreferencesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<NotificationPreferencesQuery, NotificationPreferencesQueryVariables>(
    NotificationPreferencesDocument,
    options,
  );
}
// @ts-ignore
export function useNotificationPreferencesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    NotificationPreferencesQuery,
    NotificationPreferencesQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  NotificationPreferencesQuery,
  NotificationPreferencesQueryVariables
>;
export function useNotificationPreferencesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        NotificationPreferencesQuery,
        NotificationPreferencesQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  NotificationPreferencesQuery | undefined,
  NotificationPreferencesQueryVariables
>;
export function useNotificationPreferencesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        NotificationPreferencesQuery,
        NotificationPreferencesQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    NotificationPreferencesQuery,
    NotificationPreferencesQueryVariables
  >(NotificationPreferencesDocument, options);
}
export type NotificationPreferencesQueryHookResult = ReturnType<
  typeof useNotificationPreferencesQuery
>;
export type NotificationPreferencesLazyQueryHookResult = ReturnType<
  typeof useNotificationPreferencesLazyQuery
>;
export type NotificationPreferencesSuspenseQueryHookResult = ReturnType<
  typeof useNotificationPreferencesSuspenseQuery
>;
export type NotificationPreferencesQueryResult = Apollo.QueryResult<
  NotificationPreferencesQuery,
  NotificationPreferencesQueryVariables
>;
export const UpdateNotificationPreferencesDocument = gql`
  mutation UpdateNotificationPreferences($input: UpdateNotificationPreferencesInput!) {
    updateNotificationPreferences(input: $input) {
      id
      streakEnabled
      budgetEnabled
      priceAlertsEnabled
      portfolioEvtEnabled
      educationalEnabled
      quietHoursStart
      quietHoursEnd
      dailyCap
    }
  }
`;
export type UpdateNotificationPreferencesMutationFn = Apollo.MutationFunction<
  UpdateNotificationPreferencesMutation,
  UpdateNotificationPreferencesMutationVariables
>;

/**
 * __useUpdateNotificationPreferencesMutation__
 *
 * To run a mutation, you first call `useUpdateNotificationPreferencesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNotificationPreferencesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNotificationPreferencesMutation, { data, loading, error }] = useUpdateNotificationPreferencesMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateNotificationPreferencesMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateNotificationPreferencesMutation,
    UpdateNotificationPreferencesMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateNotificationPreferencesMutation,
    UpdateNotificationPreferencesMutationVariables
  >(UpdateNotificationPreferencesDocument, options);
}
export type UpdateNotificationPreferencesMutationHookResult = ReturnType<
  typeof useUpdateNotificationPreferencesMutation
>;
export type UpdateNotificationPreferencesMutationResult =
  Apollo.MutationResult<UpdateNotificationPreferencesMutation>;
export type UpdateNotificationPreferencesMutationOptions = Apollo.BaseMutationOptions<
  UpdateNotificationPreferencesMutation,
  UpdateNotificationPreferencesMutationVariables
>;
export const StockDetailDocument = gql`
  query StockDetail($symbol: String!) {
    stock(symbol: $symbol) {
      symbol
      name
      ltp
      change
      changePct
      open
      high
      low
      close
      volume
      fetchedAt
    }
  }
`;

/**
 * __useStockDetailQuery__
 *
 * To run a query within a React component, call `useStockDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useStockDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStockDetailQuery({
 *   variables: {
 *      symbol: // value for 'symbol'
 *   },
 * });
 */
export function useStockDetailQuery(
  baseOptions: Apollo.QueryHookOptions<StockDetailQuery, StockDetailQueryVariables> &
    ({ variables: StockDetailQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<StockDetailQuery, StockDetailQueryVariables>(StockDetailDocument, options);
}
export function useStockDetailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<StockDetailQuery, StockDetailQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<StockDetailQuery, StockDetailQueryVariables>(
    StockDetailDocument,
    options,
  );
}
// @ts-ignore
export function useStockDetailSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<StockDetailQuery, StockDetailQueryVariables>,
): Apollo.UseSuspenseQueryResult<StockDetailQuery, StockDetailQueryVariables>;
export function useStockDetailSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<StockDetailQuery, StockDetailQueryVariables>,
): Apollo.UseSuspenseQueryResult<StockDetailQuery | undefined, StockDetailQueryVariables>;
export function useStockDetailSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<StockDetailQuery, StockDetailQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<StockDetailQuery, StockDetailQueryVariables>(
    StockDetailDocument,
    options,
  );
}
export type StockDetailQueryHookResult = ReturnType<typeof useStockDetailQuery>;
export type StockDetailLazyQueryHookResult = ReturnType<typeof useStockDetailLazyQuery>;
export type StockDetailSuspenseQueryHookResult = ReturnType<typeof useStockDetailSuspenseQuery>;
export type StockDetailQueryResult = Apollo.QueryResult<
  StockDetailQuery,
  StockDetailQueryVariables
>;
export const StockIntradayDocument = gql`
  query StockIntraday($symbol: String!) {
    stockIntraday(symbol: $symbol) {
      timestamp
      price
    }
  }
`;

/**
 * __useStockIntradayQuery__
 *
 * To run a query within a React component, call `useStockIntradayQuery` and pass it any options that fit your needs.
 * When your component renders, `useStockIntradayQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStockIntradayQuery({
 *   variables: {
 *      symbol: // value for 'symbol'
 *   },
 * });
 */
export function useStockIntradayQuery(
  baseOptions: Apollo.QueryHookOptions<StockIntradayQuery, StockIntradayQueryVariables> &
    ({ variables: StockIntradayQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<StockIntradayQuery, StockIntradayQueryVariables>(
    StockIntradayDocument,
    options,
  );
}
export function useStockIntradayLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<StockIntradayQuery, StockIntradayQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<StockIntradayQuery, StockIntradayQueryVariables>(
    StockIntradayDocument,
    options,
  );
}
// @ts-ignore
export function useStockIntradaySuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<StockIntradayQuery, StockIntradayQueryVariables>,
): Apollo.UseSuspenseQueryResult<StockIntradayQuery, StockIntradayQueryVariables>;
export function useStockIntradaySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<StockIntradayQuery, StockIntradayQueryVariables>,
): Apollo.UseSuspenseQueryResult<StockIntradayQuery | undefined, StockIntradayQueryVariables>;
export function useStockIntradaySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<StockIntradayQuery, StockIntradayQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<StockIntradayQuery, StockIntradayQueryVariables>(
    StockIntradayDocument,
    options,
  );
}
export type StockIntradayQueryHookResult = ReturnType<typeof useStockIntradayQuery>;
export type StockIntradayLazyQueryHookResult = ReturnType<typeof useStockIntradayLazyQuery>;
export type StockIntradaySuspenseQueryHookResult = ReturnType<typeof useStockIntradaySuspenseQuery>;
export type StockIntradayQueryResult = Apollo.QueryResult<
  StockIntradayQuery,
  StockIntradayQueryVariables
>;
export const OrderHistoryDocument = gql`
  query OrderHistory($limit: Int, $cursor: String) {
    orderHistory(limit: $limit, cursor: $cursor) {
      id
      symbol
      type
      quantity
      priceAtExecution
      orderValue
      realizedPnl
      status
      correlationId
      executedAt
    }
  }
`;

/**
 * __useOrderHistoryQuery__
 *
 * To run a query within a React component, call `useOrderHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrderHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrderHistoryQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      cursor: // value for 'cursor'
 *   },
 * });
 */
export function useOrderHistoryQuery(
  baseOptions?: Apollo.QueryHookOptions<OrderHistoryQuery, OrderHistoryQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<OrderHistoryQuery, OrderHistoryQueryVariables>(
    OrderHistoryDocument,
    options,
  );
}
export function useOrderHistoryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OrderHistoryQuery, OrderHistoryQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<OrderHistoryQuery, OrderHistoryQueryVariables>(
    OrderHistoryDocument,
    options,
  );
}
// @ts-ignore
export function useOrderHistorySuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<OrderHistoryQuery, OrderHistoryQueryVariables>,
): Apollo.UseSuspenseQueryResult<OrderHistoryQuery, OrderHistoryQueryVariables>;
export function useOrderHistorySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<OrderHistoryQuery, OrderHistoryQueryVariables>,
): Apollo.UseSuspenseQueryResult<OrderHistoryQuery | undefined, OrderHistoryQueryVariables>;
export function useOrderHistorySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<OrderHistoryQuery, OrderHistoryQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<OrderHistoryQuery, OrderHistoryQueryVariables>(
    OrderHistoryDocument,
    options,
  );
}
export type OrderHistoryQueryHookResult = ReturnType<typeof useOrderHistoryQuery>;
export type OrderHistoryLazyQueryHookResult = ReturnType<typeof useOrderHistoryLazyQuery>;
export type OrderHistorySuspenseQueryHookResult = ReturnType<typeof useOrderHistorySuspenseQuery>;
export type OrderHistoryQueryResult = Apollo.QueryResult<
  OrderHistoryQuery,
  OrderHistoryQueryVariables
>;
export const PlaceOrderDocument = gql`
  mutation PlaceOrder($input: PlaceOrderInput!) {
    placeOrder(input: $input) {
      id
      symbol
      type
      quantity
      priceAtExecution
      orderValue
      realizedPnl
      status
      correlationId
      executedAt
    }
  }
`;
export type PlaceOrderMutationFn = Apollo.MutationFunction<
  PlaceOrderMutation,
  PlaceOrderMutationVariables
>;

/**
 * __usePlaceOrderMutation__
 *
 * To run a mutation, you first call `usePlaceOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePlaceOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [placeOrderMutation, { data, loading, error }] = usePlaceOrderMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function usePlaceOrderMutation(
  baseOptions?: Apollo.MutationHookOptions<PlaceOrderMutation, PlaceOrderMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<PlaceOrderMutation, PlaceOrderMutationVariables>(
    PlaceOrderDocument,
    options,
  );
}
export type PlaceOrderMutationHookResult = ReturnType<typeof usePlaceOrderMutation>;
export type PlaceOrderMutationResult = Apollo.MutationResult<PlaceOrderMutation>;
export type PlaceOrderMutationOptions = Apollo.BaseMutationOptions<
  PlaceOrderMutation,
  PlaceOrderMutationVariables
>;
