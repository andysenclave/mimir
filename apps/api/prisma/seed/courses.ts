// MM-045 — Course seed script.
// Idempotent: upserts by title. Safe to re-run.
// Run via: pnpm seed:courses (from apps/api/)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// Content
// ─────────────────────────────────────────────────────────────────────────────

const COURSES = [
  {
    title: 'Stock Market Basics',
    description:
      'A ground-up introduction to how the Indian stock market works — from what a share actually is to the roles of NSE, BSE, and SEBI. No jargon, no shortcuts.',
    difficulty: 'BEGINNER',
    totalTimeMin: 40,
    orderIndex: 1,
    lessons: [
      {
        title: 'What Is a Stock?',
        orderIndex: 1,
        readTimeMin: 4,
        content: `## What Is a Stock?

When a company needs money to grow — to build a factory, hire engineers, or launch a new product — it has two broad options: borrow the money (debt) or sell a slice of ownership (equity). A **stock** represents that slice of ownership.

If a company is worth ₹1,000 crore and divides itself into 10 crore shares, each share is worth ₹100. When you hold one share, you own one ten-crore-th of the company. That's not a metaphor — you genuinely own a proportional piece of every building, every rupee of cash, every patent the company holds.

### What owning a share actually means

Shareholders have two concrete rights:

1. **Residual claim on assets.** If the company is wound up, shareholders receive whatever is left after all debts and liabilities are settled. This is why equity is riskier than debt — debt holders get paid first.
2. **Voting rights.** Most ordinary shares carry one vote per share, used at Annual General Meetings (AGMs) to elect the board of directors and approve major decisions.

In addition, if the company is profitable and the board declares a **dividend**, shareholders receive a cash payment proportional to their holding.

### Why share prices move

The price you see on a screen is not an accounting figure — it's the last agreed price between a willing buyer and a willing seller. Prices shift because people's expectations about the company's future earnings change. If 1,000 investors simultaneously decide a company will earn more next year, they compete to buy, pushing the price up. The reverse is also true.

This is important: the intrinsic value of a business changes slowly. The price changes every second. The gap between the two is where investing skill — and error — lives.

### A simple analogy

Think of a city food court with 10 equal stalls. If you buy one stall, you own 10% of the food court. If the food court earns ₹10 lakh profit this year, ₹1 lakh flows to you. If another investor wants to buy your stall, they'll offer a price based on how much profit they expect the food court to make in the future — not just what it earned last year.

The stock market is this process happening at scale, with millions of participants, for thousands of companies, every trading day.

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'Primary vs Secondary Market',
        orderIndex: 2,
        readTimeMin: 4,
        content: `## Primary vs Secondary Market

Money flows into the stock market through two distinct channels. Confusing them is one of the most common beginner mistakes.

### The primary market: new shares enter the world

The **primary market** is where a company sells shares directly to investors for the first time. The company receives the money. This happens through an **Initial Public Offering (IPO)**.

In an IPO, a company files a prospectus with SEBI (Securities and Exchange Board of India), discloses its financials, and invites the public to subscribe to shares at a fixed or book-built price. If you apply for shares in an IPO and receive an allotment, the money goes to the company (or to the promoters who are selling existing shares — this is called an Offer for Sale, or OFS).

After an IPO, the company's shares are **listed** on an exchange — usually NSE, BSE, or both.

### The secondary market: investors trade with each other

Once shares are listed, they trade on exchanges in the **secondary market**. Here, you are buying from another investor, not from the company. The company receives no money from secondary market transactions.

When you open Zerodha or Groww and press "buy", you're almost certainly participating in the secondary market. The price is determined by supply and demand in real time.

### Why this distinction matters

It explains why a company's stock price has no direct effect on the company's day-to-day operations. Apple's share price falling 20% doesn't reduce Apple's cash or its ability to build iPhones — unless it needs to raise new capital and a lower share price makes that expensive. The primary market connects price to company funding; the secondary market connects price to investor expectations.

### Rights issues and FPOs

Companies can re-enter the primary market after an IPO:
- **Follow-on Public Offer (FPO):** selling new shares to the public again.
- **Rights issue:** offering new shares exclusively to existing shareholders at a discount to the market price.

In both cases, existing shareholders are diluted — their percentage ownership falls, even if the absolute number of their shares stays the same.

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'Bulls, Bears, and Market Cycles',
        orderIndex: 3,
        readTimeMin: 4,
        content: `## Bulls, Bears, and Market Cycles

Financial media uses "bull" and "bear" constantly. They're not just jargon — they describe distinct psychological and structural phases that markets move through over time.

### Bull market

A **bull market** is a sustained period of rising prices, typically defined as a rise of 20% or more from a recent trough. Bull markets are driven by:
- Strong corporate earnings
- Low interest rates (making equities attractive relative to fixed deposits)
- Optimistic investor sentiment
- Economic expansion (GDP growth, job creation, rising consumer spending)

India's benchmark index — the NIFTY 50 — has been in a bull market for most of the period from 2003 to today, with interruptions.

### Bear market

A **bear market** is a sustained decline of 20% or more from a recent peak. It reflects:
- Declining corporate earnings
- Rising interest rates (making fixed income more attractive)
- Economic contraction or recession fears
- Panic selling reinforcing itself

The COVID crash of March 2020 was a sharp bear market — NIFTY 50 fell nearly 38% in five weeks. It recovered to new highs by early 2021.

### Why cycles matter

Bull and bear markets don't follow a fixed schedule. Historically, bull markets last longer than bear markets, but bear markets are sharper and psychologically harder to endure. The average investor's instinct — to buy when prices are rising and sell when prices are falling — is the opposite of disciplined strategy.

Understanding cycles helps you recognise that:
- Paper losses in a bear market are temporary if the underlying business is sound.
- Valuations that feel cheap during a bear market are often high-quality opportunities.
- "This time is different" is said at the top of every bull market and is almost never true.

### Corrections vs crashes

Not every decline is a bear market:
- A **correction** is a decline of 10–20% — common and healthy, historically occurring roughly once a year.
- A **crash** is a sudden, severe decline, often driven by panic rather than fundamentals.

Markets have recovered from every crash in Indian history. That's not a guarantee — it's a historical observation.

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'Market Hours and Trading Sessions',
        orderIndex: 4,
        readTimeMin: 3,
        content: `## Market Hours and Trading Sessions

Indian equity markets don't run 24 hours. Understanding the session structure helps you know when prices are live, when orders execute, and why prices sometimes jump at the open.

### NSE and BSE trading hours (IST)

| Session | Timing | Purpose |
|---|---|---|
| Pre-open | 09:00 – 09:15 | Price discovery, order collection |
| Regular trading | 09:15 – 15:30 | Continuous matching |
| Closing session | 15:30 – 15:40 | Final price calculation |
| Post-market | 15:40 – 16:00 | AMO order placement |

### Pre-open session (09:00–09:15)

The 15-minute pre-open session is split into:
- **09:00–09:08:** Order entry. Buyers and sellers submit bids. No trades execute.
- **09:08–09:12:** Matching. The exchange calculates the opening price that maximises the number of shares traded (the equilibrium price). This is why the first trade price sometimes differs significantly from yesterday's close.
- **09:12–09:15:** Buffer for system transition.

### Regular session (09:15–15:30)

Continuous two-way auction. Every new order immediately matches against the best available counter-order. Prices update in real time.

### Closing price

At 15:30, the **official closing price** is calculated as the volume-weighted average price (VWAP) of the last 30 minutes of trading. This number is used for:
- Benchmarks and index calculations
- Mutual fund NAV calculations
- Derivatives settlement

### Why it matters for a paper trading app

In Mimir, when you place a simulated order, it executes at the last-traded price (LTP) from NSE data. If the market is closed, prices are stale — they reflect the previous session's close, not the current moment. The price you see at 8 PM is the closing price, not a live quote.

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'What Brokers Do',
        orderIndex: 5,
        readTimeMin: 3,
        content: `## What Brokers Do (In the Context of a Simulator)

In the real market, you can't buy shares directly from a stock exchange. You need an intermediary — a **broker**. Understanding what brokers do helps you understand the infrastructure Mimir simulates.

### The broker's core job

A registered stockbroker is a SEBI-registered entity that:
1. Holds a trading terminal (electronic access) on NSE/BSE.
2. Accepts orders from you.
3. Routes those orders to the exchange.
4. Settles the trade — transferring shares to your demat account and debiting your linked bank account.

Without a broker, retail investors have no access to the exchange. This is unlike buying directly from a shop.

### Discount vs full-service brokers

| Type | Examples | Fee model | Services |
|---|---|---|---|
| Discount | Zerodha, Upstox, Groww | Flat fee per trade (₹20 or less) | Execution only |
| Full-service | ICICI Direct, HDFC Securities | % of trade value | Execution + research + advisory |

Most new retail investors in India now use discount brokers. The shift happened after Zerodha proved that sub-₹20 flat-fee execution was viable at scale.

### Demat and trading accounts

To trade in India, you need two accounts:
- **Demat account** (with a Depository Participant): holds your shares electronically. India uses two depositories — NSDL and CDSL.
- **Trading account** (with a broker): the interface through which you place orders.

Most brokers bundle both under one application process.

### What Mimir simulates

Mimir bypasses the broker layer entirely — you interact directly with a simulation that uses real NSE prices. There are no brokerage fees, no slippage on large orders, and no settlement cycles. This is intentional: the goal is to learn market behaviour, not brokerage operations.

When you eventually trade with real money, the interface will feel familiar, but you'll encounter these additional layers.

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'What Is a Demat Account?',
        orderIndex: 6,
        readTimeMin: 3,
        content: `## What Is a Demat Account?

Before 1996, shares in India were physical paper certificates. If your certificate was lost, stolen, or damaged, proving ownership was a nightmare. The dematerialisation (demat) system replaced all of this with electronic records.

### Dematerialisation

**Dematerialisation** is the process of converting physical share certificates into electronic form. Today, almost all trading in India is done with dematerialised shares. Physical certificates still exist for older holdings but are rarely used.

The two institutions that hold these electronic records are:
- **NSDL** (National Securities Depository Limited) — promoted by NSE
- **CDSL** (Central Depository Services Limited) — promoted by BSE

When you buy 50 shares of HDFC Bank, CDSL or NSDL records that fact against your unique Demat account number (a 16-digit number). There is no physical paper involved.

### Depository Participant (DP)

You don't open a demat account directly with NSDL or CDSL. You do it through a **Depository Participant** — a SEBI-registered intermediary (your broker, or sometimes a bank).

The DP is like a post office branch: NSDL/CDSL is the central system; the DP is your local access point.

### How shares move on a trade

When you sell 50 shares of HDFC Bank:
1. Your broker routes the sell order to the exchange.
2. The exchange matches it with a buyer.
3. Settlement happens on **T+1** (next working day after the trade, following SEBI's 2023 change).
4. NSDL/CDSL debits 50 shares from your demat account and credits them to the buyer's.
5. ₹X is credited to your linked bank account.

This entire process is electronic and automatic once the order is executed.

### Annual Maintenance Charge (AMC)

Most DPs charge an Annual Maintenance Charge for your demat account — typically ₹300–₹750 per year. Some discount brokers offer zero AMC for the first year. This is worth factoring in when you open your first real account.

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'NSE vs BSE',
        orderIndex: 7,
        readTimeMin: 3,
        content: `## NSE vs BSE: India's Two Main Exchanges

India has two major stock exchanges — the **National Stock Exchange (NSE)** and the **Bombay Stock Exchange (BSE)**. Most stocks are listed on both. Understanding the difference helps you make sense of price feeds, indices, and order routing.

### A brief history

**BSE (Bombay Stock Exchange)** was established in 1875 — making it one of the oldest exchanges in Asia. For most of the 20th century, it was India's dominant exchange.

**NSE (National Stock Exchange)** was established in 1992 and launched trading in 1994, with the explicit goal of bringing electronic, anonymous, order-driven trading to India. NSE overtook BSE in trading volumes within a decade and has maintained dominance in equities and derivatives since.

### Practical differences for retail investors

| Feature | NSE | BSE |
|---|---|---|
| Benchmark index | NIFTY 50 | SENSEX (30 stocks) |
| Equities volume | ~90% of total | ~10% of total |
| Derivatives | Dominant | Smaller, less liquid |
| Ticker symbol format | RELIANCE | 500325 (BSE code) |

In practice, most retail investors and all major discount brokers default to NSE for equity orders because it has better liquidity (tighter spreads, faster fills). BSE is still actively used for SME IPOs and some mid-cap stocks.

### NIFTY 50 vs SENSEX

- **NIFTY 50** tracks the 50 largest companies by free-float market capitalisation listed on NSE. It's the more widely used benchmark for fund performance, ETFs, and index derivatives.
- **SENSEX (S&P BSE SENSEX)** tracks 30 large-cap companies on BSE. Older and more familiar in popular media, but less representative than NIFTY 50.

Both indices are dominated by the same large-cap names (Reliance, TCS, HDFC Bank, Infosys), so they tend to move together — correlation above 0.99.

### In Mimir

Mimir uses NSE prices exclusively. When you see a stock price, it's the NSE last-traded price.

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'Who Participates in the Market?',
        orderIndex: 8,
        readTimeMin: 4,
        content: `## Who Participates in the Market?

Understanding the different types of participants helps explain why prices move the way they do — and why retail investors often find themselves on the wrong side of a trade.

### Retail investors

Individual investors buying and selling with personal funds. Retail participation in India has surged post-COVID: demat accounts grew from ~4 crore in 2020 to over 15 crore by 2024. Retail investors typically trade in smaller sizes, react more to news and social media, and have shorter time horizons than institutional players.

### Domestic Institutional Investors (DIIs)

Indian institutions — mutual funds, insurance companies (LIC), pension funds (EPFO's equity component), and banks. Mutual funds collectively manage over ₹50 lakh crore in assets (as of 2025). DIIs are often net buyers when FIIs are selling, providing a price floor during panics.

### Foreign Institutional Investors (FIIs / FPIs)

Foreign Portfolio Investors include hedge funds, sovereign wealth funds, pension funds, and asset managers registered outside India. FII flows are a dominant short-term driver of NIFTY 50 volatility. Large FII outflows (e.g., when the US Fed raises rates aggressively) can drive sustained market corrections even if Indian corporate fundamentals are unchanged.

### Promoters

Company insiders who own large stakes. In India, promoter holding is publicly disclosed quarterly. High promoter holding often signals confidence; promoters selling shares is watched closely by analysts.

### Market Makers and Proprietary Traders

Entities that provide continuous two-way quotes (buy and sell prices) to maintain liquidity, or trade for their own account. They don't take directional bets over long periods — they profit from the spread (the difference between bid and ask).

### High-Frequency Traders (HFTs)

Algorithmic systems executing thousands of orders per second, profiting from tiny price discrepancies. NSE's co-location facility allows HFTs to place their servers physically close to the exchange's matching engine. Retail investors don't compete with HFTs directly — HFTs operate in a different time frame.

### Why this matters

Markets are not random — they're the aggregated decisions of participants with different information, time horizons, and incentives. When you see a stock fall 5% in one day, it's worth asking: who is selling, and why? Sometimes it's forced selling (FII outflows, index rebalancing). Sometimes it's genuine information about the company. These have very different implications for what the stock does next.

---
*Educational simulation. Not investment advice.*`,
      },
    ],
  },
  {
    title: 'Reading P/E Ratios & Valuation',
    description:
      'Learn how to interpret the P/E ratio, compare it against sector benchmarks, and understand why a high P/E is sometimes justified — and sometimes a warning.',
    difficulty: 'INTERMEDIATE',
    totalTimeMin: 30,
    orderIndex: 2,
    lessons: [
      {
        title: 'What Is the P/E Ratio?',
        orderIndex: 1,
        readTimeMin: 4,
        content: `## What Is the P/E Ratio?

The **Price-to-Earnings ratio (P/E)** is one of the most widely cited valuation metrics. It answers a simple question: how much are investors willing to pay today for each rupee of a company's current earnings?

### The formula

**P/E = Market Price per Share ÷ Earnings per Share (EPS)**

Where:
- **Market price** is the current share price.
- **EPS (Earnings per Share)** = Net Profit ÷ Number of Shares Outstanding

If HDFC Bank's share price is ₹1,600 and its EPS over the past 12 months is ₹80, its P/E is:
**₹1,600 ÷ ₹80 = 20**

This means the market is paying ₹20 for every ₹1 of annual earnings. Another way to read it: at this price and earnings rate, it would take 20 years of earnings to "pay back" the share price.

### Trailing vs Forward P/E

- **Trailing P/E (TTM — Trailing Twelve Months):** Uses the last four quarters of reported earnings. This is historical and factual.
- **Forward P/E:** Uses analyst estimates for next year's earnings. This is a forecast and can be wrong.

Financial data providers (Screener.in, NSE website) show both. Trailing P/E is more reliable; forward P/E is more relevant if you believe the company's earnings profile is changing.

### What P/E does and doesn't measure

P/E measures relative valuation — how much the market is currently paying for earnings. It does NOT:
- Tell you if the company is fundamentally good.
- Account for debt (companies with the same P/E but different debt levels have very different risk profiles).
- Adjust for earnings quality (one-time gains can inflate EPS without reflecting ongoing business performance).

P/E is a starting point, not a conclusion.

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'How to Calculate P/E',
        orderIndex: 2,
        readTimeMin: 3,
        content: `## How to Calculate P/E

The formula is simple. The inputs require some care.

### Step 1: Find the current market price

This is straightforward — look it up on NSE's website or any financial data provider. The price you see in Mimir is the NSE last-traded price.

### Step 2: Find the EPS

This is where investors sometimes slip up. EPS has multiple versions:

**Basic EPS** = Net Profit ÷ Weighted Average Shares Outstanding

**Diluted EPS** accounts for all potential shares that could be issued (from ESOPs, convertible bonds, warrants). Diluted EPS is always ≤ Basic EPS. For companies with significant ESOP programmes (most tech companies), diluted EPS is more conservative and more useful.

### Where to find Indian company EPS

1. **NSE website** (nseindia.com → Company Info → Financial Results)
2. **BSE Filings** (bseindia.com → Annual Results)
3. **Screener.in** — aggregates financials neatly; shows TTM EPS automatically.
4. **Company's quarterly results** — the earnings-per-share line in the Profit & Loss statement.

### A worked example

Assume:
- Company: Tata Consultancy Services (TCS)
- Current price: ₹3,800
- TTM EPS (from Screener.in): ₹128

P/E = 3,800 ÷ 128 = **29.7**

The market is paying roughly ₹30 for every ₹1 of TCS's annual earnings. Now compare this to sector peers to decide if that's cheap or expensive.

### Negative EPS

If a company has negative EPS (a net loss), the P/E ratio is undefined or reported as "N/A". You can't meaningfully calculate how many times a loss you're paying. Loss-making companies are valued differently — often on revenue multiples (Price/Sales) or enterprise-value-to-EBITDA.

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'Sector Average P/E Benchmarks (India)',
        orderIndex: 3,
        readTimeMin: 4,
        content: `## Sector Average P/E Benchmarks in India

A P/E of 25 means nothing in isolation. The only way to use P/E is relative: relative to the company's own history, and relative to peers in the same sector.

### Why sectors differ

Different industries have structurally different P/E ranges because they have different:
- **Growth rates:** A fast-growing IT services company can justify a higher P/E than a mature cement company.
- **Capital intensity:** Asset-heavy industries (steel, power) trade at lower P/Es than asset-light businesses (software, FMCG).
- **Cyclicality:** Commodity businesses have volatile earnings, so P/E multiples compress at cycle peaks and expand at troughs — sometimes making P/E misleading.
- **Regulatory environments:** Banks have ROE caps and capital constraints that affect how the market values them.

### Approximate long-term P/E ranges for Indian sectors

| Sector | Typical P/E range |
|---|---|
| FMCG (Hindustan Unilever, Nestle India) | 50–80x |
| IT Services (TCS, Infosys, Wipro) | 22–35x |
| Private Banks (HDFC Bank, Kotak) | 18–28x |
| PSU Banks (SBI, Bank of Baroda) | 8–14x |
| Pharma (Sun Pharma, Cipla) | 20–35x |
| Auto (Maruti, M&M) | 18–28x |
| Metals/Mining (Tata Steel, JSW) | 5–12x |
| Power (NTPC, Power Grid) | 10–18x |
| Real Estate | Wide variation; often better to use P/B |

These are rough historical ranges, not rules. Market conditions shift these dramatically.

### Using the NIFTY 50 P/E as a macro anchor

NSE publishes the NIFTY 50 P/E daily. Historically:
- Below 16–18: Market relatively cheap; rare buying opportunity
- 18–22: Fair value zone
- Above 25: Market above historical average; margin of safety thinner

The NIFTY 50 P/E was above 40 during the November 2020 post-COVID rally — historically extreme. By 2024 it had returned to the 22–24 range.

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'Growth Stocks vs Value Stocks',
        orderIndex: 4,
        readTimeMin: 4,
        content: `## Growth Stocks vs Value Stocks

Two of the most enduring labels in equity investing — and the source of much misunderstood debate. The distinction is not binary; it's a spectrum, and most stocks sit somewhere in between.

### Growth stocks

A **growth stock** is a company expected to grow its earnings (or revenues) significantly faster than the broader market. Investors pay a premium (high P/E, sometimes 40–80x or more) because they expect future earnings to be much larger than today's.

Examples in India: Dixon Technologies (contract electronics), Delhivery (logistics), several specialty chemicals companies.

Characteristics:
- Often reinvests most profits — low or zero dividends
- High P/E relative to sector
- Valuation is highly sensitive to interest rates (high rates discount future cash flows more aggressively)
- Large downside if growth slows or misses expectations

### Value stocks

A **value stock** trades at a discount to the investor's estimate of its intrinsic worth — often reflected in a below-average P/E, low Price-to-Book, or high dividend yield. The bet is that the market has mispriced the company and the price will eventually converge to fair value.

Examples in India: PSU banks, certain commodity companies, state-run utilities.

Characteristics:
- Often mature, slow-growing businesses
- May have above-average dividends
- The "value trap" risk: cheap for a reason that doesn't go away

### What actually matters

The growth/value label is less important than the quality of the business and the price you pay. A wonderful company bought at an excessive price can be a poor investment. A mediocre company bought at a severe discount can outperform. Indian investing legend Raamdeo Agrawal's QGLP framework — Quality, Growth, Longevity, Price — captures this balance better than a binary growth/value label.

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'When a High P/E Is Justified',
        orderIndex: 5,
        readTimeMin: 4,
        content: `## When a High P/E Is Justified

A P/E of 60 sounds absurd — but for the right business, it can be entirely rational. Understanding when a high multiple is deserved (rather than just enthusiastic speculation) is one of the most important skills in equity analysis.

### The PEG ratio: P/E relative to growth

**PEG = P/E ÷ Expected Earnings Growth Rate (%)**

If a company has a P/E of 60 but its EPS is growing at 40% per year, its PEG is 1.5. A company with a P/E of 15 growing at 5% has a PEG of 3. By this measure, the "expensive" 60 P/E company is actually cheaper relative to its growth.

PEG below 1 is often considered attractive; above 2 is expensive. These are heuristics, not rules.

### Durability of the business model

High P/Es are justifiable when a company has:

1. **Strong competitive moat:** A durable advantage that prevents competitors from eroding margins. In India, this might be a dominant distribution network (Asian Paints), an irreplaceable brand (Hindustan Unilever's flagship products), or network effects.

2. **Pricing power:** The ability to raise prices without losing customers. FMCG and private hospitals have more pricing power than commodity producers.

3. **High return on equity (ROE) with low capital needs:** A business that grows earnings without needing to raise a lot of external capital is worth more. Asset-light software businesses fit this profile.

4. **Long runway for growth:** India's per-capita consumption of most categories remains far below developed-market levels — companies in the right categories have years of growth ahead.

### The risk of overpaying

Even a genuinely great business can be a poor investment if you pay too much. If you pay 80x earnings for a company that grows at 15%, a re-rating to 25x (still a premium) would result in a significant loss — even if earnings double. The price you pay matters as much as the quality you're buying.

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'Common Valuation Pitfalls',
        orderIndex: 6,
        readTimeMin: 4,
        content: `## Common Valuation Pitfalls

P/E is a blunt instrument. Used carelessly, it produces conclusions that are confidently wrong. Here are the most common mistakes.

### 1. Comparing P/E across sectors

A P/E of 12 for an IT company sounds cheap; for a steel company it might be expensive. Sectors have structurally different growth rates, capital requirements, and risks. Cross-sector P/E comparisons are almost always misleading.

### 2. Using peak-cycle earnings as the denominator

Commodity companies — metals, chemicals, oil — have highly cyclical earnings. At the peak of a cycle, EPS is abnormally high, making P/E look cheap. This is the **value trap**: the P/E is low because the E is temporarily inflated, not because the P is genuinely low.

In these cases, use **normalised earnings** (average EPS over a full cycle) rather than last year's earnings.

### 3. Ignoring debt

P/E only looks at equity value relative to earnings for equity holders. A company with ₹10,000 crore in debt and a P/E of 8 might look cheap, but the **Enterprise Value / EBITDA** ratio would tell a different story. EV/EBITDA accounts for the total cost of acquiring the business (equity + debt) relative to operating cash flow.

### 4. Trusting earnings that are manufactured

One-time gains — selling an asset, receiving a tax credit, reversing a provision — can inflate EPS without reflecting ongoing business performance. Always read the notes to accounts when a company's earnings jump unexpectedly.

### 5. Anchoring on a single metric

P/E is one tool. Use it alongside:
- **Price-to-Book (P/B):** Useful for banks and asset-heavy companies.
- **EV/EBITDA:** Better for comparing companies with different capital structures.
- **Price-to-Free-Cash-Flow (P/FCF):** Earnings can be manipulated; free cash flow is harder to fake.
- **Dividend yield:** Relevant for income-focused investors.

No single ratio tells you everything. The goal is triangulation — multiple metrics pointing in the same direction.

---
*Educational simulation. Not investment advice.*`,
      },
    ],
  },
  {
    title: 'Diversification & Sector Allocation',
    description:
      'Why spreading risk across sectors and asset classes is more than a cliché — and how to think about diversification practically in the Indian market.',
    difficulty: 'INTERMEDIATE',
    totalTimeMin: 30,
    orderIndex: 3,
    lessons: [
      {
        title: 'Why Diversification Matters',
        orderIndex: 1,
        readTimeMin: 4,
        content: `## Why Diversification Matters

"Don't put all your eggs in one basket" is so old it sounds like a platitude. The mathematical case for diversification is more precise — and more powerful — than the folk wisdom suggests.

### Risk: systematic vs unsystematic

Every stock carries two types of risk:

1. **Unsystematic (company-specific) risk:** A pharmaceutical company might face a drug recall. An IT company might lose a key client. A promoter might be found guilty of fraud. These risks are specific to the company and are not shared by the broader market.

2. **Systematic (market) risk:** Interest rate changes, recessions, geopolitical events, and pandemics affect all stocks to varying degrees. You cannot diversify away systematic risk by holding more stocks.

### The diversification effect

When you hold multiple stocks whose returns are not perfectly correlated, the volatility of your portfolio is lower than the average volatility of its components. This is not intuitive, but it's mathematically provable.

If Stock A drops 15% when an IT project is cancelled, and Stock B (in a different sector) is unaffected, a 50-50 portfolio only drops 7.5%. The loss is real but smaller. Across 20+ stocks in uncorrelated sectors, unsystematic risk becomes negligible.

Studies of US markets suggest that 20–25 stocks across different sectors is sufficient to eliminate most unsystematic risk. Indian studies show similar results, though concentrated in fewer sectors.

### What diversification does NOT protect you from

In a 2008-style global financial crisis or a COVID crash, correlations between all assets spike toward 1 — everything falls together. This is the systematic risk that cannot be diversified away within equities. True diversification requires spreading across asset classes (equities, debt, gold, real estate).

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'Correlation Basics',
        orderIndex: 2,
        readTimeMin: 3,
        content: `## Correlation Basics

Diversification works because different assets don't move in lockstep. Understanding correlation — even roughly — helps you build a portfolio that actually spreads risk instead of just owning more names.

### What correlation measures

**Correlation** (expressed as a number between -1 and +1) measures how two assets' returns move relative to each other:

- **+1:** Perfect positive correlation — they always move in the same direction by the same amount.
- **0:** No linear relationship — moves are independent.
- **-1:** Perfect negative correlation — one goes up exactly when the other goes down.

In practice, most stocks within the same index have correlation between 0.3 and 0.7. This is why diversification helps but doesn't eliminate all volatility.

### High correlation examples in India

- HDFC Bank and ICICI Bank: highly correlated (~0.85) — both affected by the same factors (RBI policy, credit cycle, systemic banking risk).
- NIFTY IT stocks (TCS, Infosys, Wipro, HCL Tech): highly correlated — all depend on global IT spend, USD/INR rate, and US hiring cycles.

Owning three private banks provides far less diversification than owning one bank and one FMCG company.

### Low (or negative) correlation examples

- Gold and equities: historically low or slightly negative correlation. Gold tends to hold or gain value when equity markets fall sharply.
- IT stocks and power sector stocks: relatively low correlation — different economic drivers.

### The practical takeaway

When building a portfolio in Mimir, consider whether your stocks' prices are driven by the same underlying factors. If they are, you're concentrating risk, not diversifying it — regardless of how many names you hold.

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'Sector Rotation in Indian Markets',
        orderIndex: 3,
        readTimeMin: 4,
        content: `## Sector Rotation in Indian Markets

Markets don't lift all boats equally at all times. Different sectors lead at different points in an economic cycle — and recognising these patterns helps you understand market moves you might otherwise find random.

### What sector rotation is

**Sector rotation** is the process by which institutional money moves from one sector to another as economic conditions change. It's not a conspiracy — it's the aggregate result of millions of rational portfolio decisions responding to the same macro signals.

### The economic cycle and sector leadership in India

| Phase | What's happening | Sectors that typically lead |
|---|---|---|
| Early recovery | GDP growth picking up, rates low | Cyclicals: auto, real estate, consumer discretionary |
| Mid-cycle expansion | Strong growth, rising earnings | Broad market, banks (credit growth), industrials |
| Late cycle | High inflation, rising rates | Energy, commodities, healthcare |
| Slowdown / recession | Earnings contracting | Defensives: FMCG, pharma, IT services (global demand) |

### Indian-specific patterns

India's market is influenced by:
- **RBI rate cycles:** Rate cuts benefit rate-sensitive sectors (banks, real estate, auto finance). Rate hikes hurt them.
- **Monsoon:** Good monsoon → rural demand → two-wheeler manufacturers, FMCG, agrochemicals outperform.
- **Government capex:** Infrastructure, defence, railways — heavily driven by Union Budget announcements and actual disbursement.
- **INR/USD:** IT companies earn in USD. A weaker rupee expands margins for IT exporters; it hurts importers (oil, electronics components).

### Why this matters for your Mimir portfolio

You won't time sector rotation perfectly — professional fund managers rarely do. But awareness helps you avoid the mistake of loading up on cyclical stocks at the peak of a cycle, or selling defensives during a temporary correction.

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'Equal-Weight vs Market-Cap Weighting',
        orderIndex: 4,
        readTimeMin: 3,
        content: `## Equal-Weight vs Market-Cap Weighting

When you build a portfolio, you have to decide how much of your budget to allocate to each stock. Two foundational approaches — equal-weight and market-cap weight — reflect very different assumptions about markets.

### Equal-weight

An **equal-weighted portfolio** allocates the same rupee amount to every stock, regardless of size. If you hold 10 stocks with ₹1 lakh, you put ₹10,000 in each.

**Advantages:**
- Simple to implement and understand.
- Provides more exposure to smaller companies that might have higher growth.
- Forces you to "trim the winners and add to the laggards" on rebalancing — a built-in contrarian discipline.

**Disadvantages:**
- Ignores size — a company 10x larger doesn't get 10x the weight.
- Higher turnover on rebalancing, especially if you add many stocks.

### Market-cap weight

A **market-cap weighted portfolio** allocates proportionally to each company's market capitalisation. Larger companies get bigger weights. This is how the NIFTY 50 works: Reliance Industries (India's largest company by market cap) has the highest weight.

**Advantages:**
- Self-rebalancing: as prices change, weights naturally drift with the market, reducing turnover.
- Reflects the market's consensus on relative value.
- Low cost to track via index funds.

**Disadvantages:**
- "Buys more of what went up" — concentration risk grows as winners dominate the index.
- In the NIFTY 50, the top 10 stocks account for over 60% of the index weight.

### Which is better?

Research suggests equal-weight indices outperform market-cap indices over long periods (due to the small-cap effect and the contrarian rebalancing), but with higher volatility and transaction costs. For a paper trading simulation, equal-weight is a good starting discipline.

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'How and When to Rebalance',
        orderIndex: 5,
        readTimeMin: 3,
        content: `## How and When to Rebalance

A portfolio you built with deliberate sector allocations will drift over time as different stocks perform differently. Rebalancing is the process of bringing it back to target.

### Why portfolios drift

If you start with 10% in each of 10 sectors and the IT sector doubles while metals fall 30%, your IT weight is now ~18% and metals is ~5%. Your portfolio's risk profile has changed — you're now much more exposed to IT-specific risks than you intended.

### Rebalancing approaches

**Calendar-based (time-triggered):**
- Review on a fixed schedule: quarterly, semi-annually, or annually.
- Simple, low effort, ignores magnitude of drift.
- Most individual investors use this approach.

**Threshold-based (event-triggered):**
- Rebalance only when any position drifts more than X% from target (e.g., 5 percentage points).
- More efficient: only rebalances when it matters.
- Requires periodic monitoring.

### What rebalancing involves

- Trim positions that have grown beyond target weight.
- Add to positions that have fallen below target weight.

In a taxable account (real money), this has tax implications — selling creates a capital gains event. In Mimir, there are no tax considerations, so rebalancing is pure portfolio mechanics.

### How often is right?

Annual rebalancing is sufficient for most long-term portfolios. More frequent rebalancing increases transaction costs and taxes without meaningfully improving returns. Less frequent rebalancing risks large concentration risk building up.

In your Mimir portfolio, the budget resets each month, which creates a natural forced rebalancing moment: you decide how to deploy new capital, which lets you correct imbalances without selling.

---
*Educational simulation. Not investment advice.*`,
      },
      {
        title: 'Common Diversification Mistakes',
        orderIndex: 6,
        readTimeMin: 4,
        content: `## Common Diversification Mistakes

Most investors think they're diversified. Many are not. These are the mistakes that create the illusion of diversification without the substance.

### 1. Owning many stocks in the same sector

Holding HDFC Bank, ICICI Bank, Axis Bank, Kotak Bank, and SBI feels like holding five stocks. It's really one concentrated bet on the Indian banking sector. If RBI raises rates aggressively or the credit cycle turns, all five drop together.

True diversification requires exposure to different underlying economic drivers.

### 2. Owning multiple mutual funds with overlapping portfolios

India has hundreds of mutual funds. Many large-cap funds hold the same 30–40 stocks in similar proportions. Owning five large-cap funds is not owning five diversified portfolios — it's owning one large-cap portfolio with five management fee structures.

Before adding a new fund, compare its top-10 holdings against your existing funds.

### 3. Over-diversification (deworsification)

Above ~25–30 stocks in a single asset class, the marginal reduction in unsystematic risk becomes negligible — but your ability to understand each position deteriorates. Peter Lynch called this "deworsification." The 27th stock in your portfolio requires almost no additional risk reduction but demands the same research.

More stocks is not automatically better.

### 4. Confusing geographic diversification for stock diversification

Owning stocks that are all domestic-demand-driven Indian companies doesn't give you protection from an India-specific shock (a fiscal crisis, a political crisis, a monsoon failure). International diversification — through global ETFs or ADRs — addresses this, but is beyond the scope of Mimir's simulation.

### 5. Ignoring correlation changes in a crisis

In 2020, the correlations between stocks, sectors, and even asset classes spiked. "Diversified" portfolios fell almost as sharply as concentrated ones. True crisis protection requires instruments that are structurally uncorrelated — gold, short-duration sovereign bonds, cash. Equity diversification alone is insufficient for tail-risk protection.

---
*Educational simulation. Not investment advice.*`,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Concepts — 30 distinct ideas, distributed across lessons
// ─────────────────────────────────────────────────────────────────────────────

interface ConceptDef {
  title: string;
  body: string;
  orderIndex: number;
  // lessonTitle used to look up lessonId after lessons are seeded
  lessonTitle: string;
}

const CONCEPT_DEFS: ConceptDef[] = [
  { orderIndex: 1,  lessonTitle: 'What Is a Stock?',                    title: 'Residual claim',         body: 'Shareholders receive what remains after all debts and liabilities are settled when a company is wound up. This residual claim is why equity is riskier than debt.' },
  { orderIndex: 2,  lessonTitle: 'What Is a Stock?',                    title: 'Dividend',               body: 'A cash payment made to shareholders from company profits, proportional to the number of shares held. Not all profitable companies pay dividends — many reinvest profits for growth.' },
  { orderIndex: 3,  lessonTitle: 'Primary vs Secondary Market',         title: 'IPO',                    body: 'Initial Public Offering — the first time a company sells its shares to the public. Money from an IPO goes to the company (or selling shareholders in an OFS).' },
  { orderIndex: 4,  lessonTitle: 'Primary vs Secondary Market',         title: 'Listing',                body: 'After an IPO, shares begin trading on an exchange. The company\'s shares are said to be listed from that point onward.' },
  { orderIndex: 5,  lessonTitle: 'Bulls, Bears, and Market Cycles',     title: 'Bull market',            body: 'A sustained rise of 20%+ from a recent trough, typically driven by strong earnings, low rates, and optimistic sentiment.' },
  { orderIndex: 6,  lessonTitle: 'Bulls, Bears, and Market Cycles',     title: 'Bear market',            body: 'A sustained decline of 20%+ from a recent peak, typically driven by deteriorating fundamentals, rising rates, or panic.' },
  { orderIndex: 7,  lessonTitle: 'Market Hours and Trading Sessions',   title: 'Pre-open session',       body: 'The 15-minute window before regular trading where orders are collected and the opening equilibrium price is calculated. No trades execute during order entry (09:00–09:08).' },
  { orderIndex: 8,  lessonTitle: 'Market Hours and Trading Sessions',   title: 'VWAP',                   body: 'Volume-Weighted Average Price — the average price weighted by volume. NSE uses the last-30-minute VWAP to calculate the official closing price.' },
  { orderIndex: 9,  lessonTitle: 'What Brokers Do',                     title: 'Discount broker',        body: 'A SEBI-registered broker that provides execution-only services at a flat fee per trade (₹20 or less), without research or advisory services. Zerodha and Upstox are the largest in India.' },
  { orderIndex: 10, lessonTitle: 'What Is a Demat Account?',            title: 'Dematerialisation',      body: 'The conversion of physical share certificates into electronic form, held by a depository (NSDL or CDSL). All modern equity trading in India uses dematerialised shares.' },
  { orderIndex: 11, lessonTitle: 'What Is a Demat Account?',            title: 'T+1 settlement',         body: 'Trades in Indian equities now settle on T+1 (the next working day after the trade), following SEBI\'s 2023 change from T+2.' },
  { orderIndex: 12, lessonTitle: 'NSE vs BSE',                          title: 'NIFTY 50',               body: 'The benchmark index of the National Stock Exchange, tracking 50 large-cap stocks by free-float market capitalisation. Used for index funds, ETFs, and futures & options.' },
  { orderIndex: 13, lessonTitle: 'NSE vs BSE',                          title: 'SENSEX',                 body: 'The S&P BSE SENSEX tracks 30 large-cap companies on the Bombay Stock Exchange. The oldest Indian equity index; correlates above 0.99 with NIFTY 50.' },
  { orderIndex: 14, lessonTitle: 'Who Participates in the Market?',     title: 'FPI / FII',              body: 'Foreign Portfolio Investor / Foreign Institutional Investor — foreign entities registered with SEBI to invest in Indian equity markets. Large FPI outflows are a major source of short-term NIFTY volatility.' },
  { orderIndex: 15, lessonTitle: 'Who Participates in the Market?',     title: 'DII',                    body: 'Domestic Institutional Investor — Indian mutual funds, insurance companies (LIC), and pension funds that invest in equities. DIIs often buy when FIIs sell, providing support.' },
  { orderIndex: 16, lessonTitle: 'What Is the P/E Ratio?',              title: 'P/E ratio',              body: 'Price-to-Earnings ratio = Market Price ÷ EPS. Measures how much investors pay per rupee of current earnings. A starting point for valuation, not a conclusion.' },
  { orderIndex: 17, lessonTitle: 'How to Calculate P/E',                title: 'Diluted EPS',            body: 'Earnings per Share calculated including all potential shares from ESOPs, convertible bonds, and warrants. More conservative than basic EPS; useful for companies with large employee stock option programmes.' },
  { orderIndex: 18, lessonTitle: 'Sector Average P/E Benchmarks (India)', title: 'NIFTY 50 P/E',        body: 'NSE publishes the NIFTY 50 P/E daily. Historically, below 16–18 signals relative cheapness; above 25 signals premium. Not a timing tool — a macro anchor.' },
  { orderIndex: 19, lessonTitle: 'Growth Stocks vs Value Stocks',       title: 'Value trap',             body: 'A stock that appears cheap (low P/E, high dividend yield) but is cheap for a structural reason that will not resolve — declining industry, weak management, or irreversible competitive damage.' },
  { orderIndex: 20, lessonTitle: 'When a High P/E Is Justified',        title: 'PEG ratio',              body: 'P/E divided by the expected earnings growth rate. Adjusts the P/E for growth; PEG below 1 is often considered attractive. Introduced by Peter Lynch as a rough growth-adjusted valuation tool.' },
  { orderIndex: 21, lessonTitle: 'When a High P/E Is Justified',        title: 'Competitive moat',       body: 'A durable structural advantage that protects a company\'s profitability from competitors — brand, network effects, cost advantage, switching costs, or regulatory barriers.' },
  { orderIndex: 22, lessonTitle: 'Common Valuation Pitfalls',           title: 'EV/EBITDA',              body: 'Enterprise Value divided by Earnings Before Interest, Tax, Depreciation, and Amortisation. Accounts for a company\'s full capital structure (equity + debt) and is useful for comparing companies with different leverage.' },
  { orderIndex: 23, lessonTitle: 'Common Valuation Pitfalls',           title: 'Normalised earnings',   body: 'Average earnings over a full business cycle, used instead of peak or trough EPS to avoid valuation errors for cyclical companies (metals, chemicals, commodities).' },
  { orderIndex: 24, lessonTitle: 'Why Diversification Matters',         title: 'Unsystematic risk',      body: 'Company-specific risk that can be reduced by holding multiple uncorrelated stocks — a drug recall, management fraud, or client loss affects one company, not the whole market.' },
  { orderIndex: 25, lessonTitle: 'Why Diversification Matters',         title: 'Systematic risk',        body: 'Market-wide risk from macroeconomic events (recessions, rate hikes, geopolitical shocks) that affects all equities. Cannot be diversified away by holding more stocks.' },
  { orderIndex: 26, lessonTitle: 'Correlation Basics',                  title: 'Correlation coefficient', body: 'A number between -1 and +1 measuring how two assets\' returns move relative to each other. Assets closer to 0 provide better diversification benefit than those close to +1.' },
  { orderIndex: 27, lessonTitle: 'Sector Rotation in Indian Markets',   title: 'Sector rotation',        body: 'The process by which institutional money shifts between sectors as economic conditions change — e.g., from cyclicals in early recovery to defensives in a slowdown.' },
  { orderIndex: 28, lessonTitle: 'Equal-Weight vs Market-Cap Weighting','title': 'Market-cap weighting', body: 'Portfolio allocation proportional to each company\'s market capitalisation — the method used by NIFTY 50 and most passive index funds. Self-rebalancing but concentrates in the largest winners.' },
  { orderIndex: 29, lessonTitle: 'How and When to Rebalance',           title: 'Threshold rebalancing',  body: 'Rebalancing triggered when any position drifts more than a fixed percentage from its target weight, rather than on a calendar schedule. More efficient than time-based rebalancing.' },
  { orderIndex: 30, lessonTitle: 'Common Diversification Mistakes',     title: 'Deworsification',        body: 'Peter Lynch\'s term for over-diversification — holding so many positions that the marginal diversification benefit is negligible while the ability to understand each holding deteriorates.' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seed function
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('Seeding courses...');

  // Map from lesson title → seeded lesson id (built as we go).
  const lessonTitleToId = new Map<string, string>();

  for (const courseDef of COURSES) {
    const course = await prisma.course.upsert({
      where: { orderIndex: courseDef.orderIndex },
      update: {
        title: courseDef.title,
        description: courseDef.description,
        difficulty: courseDef.difficulty,
        totalTimeMin: courseDef.totalTimeMin,
      },
      create: {
        title: courseDef.title,
        description: courseDef.description,
        difficulty: courseDef.difficulty,
        totalTimeMin: courseDef.totalTimeMin,
        orderIndex: courseDef.orderIndex,
      },
    });
    console.log(`  Course upserted: ${course.title} (${course.id})`);

    for (const lessonDef of courseDef.lessons) {
      const existing = await prisma.lesson.findFirst({
        where: { courseId: course.id, orderIndex: lessonDef.orderIndex },
      });

      let lesson;
      if (existing !== null) {
        lesson = await prisma.lesson.update({
          where: { id: existing.id },
          data: {
            title: lessonDef.title,
            content: lessonDef.content,
            readTimeMin: lessonDef.readTimeMin,
          },
        });
      } else {
        lesson = await prisma.lesson.create({
          data: {
            courseId: course.id,
            title: lessonDef.title,
            content: lessonDef.content,
            orderIndex: lessonDef.orderIndex,
            readTimeMin: lessonDef.readTimeMin,
          },
        });
      }
      lessonTitleToId.set(lessonDef.title, lesson.id);
      console.log(`    Lesson upserted: ${lesson.title}`);
    }
  }

  console.log('\nSeeding concepts...');
  for (const def of CONCEPT_DEFS) {
    const lessonId = lessonTitleToId.get(def.lessonTitle);
    if (lessonId === undefined) {
      console.warn(`  WARNING: lesson "${def.lessonTitle}" not found for concept "${def.title}"`);
    }

    await prisma.concept.upsert({
      where: { orderIndex: def.orderIndex },
      update: { title: def.title, body: def.body, lessonId: lessonId ?? null },
      create: {
        title: def.title,
        body: def.body,
        orderIndex: def.orderIndex,
        lessonId: lessonId ?? null,
      },
    });
    console.log(`  Concept: [${def.orderIndex}] ${def.title}`);
  }

  const courseCount = await prisma.course.count();
  const lessonCount = await prisma.lesson.count();
  const conceptCount = await prisma.concept.count();
  console.log(`\nDone. DB now has ${courseCount} courses, ${lessonCount} lessons, ${conceptCount} concepts.`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
