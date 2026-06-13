// MM-053 — Quiz seed script.
// Idempotent: quizzes upserted by courseId, questions by (quizId, orderIndex). Safe to re-run.
// Run via: pnpm seed:quizzes (from apps/api/)
//
// All questions are grounded in the lesson content seeded by seed/courses.ts.
// HARD GATE (MM-053 AC): Andy reviews every question + explanation in the PR before merge.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface QuestionDef {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  orderIndex: number;
}

interface QuizDef {
  courseTitle: string;
  quizTitle: string;
  questions: QuestionDef[];
}

const QUIZZES: QuizDef[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // Course 1 — Stock Market Basics
  // ───────────────────────────────────────────────────────────────────────────
  {
    courseTitle: 'Stock Market Basics',
    quizTitle: 'Stock Market Basics — Quiz',
    questions: [
      {
        orderIndex: 1,
        question: 'What does owning one share of a company actually represent?',
        options: [
          'A loan to the company that must be repaid with interest',
          'A proportional slice of ownership in the company',
          'A guaranteed monthly payment from the company',
          'The right to use the company’s products for free',
        ],
        correctIndex: 1,
        explanation:
          'A share is a slice of ownership — if a company is split into 10 crore shares, one share owns one ten-crore-th of everything the company holds. A loan to the company is debt (a bond), not equity. Dividends are paid only if declared by the board, never guaranteed monthly. Ownership of shares confers no right to free products.',
      },
      {
        orderIndex: 2,
        question: 'In an IPO, who receives the money you pay for newly issued shares?',
        options: [
          'Other retail investors selling their shares',
          'The stock exchange (NSE or BSE)',
          'The company issuing the shares (or selling promoters in an OFS)',
          'SEBI, which holds it in escrow',
        ],
        correctIndex: 2,
        explanation:
          'An IPO is a primary-market transaction: the company (or promoters selling existing shares via an Offer for Sale) receives the money. Buying from other investors happens later, in the secondary market. Exchanges only provide the trading venue and earn fees, they don’t receive your subscription money. SEBI regulates the process but never takes the proceeds.',
      },
      {
        orderIndex: 3,
        question: 'When you press "buy" on a broker app for an already-listed stock, where does your money go?',
        options: [
          'To the company whose stock you bought',
          'To another investor selling that stock in the secondary market',
          'To NSE as a listing fee',
          'To the Government of India',
        ],
        correctIndex: 1,
        explanation:
          'Listed shares trade in the secondary market, where investors trade with each other — the company receives nothing from these transactions. The company only receives money in primary-market events (IPO, FPO, rights issue). The exchange charges small transaction fees, but your purchase amount goes to the seller. Taxes like STT go to the government, but that is a levy on the trade, not the trade itself.',
      },
      {
        orderIndex: 4,
        question: 'What defines a bear market?',
        options: [
          'Any single day where the index falls',
          'A sustained decline of 20% or more from a recent peak',
          'A period when no IPOs are launched',
          'A market closed for a public holiday',
        ],
        correctIndex: 1,
        explanation:
          'A bear market is conventionally a sustained fall of 20%+ from a recent peak, usually driven by deteriorating fundamentals, rising rates, or panic. A single down day is ordinary volatility, not a bear market. IPO activity often slows in bear markets but is a symptom, not the definition. Market holidays are scheduled closures with no relation to direction.',
      },
      {
        orderIndex: 5,
        question: 'What happens during NSE’s pre-open session (09:00–09:08)?',
        options: [
          'Trades execute continuously at the previous day’s close',
          'Orders are collected to calculate an opening equilibrium price, with no trades executing during order entry',
          'Only foreign investors are allowed to trade',
          'The exchange tests its systems with fake orders',
        ],
        correctIndex: 1,
        explanation:
          'The pre-open session collects buy and sell orders and uses them to discover a fair opening price; no trades execute while orders are being entered. Continuous trading at live prices begins only in the regular session at 09:15. There is no investor-category restriction in pre-open, and the orders are real, not system tests.',
      },
      {
        orderIndex: 6,
        question: 'What is a discount broker?',
        options: [
          'A broker that sells shares below market price',
          'An unregistered dealer offering cheap trades',
          'A SEBI-registered broker offering execution-only services at a flat fee, without research or advisory',
          'A broker that only handles mutual funds',
        ],
        correctIndex: 2,
        explanation:
          'Discount brokers like Zerodha and Upstox are SEBI-registered and provide execution at a flat fee (₹20 or less per trade) without advisory services. No broker can sell shares below the market price — prices come from the exchange order book. Unregistered dealing is illegal, not a category of broker. Discount brokers handle equities and more, not only mutual funds.',
      },
      {
        orderIndex: 7,
        question: 'What does a demat account hold?',
        options: [
          'Cash waiting to be invested',
          'Your shares in electronic (dematerialised) form, with a depository like NSDL or CDSL',
          'Physical share certificates in a bank locker',
          'Only government bonds',
        ],
        correctIndex: 1,
        explanation:
          'Dematerialisation converted paper certificates into electronic holdings kept with a depository (NSDL or CDSL) — that is exactly what a demat account stores. Cash sits in your trading or bank account, not the demat account. Physical certificates are what demat replaced. Demat accounts hold many security types (equities, ETFs, bonds), not just government bonds.',
      },
      {
        orderIndex: 8,
        question: 'Which index tracks 50 large-cap stocks on the National Stock Exchange?',
        options: ['SENSEX', 'NIFTY 50', 'BANK NIFTY', 'India VIX'],
        correctIndex: 1,
        explanation:
          'NIFTY 50 is NSE’s benchmark of 50 large-caps weighted by free-float market capitalisation. SENSEX is the BSE’s 30-stock index. BANK NIFTY tracks only banking stocks, not the broad market. India VIX measures expected volatility, not stock prices.',
      },
      {
        orderIndex: 9,
        question: 'When FIIs (foreign institutional investors) sell heavily, which participant group has historically often bought and provided support to Indian markets?',
        options: [
          'DIIs — domestic mutual funds, insurers like LIC, and pension funds',
          'SEBI, using its regulatory fund',
          'Stock exchanges themselves',
          'Company promoters, who are required by law to buy',
        ],
        correctIndex: 0,
        explanation:
          'Domestic institutional investors (mutual funds fed by SIP flows, LIC, pension funds) have often bought when FIIs sold, cushioning the fall. SEBI is a regulator and does not trade to support prices. Exchanges are venues, not market participants. Promoters may buy their own stock, but no law requires them to offset FII selling.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Course 2 — Reading P/E Ratios & Valuation
  // ───────────────────────────────────────────────────────────────────────────
  {
    courseTitle: 'Reading P/E Ratios & Valuation',
    quizTitle: 'Reading P/E Ratios & Valuation — Quiz',
    questions: [
      {
        orderIndex: 1,
        question: 'What does the P/E ratio measure?',
        options: [
          'How much profit a company makes per year',
          'How much investors pay per rupee of the company’s current earnings',
          'The percentage return a stock gave last year',
          'The dividend paid per share',
        ],
        correctIndex: 1,
        explanation:
          'P/E = Market Price ÷ Earnings Per Share, i.e. the price paid for each rupee of current earnings. Total annual profit is net income, a raw number with no price attached. Last year’s return is price change, unrelated to the earnings multiple. Dividend per share relates to dividend yield, a different metric entirely.',
      },
      {
        orderIndex: 2,
        question: 'A stock trades at ₹500 and its EPS is ₹25. What is its P/E ratio?',
        options: ['25', '20', '475', '12,500'],
        correctIndex: 1,
        explanation:
          'P/E = price ÷ EPS = 500 ÷ 25 = 20. Answer 25 just repeats the EPS. 475 is price minus EPS — subtraction is not how the multiple works. 12,500 multiplies price by EPS, the inverse of the correct operation.',
      },
      {
        orderIndex: 3,
        question: 'Why is diluted EPS considered more conservative than basic EPS?',
        options: [
          'It excludes one-time gains from the calculation',
          'It includes all potential shares from ESOPs, convertibles, and warrants, spreading earnings over more shares',
          'It uses last year’s earnings instead of this year’s',
          'It is calculated after dividends are paid',
        ],
        correctIndex: 1,
        explanation:
          'Diluted EPS divides earnings by the share count including everything that could become shares (employee stock options, convertible bonds, warrants) — more shares per rupee of profit means a lower, more cautious EPS. Excluding one-time gains describes adjusted or normalised earnings, not dilution. Diluted EPS uses the same period’s earnings, and dividends do not enter the EPS calculation.',
      },
      {
        orderIndex: 4,
        question: 'Historically, what has a NIFTY 50 P/E above roughly 25 signalled?',
        options: [
          'The market is guaranteed to crash within a year',
          'The index is trading at a premium relative to its own history',
          'Earnings across the index have collapsed to zero',
          'It carries no information at all',
        ],
        correctIndex: 1,
        explanation:
          'NSE publishes the NIFTY 50 P/E daily; historically below 16–18 suggested relative cheapness and above 25 a premium. It is a macro anchor, not a timing tool — so a crash is never "guaranteed". A P/E of 25 requires positive earnings, so earnings have clearly not collapsed. And while imperfect, the measure does carry historical context, so "no information" is wrong too.',
      },
      {
        orderIndex: 5,
        question: 'What is a value trap?',
        options: [
          'A stock that looks cheap on metrics like P/E but is cheap for a structural reason that will not resolve',
          'Any stock with a P/E below 10',
          'A stock that is expensive but keeps rising',
          'A government tax on undervalued shares',
        ],
        correctIndex: 0,
        explanation:
          'A value trap appears cheap (low P/E, high dividend yield) but stays cheap because of declining industry economics, weak management, or irreversible competitive damage. A low P/E alone is not a trap — some low-P/E stocks are genuine bargains. An expensive, rising stock is the opposite situation (momentum/growth). No such tax exists.',
      },
      {
        orderIndex: 6,
        question: 'The PEG ratio adjusts the P/E for what?',
        options: [
          'The company’s debt level',
          'The expected earnings growth rate',
          'The dividend payout ratio',
          'The number of shares outstanding',
        ],
        correctIndex: 1,
        explanation:
          'PEG = P/E ÷ expected earnings growth rate — Peter Lynch’s rough tool for judging whether a high P/E is earned by growth (PEG below 1 is often considered attractive). Debt is captured by metrics like EV/EBITDA, not PEG. Dividend payout belongs to yield analysis. Share count is already inside EPS, so PEG adds nothing about it.',
      },
      {
        orderIndex: 7,
        question: 'Why can a high P/E be justified for a company with a strong competitive moat?',
        options: [
          'Because moats make the share count smaller',
          'Because durable advantages protect future profitability, making each rupee of current earnings worth paying more for',
          'Because SEBI allows moat companies to report higher earnings',
          'A high P/E is never justified',
        ],
        correctIndex: 1,
        explanation:
          'A moat — brand, network effects, switching costs, cost advantage, or regulatory barriers — protects future earnings from competition, so investors rationally pay a premium multiple on today’s earnings. Moats have nothing to do with share count. Accounting rules are the same for every listed company; SEBI grants no reporting privileges. And quality businesses sustaining high P/Es for decades shows "never justified" is too absolute.',
      },
      {
        orderIndex: 8,
        question: 'Why is EV/EBITDA often better than P/E for comparing companies with very different debt levels?',
        options: [
          'Because EBITDA ignores revenue',
          'Because Enterprise Value includes both equity and debt, capturing the full capital structure',
          'Because EV/EBITDA is always a smaller number',
          'Because P/E cannot be calculated for companies with debt',
        ],
        correctIndex: 1,
        explanation:
          'Enterprise Value = equity + debt − cash, so EV/EBITDA prices the whole business regardless of how it is financed — making leveraged and unleveraged companies comparable. EBITDA starts from operating earnings, which are derived from revenue, so revenue is not ignored. The ratio’s size depends on the company, not the formula. P/E is perfectly calculable for indebted companies; it just hides the debt.',
      },
      {
        orderIndex: 9,
        question: 'For a cyclical company (steel, chemicals), why use normalised earnings instead of last year’s EPS in valuation?',
        options: [
          'Because cyclical companies never report real profits',
          'Because peak-year EPS makes the stock look misleadingly cheap and trough-year EPS misleadingly expensive',
          'Because SEBI requires it for commodity companies',
          'Because normalised earnings are always higher',
        ],
        correctIndex: 1,
        explanation:
          'Cyclical earnings swing across the business cycle: valuing on peak EPS understates the P/E (stock looks cheap right before earnings fall), and trough EPS overstates it. Averaging over a full cycle — normalised earnings — avoids both errors. Cyclical companies do report genuine profits, just volatile ones. This is an analyst convention, not a SEBI rule, and normalised earnings sit between peak and trough, not always higher.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Course 3 — Diversification & Sector Allocation
  // ───────────────────────────────────────────────────────────────────────────
  {
    courseTitle: 'Diversification & Sector Allocation',
    quizTitle: 'Diversification & Sector Allocation — Quiz',
    questions: [
      {
        orderIndex: 1,
        question: 'Why is holding 100% of a portfolio in IT stocks a problem, even if they are different companies?',
        options: [
          'IT stocks are banned from Indian portfolios above 50%',
          'Stocks in the same sector are highly correlated, so a sector-wide shock hits every holding at once',
          'IT companies never grow their earnings',
          'Exchanges charge higher fees for concentrated portfolios',
        ],
        correctIndex: 1,
        explanation:
          'Same-sector stocks share the same demand drivers (for Indian IT: US tech spending, currency moves), so they tend to fall together — diversification across companies within one sector removes little risk. No rule caps sector exposure in a personal portfolio. Indian IT has historically grown earnings strongly, which is irrelevant to the concentration problem. Exchange fees do not depend on portfolio composition.',
      },
      {
        orderIndex: 2,
        question: 'Which type of risk can diversification across many stocks actually reduce?',
        options: [
          'Systematic risk — recessions, rate hikes, market-wide shocks',
          'Unsystematic risk — company-specific events like a drug recall or management fraud',
          'Both systematic and unsystematic risk equally',
          'Neither — diversification changes nothing',
        ],
        correctIndex: 1,
        explanation:
          'Unsystematic (company-specific) risk shrinks as you add uncorrelated holdings, because one company’s drug recall or fraud doesn’t touch the others. Systematic risk hits all equities at once — no number of stocks diversifies away a recession. Hence "both equally" is wrong, and "neither" ignores the genuine, well-documented reduction in company-specific risk.',
      },
      {
        orderIndex: 3,
        question: 'Two assets have a return correlation close to 0. What does this mean for a portfolio holding both?',
        options: [
          'They move in perfect lockstep, doubling the portfolio’s swings',
          'They always move in opposite directions, cancelling each other out',
          'Their movements are largely independent, which smooths the portfolio’s combined ups and downs',
          'One of them must be lossmaking',
        ],
        correctIndex: 2,
        explanation:
          'Correlation near 0 means the assets’ returns are largely independent — bad days for one are unrelated to the other, which dampens combined volatility. Lockstep movement describes correlation near +1. Always-opposite movement describes correlation near −1, not 0. Correlation says nothing about whether either asset is profitable.',
      },
      {
        orderIndex: 4,
        question: 'What is sector rotation?',
        options: [
          'Mandatory annual reshuffling of index constituents by NSE',
          'Money flowing between sectors as the economic cycle shifts, lifting different sectors at different times',
          'A company moving from one industry to another',
          'Rotating your demat account between brokers',
        ],
        correctIndex: 1,
        explanation:
          'Sector rotation describes capital moving between sectors as macro conditions change — for example from defensive FMCG and pharma into rate-sensitive banks and autos when rates fall. Index reconstitution by NSE is a separate, rules-based process. A company changing its business is a pivot, not rotation. Moving demat accounts between brokers is account portability, unrelated to markets.',
      },
      {
        orderIndex: 5,
        question: 'How does an equal-weight approach differ from market-cap weighting?',
        options: [
          'Equal-weight gives every holding the same allocation, while market-cap weighting concentrates more money in the largest companies',
          'Equal-weight buys only large-caps',
          'Market-cap weighting requires owning every NSE stock',
          'There is no difference in practice',
        ],
        correctIndex: 0,
        explanation:
          'Equal weighting allocates the same amount per holding; market-cap weighting (like NIFTY 50) sizes positions by company value, so giants dominate the index. Equal-weight strategies span all cap sizes, not just large-caps. A cap-weighted portfolio needs only its chosen constituents, not every listed stock. The two produce measurably different concentration and performance, so "no difference" is wrong.',
      },
      {
        orderIndex: 6,
        question: 'After a strong IT rally, your 25% IT allocation has grown to 45% of the portfolio. What does rebalancing involve?',
        options: [
          'Adding more IT to ride the momentum',
          'Trimming the overweight IT position back toward target and redeploying into underweight sectors',
          'Liquidating the entire portfolio and starting over',
          'Doing nothing, since winners keep winning forever',
        ],
        correctIndex: 1,
        explanation:
          'Rebalancing restores target weights: reduce what has grown overweight and add to what has shrunk, which systematically books gains in the expensive sector and adds to the cheaper ones. Adding more IT is momentum-chasing, the opposite of rebalancing. Liquidating everything is unnecessary — only the deviation needs adjusting. And "winners keep winning forever" contradicts the cyclical sector behaviour the course covers.',
      },
      {
        orderIndex: 7,
        question: 'In Mimir, you buy 10 shares at ₹100, then later 10 more at ₹150. What is your average buy price now?',
        options: ['₹100', '₹150', '₹125', '₹250'],
        correctIndex: 2,
        explanation:
          'Average buy price is the volume-weighted mean: (10×100 + 10×150) ÷ 20 = ₹125. ₹100 ignores the second, costlier purchase; ₹150 ignores the first. ₹250 adds the two prices, which is meaningless — the total must be divided by the number of shares held.',
      },
      {
        orderIndex: 8,
        question: 'What is the difference between unrealised and realised P&L?',
        options: [
          'Unrealised P&L is on holdings you still own and moves with the market; realised P&L is locked in when you sell',
          'Unrealised P&L is always a loss; realised is always a profit',
          'They are two names for the same number',
          'Realised P&L changes every time the market price moves',
        ],
        correctIndex: 0,
        explanation:
          'Unrealised P&L = (current price − average buy price) × quantity on positions still held, so it fluctuates with the market; selling converts it into realised P&L, which is fixed at the sale price. Either kind can be a profit or a loss. They are distinct numbers measuring different things. Once realised, P&L no longer moves with prices — that is exactly what "realised" means.',
      },
      {
        orderIndex: 9,
        question: 'How does Mimir’s monthly budget mechanic mirror SIP-style discipline?',
        options: [
          'It forces all money into a single stock each month',
          'It drips a fixed amount each month, encouraging regular deployment rather than one lump-sum gamble — unused budget expires',
          'It guarantees positive returns every month',
          'It blocks trading during volatile months',
        ],
        correctIndex: 1,
        explanation:
          'Like a SIP, the monthly budget arrives as a fixed periodic amount and expires if unused, building the habit of regular, disciplined deployment instead of one big bet — this also naturally produces rupee cost averaging across months. The budget can be spread across any stocks, not forced into one. No mechanism can guarantee returns. Trading stays open whatever the volatility; discipline comes from the budget, not from lockouts.',
      },
    ],
  },
];

async function main(): Promise<void> {
  console.log('Seeding quizzes...');

  for (const quizDef of QUIZZES) {
    const course = await prisma.course.findFirst({ where: { title: quizDef.courseTitle } });
    if (course === null) {
      console.warn(`  WARNING: course "${quizDef.courseTitle}" not found — run seed:courses first. Skipping.`);
      continue;
    }

    const quiz = await prisma.quiz.upsert({
      where: { courseId: course.id },
      update: { title: quizDef.quizTitle },
      create: { courseId: course.id, title: quizDef.quizTitle },
    });
    console.log(`  Quiz upserted: ${quiz.title}`);

    for (const q of quizDef.questions) {
      const existing = await prisma.quizQuestion.findFirst({
        where: { quizId: quiz.id, orderIndex: q.orderIndex },
      });

      if (existing !== null) {
        await prisma.quizQuestion.update({
          where: { id: existing.id },
          data: {
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          },
        });
      } else {
        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            orderIndex: q.orderIndex,
          },
        });
      }
      console.log(`    Question upserted: [${q.orderIndex}] ${q.question.slice(0, 60)}…`);
    }
  }

  const quizCount = await prisma.quiz.count();
  const questionCount = await prisma.quizQuestion.count();
  console.log(`\nDone. DB now has ${quizCount} quizzes, ${questionCount} questions.`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
