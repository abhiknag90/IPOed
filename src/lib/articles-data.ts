export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  icon: string;
  readTime: string;
  content: string;
}

const articles: Article[] = [
  {
    slug: "what-is-an-ipo",
    title: "What is an IPO?",
    excerpt:
      "An Initial Public Offering (IPO) is when a private company offers its shares to the public for the first time. Learn why companies go public and what it means for investors.",
    category: "Basics",
    icon: "HelpCircle",
    readTime: "5 min",
    content: `An Initial Public Offering (IPO) is the process through which a private company becomes publicly traded on a stock exchange. During an IPO, the company issues new shares of stock and sells them to institutional and retail investors.

Why do companies go public?
- To raise capital for growth and expansion
- To provide liquidity for early investors and employees
- To increase brand visibility and credibility
- To use stock as currency for acquisitions

Key Players in an IPO:
1. The Issuing Company - The private company going public
2. Investment Banks (Book Running Lead Managers) - Underwrite and manage the IPO process
3. SEBI/SEC - Regulatory bodies that approve the offering
4. Registrar - Manages the application and allotment process

The IPO Process (India):
1. Company appoints merchant bankers
2. Files DRHP with SEBI
3. SEBI reviews and provides observations
4. Company files RHP and sets price band
5. IPO opens for subscription (3-5 days)
6. Allotment and refunds
7. Listing on stock exchange

The IPO Process (US):
1. Company selects underwriters
2. Files S-1 registration with SEC
3. SEC review and roadshow
4. Pricing and allocation
5. Trading begins on exchange`,
  },
  {
    slug: "how-to-read-a-drhp",
    title: "How to Read a DRHP",
    excerpt:
      "The Draft Red Herring Prospectus is a goldmine of information. Learn how to navigate this 500+ page document and find the data that matters most.",
    category: "India",
    icon: "FileText",
    readTime: "10 min",
    content: `The DRHP (Draft Red Herring Prospectus) is the most important document in an Indian IPO. It's filed with SEBI before the IPO and contains everything you need to make an informed decision.

Key Sections to Focus On:

1. BUSINESS OVERVIEW (Pages 100-150 typically)
- What does the company actually do?
- Revenue model and customer base
- Market position and competitive advantages

2. FINANCIAL STATEMENTS (Pages 200-250)
- Revenue growth trend (last 3-5 years)
- Profit margins - are they improving?
- Debt levels and debt-to-equity ratio
- Cash flow from operations

3. RISK FACTORS (Pages 20-50)
- Read ALL the risk factors carefully
- Look for concentration risks (single client, geography)
- Regulatory risks specific to the industry
- Legal proceedings and contingent liabilities

4. OBJECTS OF THE ISSUE (Pages 70-80)
- How will the IPO money be used?
- Fresh issue vs. Offer for Sale (OFS)
- Red flag: Large OFS means promoters cashing out

5. PROMOTER INFORMATION
- Background and track record
- Promoter holding post-IPO
- Related party transactions

Red Flags to Watch:
- Declining profits despite growing revenue
- High debt-to-equity ratio (>1.5 is concerning)
- Large Offer for Sale component
- Too many related party transactions
- Frequent changes in auditors
- Legal proceedings against promoters`,
  },
  {
    slug: "understanding-s1-filings",
    title: "Understanding S-1 Filings",
    excerpt:
      "The S-1 is the US equivalent of India's DRHP. Learn how to analyze this critical SEC filing to evaluate US IPOs effectively.",
    category: "US Market",
    icon: "FileText",
    readTime: "8 min",
    content: `The S-1 registration statement is filed with the SEC (Securities and Exchange Commission) by companies planning to go public in the United States.

Key Sections of an S-1:

1. PROSPECTUS SUMMARY
- Business overview in condensed form
- The offering details (shares, price range)
- Use of proceeds

2. RISK FACTORS
- Company-specific risks
- Industry and market risks
- Usually the longest section - read it carefully!

3. USE OF PROCEEDS
- How the company plans to use IPO funds
- Working capital, debt repayment, acquisitions

4. MANAGEMENT'S DISCUSSION AND ANALYSIS (MD&A)
- Management's perspective on financial results
- Key metrics and KPIs
- Future outlook and strategy

5. FINANCIAL STATEMENTS
- Audited financials (last 2-3 fiscal years)
- Quarterly data for recent periods
- Look for revenue growth, path to profitability

6. EXECUTIVE COMPENSATION
- How much are top executives paid?
- Stock-based compensation
- Alignment of interests with shareholders

Where to Find S-1 Filings:
- SEC EDGAR database (edgar.sec.gov)
- Search by company name
- Look for "S-1" or "S-1/A" (amended) forms`,
  },
  {
    slug: "ipo-valuation-methods",
    title: "IPO Valuation Methods",
    excerpt:
      "How do you know if an IPO is fairly priced? Learn the key valuation metrics used by analysts to evaluate IPO pricing.",
    category: "Advanced",
    icon: "BarChart",
    readTime: "7 min",
    content: `Understanding valuation is crucial for IPO investing. Here are the key methods:

1. PRICE-TO-EARNINGS (P/E) RATIO
- Formula: IPO Price / Earnings Per Share
- Compare with industry average P/E
- Lower P/E might indicate undervaluation
- But growth companies often have high P/E

2. PRICE-TO-BOOK VALUE (P/BV)
- Formula: IPO Price / Book Value Per Share
- Useful for banks and financial companies
- P/BV < 1 could mean undervaluation

3. EV/EBITDA
- Enterprise Value / EBITDA
- Better than P/E for comparing companies with different capital structures
- Useful for asset-heavy businesses

4. PRICE-TO-SALES (P/S)
- Used for companies without profits (common in tech)
- Formula: Market Cap / Total Revenue
- Compare with peers in the same sector

5. DISCOUNTED CASH FLOW (DCF)
- Most theoretically sound method
- Projects future cash flows and discounts to present value
- Requires many assumptions

Key Valuation Red Flags:
- P/E significantly higher than industry peers
- Company claims "premium" valuation without clear justification
- Revenue growing but margins shrinking
- Heavy reliance on one-time gains to boost profits`,
  },
  {
    slug: "common-ipo-mistakes",
    title: "Common IPO Mistakes to Avoid",
    excerpt:
      "First-time investors often make predictable mistakes when investing in IPOs. Learn what to avoid to protect your capital.",
    category: "Tips",
    icon: "Lightbulb",
    readTime: "6 min",
    content: `Avoid these common pitfalls when investing in IPOs:

1. APPLYING TO EVERY IPO
- Not all IPOs are worth investing in
- Quality over quantity - be selective
- Research before you invest

2. IGNORING VALUATIONS
- Don't assume every IPO will list at a premium
- Compare valuations with listed peers
- "Grey market premium" is not a reliable indicator

3. FOLLOWING THE HERD
- High subscription numbers don't guarantee good returns
- Do your own analysis
- Oversubscribed IPOs can still list at a discount

4. NOT READING THE PROSPECTUS
- At minimum, read the risk factors section
- Understand the business model
- Know how the proceeds will be used

5. INVESTING MONEY YOU CAN'T AFFORD TO LOSE
- IPOs can be volatile
- Listing gains are not guaranteed
- Have a clear investment thesis and exit strategy

6. IGNORING THE LOCK-IN PERIOD
- Anchor investors can sell after 30/90 days
- This can create selling pressure post-listing
- Watch for large OFS (Offer for Sale) components

7. NOT HAVING AN EXIT STRATEGY
- Decide beforehand if you want listing-day gains or long-term holding
- Set stop-losses
- Don't let emotions drive decisions`,
  },
  {
    slug: "ipo-glossary",
    title: "IPO Glossary",
    excerpt:
      "From ASBA to Grey Market Premium, learn the essential terminology every IPO investor should know.",
    category: "Reference",
    icon: "GraduationCap",
    readTime: "4 min",
    content: `Essential IPO terms every investor should know:

ASBA (Application Supported by Blocked Amount): Your money stays in your bank account until allotment, not debited upfront.

Book Building: Price discovery process where the final price is determined based on investor bids within a price band.

Cut-off Price: The price at which retail investors can apply, indicating willingness to pay whatever final price is decided.

DRHP (Draft Red Herring Prospectus): The initial document filed with SEBI containing all company details.

GMP (Grey Market Premium): Unofficial premium at which IPO shares trade in the grey market before listing. Not a reliable indicator.

Listing Day: The day IPO shares start trading on the stock exchange.

Lot Size: Minimum number of shares you must apply for in an IPO.

OFS (Offer for Sale): Existing shareholders selling their shares. Company doesn't receive this money.

Fresh Issue: New shares issued by the company. Company receives this money for growth.

Oversubscription: When total bids exceed shares available. Higher oversubscription doesn't guarantee returns.

Price Band: Range within which investors can bid (e.g., 500-525).

RHP (Red Herring Prospectus): Final prospectus filed after SEBI approval, with the price band.

Registrar: Entity managing IPO applications and allotment (e.g., Link Intime, KFin Technologies).

Underwriter: Investment bank that guarantees to buy unsold shares.

Anchor Investor: Institutional investors who get allocated shares before the IPO opens (at least 250 Cr investment).`,
  },
];

export function getAllArticles(): Article[] {
  return articles;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}
