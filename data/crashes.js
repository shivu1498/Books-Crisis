// Major market crashes since organised share trading began (Amsterdam, 1602).
// `points` are key closing levels from standard published index histories, compiled by hand
// without a live data feed: they mark the run-up, the crash, the trough and the recovery.
// They are not a daily series and the chart joins them with straight lines.
// `headlines` are short summaries of the main news of the time, not verbatim newspaper headlines.
window.CRISIS_CRASHES = [
  {
    id: "1720",
    year: 1720,
    name: "South Sea Bubble",
    market: "London",
    series: "South Sea Company stock (£ per £100 share)",
    crash: "1720-06-24",
    points: [
      { date: "1720-01-01", value: 128, note: "Start of 1720" },
      { date: "1720-06-24", value: 1050, note: "Peak" },
      { date: "1720-12-31", value: 150, note: "End of 1720" }
    ],
    report: "The first international bubble and crash. South Sea stock rose roughly eightfold in six months on a scheme to swap government debt for company shares, then collapsed through the autumn as Law's Mississippi system failed in Paris at the same time. Parliament passed the Bubble Act and confiscated directors' estates the following year.",
    headlines: [
      { date: "Apr 1720", text: "Parliament approves the South Sea Company's scheme to take over the national debt" },
      { date: "Jun 1720", text: "Bubble Act restricts new joint-stock companies as South Sea stock tops £1,000" },
      { date: "Sep 1720", text: "South Sea stock collapses; goldsmith-bankers fail and the Sword Blade Bank stops payment" }
    ]
  },
  {
    id: "1907",
    year: 1907,
    name: "Panic of 1907",
    market: "New York",
    series: "Dow Jones Industrial Average",
    crash: "1907-10-22",
    points: [
      { date: "1906-01-19", value: 103.0, note: "Pre-panic peak" },
      { date: "1907-11-15", value: 53.0, note: "Trough" },
      { date: "1909-11-19", value: 100.53, note: "Recovery high" }
    ],
    report: "A failed attempt to corner United Copper set off runs on New York trust companies, led by the Knickerbocker Trust. With no central bank, J.P. Morgan organised private bankers to supply liquidity. The Dow roughly halved from its 1906 peak. The panic led directly to the creation of the Federal Reserve in 1913.",
    headlines: [
      { date: "Oct 1907", text: "United Copper corner fails; Heinze's banks hit by withdrawals" },
      { date: "Oct 1907", text: "Run on Knickerbocker Trust; the trust suspends payments" },
      { date: "Nov 1907", text: "J.P. Morgan leads bankers' rescue pool to stop the panic" }
    ]
  },
  {
    id: "1929",
    year: 1929,
    name: "Wall Street Crash",
    market: "New York",
    series: "Dow Jones Industrial Average",
    crash: "1929-10-29",
    points: [
      { date: "1928-12-31", value: 300.0, note: "End of 1928" },
      { date: "1929-09-03", value: 381.17, note: "Peak" },
      { date: "1929-10-23", value: 305.85, note: "Selling begins" },
      { date: "1929-10-28", value: 260.64, note: "Black Monday" },
      { date: "1929-10-29", value: 230.07, note: "Black Tuesday" },
      { date: "1929-11-13", value: 198.69, note: "1929 low" },
      { date: "1930-04-17", value: 294.07, note: "Bear-market rally" },
      { date: "1932-07-08", value: 41.22, note: "Trough (-89%)" },
      { date: "1954-11-23", value: 382.74, note: "Peak regained" }
    ],
    report: "A margin-financed boom ended in late October 1929, with two days of record losses on 28 and 29 October. The real damage came afterwards: bank failures, deflation and policy mistakes drove the Dow down 89% by July 1932, and it did not regain its 1929 peak for 25 years.",
    headlines: [
      { date: "24 Oct 1929", text: "Black Thursday: record volume as prices plunge; bankers' pool steps in" },
      { date: "29 Oct 1929", text: "Black Tuesday: stocks collapse on a record 16 million shares" },
      { date: "Jul 1932", text: "Dow hits its Depression low, down 89% from the 1929 peak" }
    ]
  },
  {
    id: "1973",
    year: 1974,
    name: "1973–74 Bear Market",
    market: "New York / London",
    series: "Dow Jones Industrial Average",
    crash: "1973-10-17",
    points: [
      { date: "1973-01-11", value: 1051.7, note: "Peak" },
      { date: "1973-10-17", value: 962.0, note: "Oil embargo begins (approx.)" },
      { date: "1974-12-06", value: 577.6, note: "Trough (-45%)" },
      { date: "1982-11-03", value: 1065.49, note: "Peak regained" }
    ],
    report: "The end of Bretton Woods, the OPEC oil embargo, Watergate and the Herstatt and Franklin National failures combined into the worst bear market since the 1930s. London fared worse still, with the FT 30 down about 73%. The Dow took almost a decade to regain its 1973 level in nominal terms.",
    headlines: [
      { date: "Oct 1973", text: "Arab oil producers announce an embargo; oil prices quadruple" },
      { date: "Jun 1974", text: "Herstatt Bank closed by German regulators mid-trading day" },
      { date: "Dec 1974", text: "Dow closes at its lowest level in 12 years" }
    ]
  },
  {
    id: "1987",
    year: 1987,
    name: "Black Monday",
    market: "Global",
    series: "Dow Jones Industrial Average",
    crash: "1987-10-19",
    points: [
      { date: "1986-12-31", value: 1895.95, note: "End of 1986" },
      { date: "1987-08-25", value: 2722.42, note: "Peak" },
      { date: "1987-10-16", value: 2246.74, note: "Friday before" },
      { date: "1987-10-19", value: 1738.74, note: "Black Monday (-22.6%)" },
      { date: "1987-10-20", value: 1841.01, note: "Rebound" },
      { date: "1987-12-31", value: 1938.83, note: "End of 1987" },
      { date: "1989-08-24", value: 2734.64, note: "Peak regained" }
    ],
    report: "The largest one-day percentage fall in Dow history, 22.6% on 19 October 1987, spread from Hong Kong to London to New York. Portfolio insurance and program selling deepened it. The Federal Reserve's promise of liquidity limited the damage: there was no recession and the Dow regained its peak within two years.",
    headlines: [
      { date: "19 Oct 1987", text: "Dow plunges 508 points, a record 22.6% one-day fall" },
      { date: "20 Oct 1987", text: "Fed affirms readiness to serve as a source of liquidity" },
      { date: "Jan 1988", text: "Brady Commission blames portfolio insurance and program trading" }
    ]
  },
  {
    id: "1990",
    year: 1990,
    name: "Japanese Bubble Bursts",
    market: "Tokyo",
    series: "Nikkei 225",
    crash: "1990-01-04",
    points: [
      { date: "1988-12-30", value: 30159.0, note: "End of 1988" },
      { date: "1989-12-29", value: 38915.87, note: "Peak" },
      { date: "1990-12-28", value: 23848.71, note: "End of 1990" },
      { date: "1992-08-18", value: 14309.41, note: "1992 low" },
      { date: "2009-03-10", value: 7054.98, note: "Post-bubble low" },
      { date: "2024-02-22", value: 39098.68, note: "Peak regained" }
    ],
    report: "Japan's land and equity bubble peaked on the last trading day of 1989. Rate rises by the Bank of Japan punctured it, and the Nikkei lost almost 40% in 1990 alone. Bad loans were left unresolved for a decade, and the index took 34 years to regain its 1989 high.",
    headlines: [
      { date: "Dec 1989", text: "Nikkei closes the year at a record 38,915" },
      { date: "1990", text: "Bank of Japan raises rates; Nikkei loses nearly 40% in a year" },
      { date: "Feb 2024", text: "Nikkei finally surpasses its 1989 record" }
    ]
  },
  {
    id: "1997",
    year: 1997,
    name: "Asian Financial Crisis",
    market: "Hong Kong",
    series: "Hang Seng Index",
    crash: "1997-10-23",
    points: [
      { date: "1997-08-07", value: 16673.27, note: "Peak" },
      { date: "1997-10-23", value: 10426.3, note: "Hong Kong dollar attacked (approx.)" },
      { date: "1998-08-13", value: 6544.79, note: "Trough (-61%)" },
      { date: "2000-03-28", value: 18301.69, note: "New high" }
    ],
    report: "The Thai baht's devaluation in July 1997 set off currency and banking crises across Thailand, Indonesia, Malaysia and South Korea. Speculators attacked the Hong Kong dollar peg in October, pushing overnight rates to extreme levels, and the Hang Seng lost more than 60% by August 1998.",
    headlines: [
      { date: "2 Jul 1997", text: "Thailand floats the baht after defending the peg fails" },
      { date: "23 Oct 1997", text: "Hang Seng plunges as the Hong Kong dollar peg comes under attack" },
      { date: "Dec 1997", text: "South Korea agrees a record IMF bailout" }
    ]
  },
  {
    id: "2000",
    year: 2000,
    name: "Dot-com Crash",
    market: "New York",
    series: "Nasdaq Composite",
    crash: "2000-03-10",
    points: [
      { date: "1998-12-31", value: 2192.69, note: "End of 1998" },
      { date: "1999-12-31", value: 4069.31, note: "End of 1999" },
      { date: "2000-03-10", value: 5048.62, note: "Peak" },
      { date: "2000-12-29", value: 2470.52, note: "End of 2000" },
      { date: "2002-10-09", value: 1114.11, note: "Trough (-78%)" },
      { date: "2015-04-23", value: 5056.06, note: "Peak regained" }
    ],
    report: "Internet stocks with little or no revenue drove the Nasdaq up more than fivefold in five years. It peaked in March 2000 and lost 78% over the next two and a half years as dot-com companies failed and the Enron and WorldCom frauds followed. It took 15 years to regain the peak.",
    headlines: [
      { date: "Mar 2000", text: "Nasdaq closes above 5,000 for the first time" },
      { date: "Apr 2000", text: "Tech stocks suffer their worst week as the selloff deepens" },
      { date: "Oct 2002", text: "Nasdaq bottoms, down 78% from its peak" }
    ]
  },
  {
    id: "2008",
    year: 2008,
    name: "Global Financial Crisis",
    market: "Global",
    series: "S&P 500",
    crash: "2008-09-15",
    points: [
      { date: "2006-12-29", value: 1418.3, note: "End of 2006" },
      { date: "2007-10-09", value: 1565.15, note: "Peak" },
      { date: "2007-12-31", value: 1468.36, note: "End of 2007" },
      { date: "2008-09-12", value: 1251.7, note: "Friday before Lehman" },
      { date: "2008-09-15", value: 1192.7, note: "Lehman files" },
      { date: "2008-12-31", value: 903.25, note: "End of 2008" },
      { date: "2009-03-09", value: 676.53, note: "Trough (-57%)" },
      { date: "2013-03-28", value: 1569.19, note: "Peak regained" }
    ],
    report: "Losses on US subprime mortgages spread through securitised credit to banks worldwide. Bear Stearns was rescued in March 2008; Lehman Brothers was allowed to fail on 15 September, freezing money markets. AIG, Fannie Mae and Freddie Mac were taken over, and the S&P 500 fell 57% to its March 2009 low.",
    headlines: [
      { date: "15 Sep 2008", text: "Lehman Brothers files for bankruptcy; Merrill sold to Bank of America" },
      { date: "3 Oct 2008", text: "Congress passes the $700bn TARP bank rescue" },
      { date: "9 Mar 2009", text: "S&P 500 closes at a 12-year low" }
    ]
  },
  {
    id: "2015",
    year: 2015,
    name: "Chinese Stock Market Crash",
    market: "Shanghai",
    series: "Shanghai Composite Index",
    crash: "2015-06-12",
    points: [
      { date: "2014-12-31", value: 3234.68, note: "End of 2014" },
      { date: "2015-06-12", value: 5166.35, note: "Peak" },
      { date: "2015-07-08", value: 3507.19, note: "First leg down" },
      { date: "2015-08-26", value: 2927.29, note: "Black Monday aftermath" },
      { date: "2016-01-28", value: 2655.66, note: "Trough (-49%)" }
    ],
    report: "A margin-fuelled retail boom doubled Shanghai shares in a year. When it broke in June 2015 the government banned large shareholders from selling, suspended trading in half of all listed companies and directed state funds to buy. A surprise yuan devaluation in August triggered a second leg down. The 2015 peak has not been regained.",
    headlines: [
      { date: "Jul 2015", text: "Beijing halts IPOs and orders state funds to buy shares" },
      { date: "11 Aug 2015", text: "China devalues the yuan, rattling global markets" },
      { date: "24 Aug 2015", text: "'Black Monday' in Shanghai spreads to markets worldwide" }
    ]
  },
  {
    id: "2020",
    year: 2020,
    name: "COVID Crash",
    market: "Global",
    series: "S&P 500",
    crash: "2020-03-16",
    points: [
      { date: "2019-12-31", value: 3230.78, note: "End of 2019" },
      { date: "2020-02-19", value: 3386.15, note: "Peak" },
      { date: "2020-03-16", value: 2386.13, note: "Worst day (-12%)" },
      { date: "2020-03-23", value: 2237.4, note: "Trough (-34%)" },
      { date: "2020-08-18", value: 3389.78, note: "Peak regained" }
    ],
    report: "The fastest bear market on record: the S&P 500 fell 34% in 23 trading days as lockdowns spread, with circuit breakers halting trading four times in March. Unprecedented Federal Reserve and fiscal support produced an equally fast recovery, and the index set a new high within six months.",
    headlines: [
      { date: "11 Mar 2020", text: "WHO declares COVID-19 a pandemic" },
      { date: "16 Mar 2020", text: "Fed cuts rates to zero; S&P 500 has its worst day since 1987" },
      { date: "23 Mar 2020", text: "Fed pledges unlimited asset purchases; markets bottom" }
    ]
  },
  {
    id: "2025",
    year: 2025,
    name: "April Tariff Crash",
    market: "Global",
    series: "S&P 500",
    crash: "2025-04-04",
    points: [
      { date: "2024-12-31", value: 5881.63, note: "End of 2024" },
      { date: "2025-02-19", value: 6144.15, note: "Peak" },
      { date: "2025-04-02", value: 5670.97, note: "Tariff announcement (approx.)" },
      { date: "2025-04-04", value: 5074.08, note: "Two-day fall" },
      { date: "2025-04-08", value: 4982.77, note: "Trough (-19%)" },
      { date: "2025-04-09", value: 5456.9, note: "Tariff pause rally" },
      { date: "2025-06-27", value: 6173.07, note: "Peak regained" }
    ],
    report: "Sweeping US tariffs announced on 2 April triggered the largest two-day fall since 2020, with the S&P 500 down 6% on 4 April. A 90-day pause on 9 April produced one of the biggest one-day gains on record, and the index regained its February peak by late June.",
    headlines: [
      { date: "2 Apr 2025", text: "US announces sweeping 'reciprocal' tariffs" },
      { date: "4 Apr 2025", text: "China retaliates; S&P 500 falls 6% in a day" },
      { date: "9 Apr 2025", text: "90-day tariff pause sparks a record-scale rally" }
    ]
  }
];
