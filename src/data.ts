// Sample content for the Akashic Insights (AI) prototype.
// Figures shown in the design file are reproduced as-is; everything else is
// illustrative sample data so every screen and interaction has something real to show.

export type ChartKind = 'table' | 'column' | 'line' | 'area' | 'bar';
export type DatasetName = 'sales_data' | 'video_game_sales' | 'world_health_bank_data';

export interface Dataset {
  name: DatasetName;
  desc: string;
  long: string;
  questions: string[];
}

export const DATASETS: Dataset[] = [
  {
    name: 'sales_data',
    desc: 'Sales orders · Jan 2003 – May 2005',
    long: 'Orders for model cars, bikes, planes, ships and trains',
    questions: [
      'What is the total sales by product line?',
      'Which state has the highest total quantity ordered?',
      'How has total sales changed by quarter?',
    ],
  },
  {
    name: 'video_game_sales',
    desc: 'Video game unit sales by region',
    long: 'Lifetime unit sales of video games by region',
    questions: [
      'Which genre has the highest global sales?',
      'Which platform sold the most units?',
      'How do sales split across regions?',
    ],
  },
  {
    name: 'world_health_bank_data',
    desc: 'Country health indicators by year',
    long: 'Country health indicators by year',
    questions: [
      'What is the average life expectancy by region?',
      'How much do income groups spend on health?',
      'Which regions have the highest infant mortality?',
    ],
  },
];

export const datasetByName = (n: string) => DATASETS.find((d) => d.name === n);

/* ───────────── Semantic model ───────────── */

export type ColType = 'text' | 'num' | 'date' | 'id';
export type Column = [label: string, key: string, type: ColType, samples: string];
export type Metric = [name: string, formula: string, desc: string];
export type Gloss = [term: string, means: string, note: string];

export interface Model {
  name: DatasetName;
  desc: string;
  rows: string;
  tableMeta: string;
  groups: [string, Column[]][];
  metrics: Metric[];
  glossary: Gloss[];
}

export const MODELS: Model[] = [
  {
    name: 'sales_data',
    desc: 'Order lines for a model-vehicle wholesaler',
    rows: '2,823 rows',
    tableMeta: 'One row per order line · 2,823 rows',
    groups: [
      ['Orders', [
        ['Order number', 'order_number', 'id', '10100, 10101, 10102 …'],
        ['Order date', 'order_date', 'date', 'Jan 2003 – May 2005'],
        ['Status', 'status', 'text', 'Shipped, Cancelled, Disputed, In Process, On Hold, Resolved'],
        ['Deal size', 'deal_size', 'text', 'Small, Medium, Large'],
        ['Quantity ordered', 'quantity_ordered', 'num', 'Whole numbers'],
        ['Price each', 'price_each', 'num', 'Currency'],
        ['Sales', 'sales', 'num', 'Currency'],
      ]],
      ['Product', [
        ['Product line', 'product_line', 'text', 'Classic Cars, Vintage Cars, Motorcycles, Trucks and Buses, Planes, Ships, Trains'],
        ['Product code', 'product_code', 'id', 'S10_1678, S10_1949 …'],
        ['MSRP', 'msrp', 'num', 'Currency'],
      ]],
      ['Customer', [
        ['Customer name', 'customer_name', 'text', 'Business names'],
        ['Country', 'country', 'text', 'USA, Spain, France, Australia, UK …'],
        ['State', 'state', 'text', 'CA, NY, MA …'],
        ['City', 'city', 'text', 'Madrid, San Rafael, NYC …'],
        ['Territory', 'territory', 'text', 'NA, EMEA, APAC, Japan'],
      ]],
      ['Time', [
        ['Year', 'year', 'num', '2003, 2004, 2005'],
        ['Quarter', 'quarter', 'num', '1, 2, 3, 4'],
        ['Month', 'month', 'num', '1 – 12'],
      ]],
    ],
    metrics: [
      ['Total Sales', 'SUM(sales)', 'All revenue in the current filters.'],
      ['Total Quantity Ordered', 'SUM(quantity_ordered)', 'Units sold.'],
      ['Order Count', 'COUNT(DISTINCT order_number)', 'Number of distinct orders. Counts orders, not order lines.'],
      ['Average Order Value', 'Total Sales / Order Count', 'Average revenue per order. Also called AOV.'],
      ['Average Price', 'AVG(price_each)', 'Average unit price across order lines.'],
    ],
    glossary: [
      ['revenue', 'Total Sales', 'Also “turnover” or “sales value”.'],
      ['region', 'Territory', 'Use Country for a finer split.'],
      ['category', 'Product line', 'Also “product type”.'],
      ['orders', 'Order Count', 'Counts orders, not order lines.'],
      ['big deals', 'Deal size = Large', 'Order lines in the Large band.'],
      ['AOV', 'Average Order Value', 'Average revenue per order.'],
    ],
  },
  {
    name: 'video_game_sales',
    desc: 'Lifetime unit sales of video games by region',
    rows: '16,598 rows',
    tableMeta: 'One row per game per platform · 16,598 rows',
    groups: [
      ['Game', [
        ['Rank', 'rank', 'num', '1, 2, 3 … by global sales'],
        ['Name', 'name', 'text', 'Game titles'],
        ['Platform', 'platform', 'text', 'Wii, NES, GB, DS, X360, PS3, PS2 …'],
        ['Genre', 'genre', 'text', 'Action, Sports, Shooter, Role-Playing, Platform …'],
        ['Publisher', 'publisher', 'text', 'Nintendo, Electronic Arts, Activision …'],
      ]],
      ['Sales (millions of units)', [
        ['North America sales', 'na_sales', 'num', 'Millions of units'],
        ['Europe sales', 'eu_sales', 'num', 'Millions of units'],
        ['Japan sales', 'jp_sales', 'num', 'Millions of units'],
        ['Other regions sales', 'other_sales', 'num', 'Millions of units'],
        ['Global sales', 'global_sales', 'num', 'Millions of units'],
      ]],
      ['Time', [['Year', 'year', 'num', 'Release year, 1980 onwards']]],
    ],
    metrics: [
      ['Total Global Sales', 'SUM(global_sales)', 'Units sold worldwide, in millions.'],
      ['Total NA Sales', 'SUM(na_sales)', 'Units sold in North America, in millions.'],
      ['Total EU Sales', 'SUM(eu_sales)', 'Units sold in Europe, in millions.'],
      ['Total JP Sales', 'SUM(jp_sales)', 'Units sold in Japan, in millions.'],
      ['Game Count', 'COUNT(DISTINCT name)', 'Number of distinct game titles.'],
      ['Average Sales per Game', 'Total Global Sales / Game Count', 'Average lifetime units per title, in millions.'],
    ],
    glossary: [
      ['units sold', 'Global sales', 'Lifetime units, in millions.'],
      ['console', 'Platform', 'Includes handhelds and PC.'],
      ['studio', 'Publisher', 'The company that published the game.'],
      ['type of game', 'Genre', ''],
      ['hits', 'Rank', 'Lower rank means higher global sales.'],
    ],
  },
  {
    name: 'world_health_bank_data',
    desc: 'Country health indicators by year',
    rows: '[row count]',
    tableMeta: 'One row per country per year · [row count]',
    groups: [
      ['Country', [
        ['Country name', 'country_name', 'text', 'India, Brazil, Germany …'],
        ['Country code', 'country_code', 'id', 'IND, BRA, DEU …'],
        ['Region', 'region', 'text', 'South Asia, Europe & Central Asia …'],
        ['Income group', 'income_group', 'text', 'Low, Lower middle, Upper middle, High income'],
      ]],
      ['Indicators', [
        ['Life expectancy', 'life_expectancy', 'num', 'Years at birth'],
        ['Health expenditure (% of GDP)', 'health_exp_pct_gdp', 'num', 'Percent'],
        ['Health expenditure per capita', 'health_exp_per_capita', 'num', 'Current US$'],
        ['Infant mortality rate', 'infant_mortality_rate', 'num', 'Per 1,000 live births'],
        ['Population', 'population', 'num', 'People'],
      ]],
      ['Time', [['Year', 'year', 'num', '[first year] – [latest year]']]],
    ],
    metrics: [
      ['Average Life Expectancy', 'AVG(life_expectancy)', 'Simple average across countries in the filters.'],
      ['Population-weighted Life Expectancy', 'SUM(life_expectancy × population) / SUM(population)', 'Weights each country by its population.'],
      ['Total Population', 'SUM(population)', 'People in the selected countries and year.'],
      ['Average Health Spend (% of GDP)', 'AVG(health_exp_pct_gdp)', 'Average share of GDP spent on health.'],
      ['Average Infant Mortality', 'AVG(infant_mortality_rate)', 'Deaths per 1,000 live births.'],
    ],
    glossary: [
      ['lifespan', 'Life expectancy', 'At birth, in years.'],
      ['health spending', 'Health expenditure', 'As % of GDP or per person.'],
      ['rich countries', 'Income group = High income', ''],
      ['poor countries', 'Income group = Low income', ''],
      ['baby deaths', 'Infant mortality rate', 'Per 1,000 live births.'],
    ],
  },
];

export const modelByName = (n: string) => MODELS.find((m) => m.name === n) ?? MODELS[0];

/** The drawer ("option 1") uses friendlier names than the explorer page. */
export type DrawerType = 'cat' | 'num' | 'date';
export const DRAWER_SALES: { groups: [string, [string, DrawerType, string][]][]; calcs: [string, string][] } = {
  groups: [
    ['Orders', [
      ['Order date', 'date', 'Jan 2003 – May 2005'],
      ['Order status', 'cat', 'Shipped, Cancelled, Disputed, In Process, On Hold, Resolved'],
      ['Deal size', 'cat', 'Small, Medium, Large'],
      ['Quantity ordered', 'num', 'Units on each order line'],
      ['Unit price', 'num', 'Amount in $ per unit'],
      ['Sales amount', 'num', 'Amount in $'],
    ]],
    ['Products', [
      ['Product line', 'cat', 'Classic Cars, Vintage Cars, Motorcycles, Trucks and Buses, Planes, Ships, Trains'],
      ['Product', 'cat', '1969 Harley Davidson Ultimate Chopper, 1952 Alpine Renault 1300 …'],
      ['Suggested retail price', 'num', 'Amount in $'],
    ]],
    ['Customers', [
      ['Customer', 'cat', 'Euro Shopping Channel, Mini Gifts Distributors Ltd. …'],
      ['Country', 'cat', 'USA, Spain, France, Australia, UK …'],
      ['State / province', 'cat', 'CA, NY, MA …'],
      ['City', 'cat', 'Madrid, San Rafael, NYC …'],
      ['Sales territory', 'cat', 'NA, EMEA, APAC, Japan'],
    ]],
    ['Time', [
      ['Year', 'date', '2003, 2004, 2005'],
      ['Quarter', 'date', 'Q1, Q2, Q3, Q4'],
      ['Month', 'date', 'Jan – Dec'],
    ]],
  ],
  calcs: [
    ['Total Sales', 'All sales amounts added together.'],
    ['Total Quantity Ordered', 'All units ordered, added together.'],
    ['Number of Orders', 'How many separate orders were placed.'],
    ['Average Order Value', 'Total Sales divided by the Number of Orders.'],
    ['Average Unit Price', 'The typical price charged per unit.'],
  ],
};

/* ───────────── Answers ───────────── */

export interface Row { label: string; value: number }

/** Narrative text marks data values with [[ ]], e.g. "lead with [[3.92M]]". */
export type NarrativeBlock =
  | { kind: 'bullets'; items: string[] }
  | { kind: 'p'; text: string }
  | { kind: 'kpis'; items: { label: string; value: string; delta?: string; note: string }[] };

export interface TraceDef { title: string; detail: string; code?: string; ms: number }

export interface Answer {
  id: string;
  dataset: DatasetName;
  match: RegExp;
  question: string;
  title: string;
  columns: string[];
  calcs: string[];
  dim: string;
  dimKey: string;
  measure: string;
  rows: Row[];
  chart: ChartKind;
  tokens: number;
  digits?: number;
  narrative: NarrativeBlock[];
  steps: TraceDef[];
  followups: string[];
  /** Unit suffix for values that are not money, e.g. " yrs". */
  unit?: string;
}

const sql = (dim: string, expr: string, alias: string, table: string, order = `${alias} DESC`) =>
  `SELECT ${dim},\n       ${expr} AS ${alias}\nFROM ${table}\nGROUP BY ${dim}\nORDER BY ${order};`;

function steps(o: {
  intent: string; cols: string; dataset: string; sqlText: string; sqlNote: string; rows: number; visual: string; narr: string;
  ms?: number[]; followUp?: boolean;
}): TraceDef[] {
  const ms = o.ms ?? [600, 900, 1400, 800, 500, 1100];
  return [
    { title: o.followUp ? 'Understanding the follow-up' : 'Understanding the question', detail: o.intent, ms: ms[0] },
    { title: 'Finding the right data', detail: o.followUp ? `Matched columns: ${o.cols}.` : `Using ${o.dataset}. Matched columns: ${o.cols}.`, ms: ms[1] },
    { title: 'Writing the SQL query', detail: o.sqlNote, code: o.sqlText, ms: ms[2] },
    { title: 'Running the query', detail: `Returned ${o.rows} rows from ${o.dataset}.`, ms: ms[3] },
    { title: 'Choosing a visual', detail: o.visual, ms: ms[4] },
    { title: 'Writing the narrative', detail: o.narr, ms: ms[5] },
  ];
}

export const PRODUCT_LINES: Row[] = [
  { label: 'Classic Cars', value: 3919615.66 },
  { label: 'Vintage Cars', value: 1903150.84 },
  { label: 'Motorcycles', value: 1166388.34 },
  { label: 'Trucks and Buses', value: 1127789.84 },
  { label: 'Planes', value: 975003.57 },
  { label: 'Ships', value: 714437.13 },
  { label: 'Trains', value: 226243.47 },
];

export const YEARS: Row[] = [
  { label: '2003', value: 3516979.54 },
  { label: '2004', value: 4724162.6 },
  { label: '2005 (Jan–May)', value: 1791486.71 },
];

export const QUARTERS: Row[] = [
  { label: '2003 Q1', value: 445094.69 },
  { label: '2003 Q2', value: 562365.22 },
  { label: '2003 Q3', value: 649514.54 },
  { label: '2003 Q4', value: 1860005.09 },
  { label: '2004 Q1', value: 833730.68 },
  { label: '2004 Q2', value: 766260.73 },
  { label: '2004 Q3', value: 1109396.27 },
  { label: '2004 Q4', value: 2014774.92 },
  { label: '2005 Q1', value: 1071992.36 },
  { label: '2005 Q2', value: 719494.35 },
];

export const COUNTRIES: Row[] = [
  { label: 'USA', value: 3627982.83 },
  { label: 'Spain', value: 1215686.92 },
  { label: 'France', value: 1110916.52 },
  { label: 'Australia', value: 630623.1 },
  { label: 'UK', value: 478880.46 },
  { label: 'Italy', value: 374674.31 },
  { label: 'Finland', value: 329581.91 },
  { label: 'Norway', value: 307463.7 },
  { label: 'Singapore', value: 288488.41 },
  { label: 'Denmark', value: 245637.15 },
  { label: 'Sweden', value: 210014.21 },
  { label: 'Canada', value: 224078.56 },
  { label: 'Others', value: 988600.77 },
];

export const COUNTRY_COLORS: Record<string, string> = {
  USA: '#137FA3', Spain: '#3E4A7A', France: '#2E8A57', Australia: '#F07F2E', UK: '#5B5B5B', Italy: '#D93847',
  Finland: '#F6C20E', Norway: '#8E5AB5', Singapore: '#0E8C8C', Denmark: '#8B6E5A', Sweden: '#9EE0B8', Canada: '#7FD1D9',
  Others: '#CBD5E1',
};
export const LIGHT_TILES = new Set(['Finland', 'Sweden', 'Canada', 'Others']);

export const DEAL_SIZES: Row[] = [
  { label: 'Medium', value: 6087432.24 },
  { label: 'Small', value: 2643077.35 },
  { label: 'Large', value: 1302119.26 },
];
export const DEAL_COLORS = ['#2563EB', '#F59E0B', '#0F766E'];

export const AOV_BY_COUNTRY: Row[] = [
  { label: 'Denmark', value: 58900 },
  { label: 'Japan', value: 46800 },
  { label: 'Singapore', value: 36800 },
  { label: 'Spain', value: 36600 },
  { label: 'Switzerland', value: 35000 },
  { label: 'Austria', value: 34100 },
  { label: 'Belgium', value: 33700 },
  { label: 'Sweden', value: 33100 },
  { label: 'USA', value: 32300 },
  { label: 'Finland', value: 32000 },
];

export const PRODUCT_LINES_2003: Row[] = [
  { label: 'Classic Cars', value: 1484785.29 },
  { label: 'Vintage Cars', value: 650987.76 },
  { label: 'Trucks/Buses', value: 420429.93 },
  { label: 'Motorcycles', value: 370895.58 },
  { label: 'Planes', value: 272257.6 },
  { label: 'Ships', value: 244821.09 },
  { label: 'Trains', value: 72802.29 },
];

/** "Top country by sales per quarter" on Yash's board (values in the design, in K). */
export const TOP_COUNTRY_QUARTERS: Row[] = [
  { label: '2003-01', value: 103000 },
  { label: '2003-04', value: 154000 },
  { label: '2003-07', value: 342500 },
  { label: '2003-10', value: 704600 },
  { label: '2004-01', value: 245000 },
  { label: '2004-04', value: 294000 },
  { label: '2004-07', value: 407500 },
  { label: '2004-10', value: 739300 },
  { label: '2005-01', value: 402000 },
  { label: '2005-04', value: 235500 },
];

export const ANSWERS: Answer[] = [
  {
    id: 'product-line', dataset: 'sales_data', match: /product\s*line|by product|category|categories/i,
    question: 'What is the total sales by product line?', title: 'Total Sales by Product Line',
    columns: ['Product line'], calcs: ['Total Sales'], dim: 'Product Line', dimKey: 'product_line', measure: 'Total Sales',
    rows: PRODUCT_LINES, chart: 'line', tokens: 3296,
    narrative: [{ kind: 'bullets', items: [
      'Classic Cars lead with [[3.92M]], about [[39%]] of all sales.',
      'Vintage Cars are second at [[1.90M]], roughly half of Classic Cars.',
      'Motorcycles ([[1.17M]]) and Trucks and Buses ([[1.13M]]) perform almost the same.',
      'Trains are the smallest product line at [[226K]], about [[2%]] of the total.',
    ] }],
    steps: steps({
      intent: 'Intent: add up sales and group them by product line. No date range or filter mentioned.',
      cols: 'product_line, sales', dataset: 'sales_data',
      sqlText: sql('product_line', 'SUM(sales)', 'total_sales', 'sales_data'),
      sqlNote: 'Generated a grouped total, sorted from highest to lowest.', rows: 7,
      visual: 'One category and one measure, so a line chart by default. Table, column, area and bar are also available.',
      narr: 'Summarised the leading product line, how sales are split, and the smallest line.',
    }),
    followups: ['How did total sales change each year?', 'Which countries buy the most Classic Cars?', 'What is the average order value for each product line?'],
  },
  {
    id: 'year', dataset: 'sales_data', match: /\byear|annual|each year|yearly/i,
    question: 'How did total sales change each year?', title: 'Total Sales by Year',
    columns: ['Year'], calcs: ['Total Sales'], dim: 'Year', dimKey: 'year', measure: 'Total Sales',
    rows: YEARS, chart: 'column', tokens: 2184,
    narrative: [{ kind: 'p', text: 'Total sales rose from [[3.52M]] in 2003 to a peak of [[4.72M]] in 2004, an increase of about [[34%]]. The [[1.79M]] shown for 2005 is not a full year: the data only runs from January to May 2005, so it shouldn’t be compared directly with the earlier years.' }],
    steps: steps({
      followUp: true, ms: [500, 700, 1200, 700, 400, 900],
      intent: 'Follow-up to your last question, so it keeps the same dataset (sales_data). New intent: total sales for each year.',
      cols: 'year, sales', dataset: 'sales_data',
      sqlText: sql('year', 'SUM(sales)', 'total_sales', 'sales_data', 'year'),
      sqlNote: 'Generated a total per year, in date order.', rows: 3,
      visual: 'Three years and one measure, so a column chart.',
      narr: 'Compared the years and flagged that 2005 only covers January to May.',
    }),
    followups: ['How has total sales changed by quarter?', 'What is the total sales by product line?', 'How are sales split by deal size?'],
  },
  {
    id: 'quarter', dataset: 'sales_data', match: /quarter|month|season|trend/i,
    question: 'How has total sales changed by quarter?', title: 'Total Sales by Quarter',
    columns: ['Year', 'Quarter'], calcs: ['Total Sales'], dim: 'Quarter', dimKey: 'quarter', measure: 'Total Sales',
    rows: QUARTERS, chart: 'line', tokens: 2741,
    narrative: [
      { kind: 'kpis', items: [
        { label: 'Best quarter', value: '2.01M', note: '2004 Q4' },
        { label: 'Q4 2004 vs Q4 2003', value: '+8%', delta: '8%', note: '2.01M vs 1.86M' },
        { label: 'Average quarter', value: '1.00M', note: '10 quarters' },
      ] },
      { kind: 'p', text: 'Sales follow a clear yearly cycle: every fourth quarter is the strongest, with [[1.86M]] in 2003 and [[2.01M]] in 2004. Q1 and Q2 are the quietest. 2005 Q2 only includes April and May.' },
    ],
    steps: steps({
      intent: 'Intent: total sales for each quarter, in date order. No filter mentioned.',
      cols: 'year, quarter, sales', dataset: 'sales_data',
      sqlText: 'SELECT year, quarter,\n       SUM(sales) AS total_sales\nFROM sales_data\nGROUP BY year, quarter\nORDER BY year, quarter;',
      sqlNote: 'Generated a total per quarter, in date order.', rows: 10,
      visual: 'A time series, so a line chart.',
      narr: 'Called out the Q4 peaks and noted that 2005 Q2 is a partial quarter.',
    }),
    followups: ['How did total sales change each year?', 'Which product line drives the Q4 peak?', 'What is the total sales by product line?'],
  },
  {
    id: 'state', dataset: 'sales_data', match: /state|province|quantity/i,
    question: 'Which state has the highest total quantity ordered?', title: 'Total Quantity Ordered by State',
    columns: ['State'], calcs: ['Total Quantity Ordered'], dim: 'State', dimKey: 'state', measure: 'Total Quantity Ordered',
    rows: [
      { label: 'CA', value: 11795 }, { label: 'MA', value: 6587 }, { label: 'NY', value: 5970 }, { label: 'NSW', value: 3176 },
      { label: 'Victoria', value: 2709 }, { label: 'PA', value: 2526 }, { label: 'CT', value: 1663 }, { label: 'BC', value: 1050 },
    ],
    chart: 'bar', tokens: 2518, digits: 0,
    narrative: [{ kind: 'bullets', items: [
      'California (CA) has the highest quantity ordered at [[11.8K]] units.',
      'That is almost double the next state, Massachusetts, at [[6.6K]].',
      'Order lines without a state (most of Europe) are left out of this view.',
    ] }],
    steps: steps({
      intent: 'Intent: add up quantity ordered and group it by state, then find the highest.',
      cols: 'state, quantity_ordered', dataset: 'sales_data',
      sqlText: 'SELECT state,\n       SUM(quantity_ordered) AS total_quantity\nFROM sales_data\nWHERE state IS NOT NULL\nGROUP BY state\nORDER BY total_quantity DESC;',
      sqlNote: 'Generated a grouped total, skipping rows with no state.', rows: 8,
      visual: 'A ranking with long labels, so a bar chart.',
      narr: 'Named the top state and compared it with the runner-up.',
    }),
    followups: ['Which cities in CA order the most?', 'What is the total sales by product line?', 'How has total sales changed by quarter?'],
  },
  {
    id: 'country-classic', dataset: 'sales_data', match: /countr(y|ies).*classic|classic.*countr/i,
    question: 'Which countries buy the most Classic Cars?', title: 'Classic Cars Sales by Country',
    columns: ['Country', 'Product line'], calcs: ['Total Sales'], dim: 'Country', dimKey: 'country', measure: 'Total Sales',
    rows: [
      { label: 'USA', value: 1344030 }, { label: 'France', value: 452560 }, { label: 'Spain', value: 441840 },
      { label: 'Australia', value: 290470 }, { label: 'Italy', value: 181320 }, { label: 'Finland', value: 146380 },
      { label: 'UK', value: 139970 },
    ],
    chart: 'bar', tokens: 2960,
    narrative: [{ kind: 'bullets', items: [
      'The USA buys the most Classic Cars at [[1.34M]], about [[34%]] of Classic Cars sales.',
      'France ([[453K]]) and Spain ([[442K]]) are close behind each other.',
    ] }],
    steps: steps({
      intent: 'Intent: total Classic Cars sales for each country. Filter: product line = Classic Cars.',
      cols: 'country, product_line, sales', dataset: 'sales_data',
      sqlText: "SELECT country,\n       SUM(sales) AS total_sales\nFROM sales_data\nWHERE product_line = 'Classic Cars'\nGROUP BY country\nORDER BY total_sales DESC\nLIMIT 7;",
      sqlNote: 'Filtered to Classic Cars and ranked countries by sales.', rows: 7,
      visual: 'A ranking of countries, so a bar chart.',
      narr: 'Named the leading countries and their share.',
    }),
    followups: ['What is the total sales by product line?', 'What is the average order value for each product line?', 'How did total sales change each year?'],
  },
  {
    id: 'aov-line', dataset: 'sales_data', match: /average order|aov/i,
    question: 'What is the average order value for each product line?', title: 'Average Order Value by Product Line',
    columns: ['Product line'], calcs: ['Average Order Value'], dim: 'Product Line', dimKey: 'product_line', measure: 'Average Order Value',
    rows: [
      { label: 'Classic Cars', value: 19210 }, { label: 'Trucks and Buses', value: 15870 }, { label: 'Vintage Cars', value: 12480 },
      { label: 'Motorcycles', value: 12270 }, { label: 'Planes', value: 11080 }, { label: 'Ships', value: 9930 }, { label: 'Trains', value: 6080 },
    ],
    chart: 'column', tokens: 3102,
    narrative: [{ kind: 'p', text: 'Classic Cars orders are the largest, averaging [[19.2K]] per order, while Trains orders average just [[6.1K]]. Trucks and Buses sit second at [[15.9K]] even though their total sales are lower than Vintage Cars.' }],
    steps: steps({
      intent: 'Intent: average order value (Total Sales / Order Count) for each product line.',
      cols: 'product_line, sales, order_number', dataset: 'sales_data',
      sqlText: 'SELECT product_line,\n       SUM(sales) / COUNT(DISTINCT order_number) AS avg_order_value\nFROM sales_data\nGROUP BY product_line\nORDER BY avg_order_value DESC;',
      sqlNote: 'Used the Average Order Value metric from the semantic model.', rows: 7,
      visual: 'One category and one measure, so a column chart.',
      narr: 'Compared the largest and smallest average orders.',
    }),
    followups: ['What is the total sales by product line?', 'Which countries buy the most Classic Cars?', 'How are sales split by deal size?'],
  },
  {
    id: 'country', dataset: 'sales_data', match: /countr/i,
    question: 'What is the total sales by country?', title: 'Total Sales by Country',
    columns: ['Country'], calcs: ['Total Sales'], dim: 'Country', dimKey: 'country', measure: 'Total Sales',
    rows: COUNTRIES.filter((c) => c.label !== 'Others').sort((a, b) => b.value - a.value), chart: 'bar', tokens: 2875,
    narrative: [{ kind: 'bullets', items: [
      'The USA is by far the largest market at [[3.63M]], about [[36%]] of all sales.',
      'Spain ([[1.22M]]) and France ([[1.11M]]) follow, together about [[23%]].',
    ] }],
    steps: steps({
      intent: 'Intent: add up sales and group them by country.',
      cols: 'country, sales', dataset: 'sales_data',
      sqlText: sql('country', 'SUM(sales)', 'total_sales', 'sales_data'),
      sqlNote: 'Generated a grouped total, sorted from highest to lowest.', rows: 12,
      visual: 'A ranking of countries, so a bar chart.',
      narr: 'Named the largest markets and their share.',
    }),
    followups: ['Which countries buy the most Classic Cars?', 'What is the average order value for each product line?', 'How did total sales change each year?'],
  },
  {
    id: 'deal', dataset: 'sales_data', match: /deal/i,
    question: 'How are sales split by deal size?', title: 'Sales by Deal Size',
    columns: ['Deal size'], calcs: ['Total Sales'], dim: 'Deal Size', dimKey: 'deal_size', measure: 'Total Sales',
    rows: DEAL_SIZES, chart: 'column', tokens: 1980,
    narrative: [{ kind: 'kpis', items: [
      { label: 'Medium deals', value: '6.09M', note: '60.7% of sales' },
      { label: 'Small deals', value: '2.64M', note: '26.3% of sales' },
      { label: 'Large deals', value: '1.30M', note: '13.0% of sales' },
    ] }],
    steps: steps({
      intent: 'Intent: add up sales and group them by deal size.',
      cols: 'deal_size, sales', dataset: 'sales_data',
      sqlText: sql('deal_size', 'SUM(sales)', 'total_sales', 'sales_data'),
      sqlNote: 'Generated a grouped total, sorted from highest to lowest.', rows: 3,
      visual: 'Three groups and one measure, so a column chart.',
      narr: 'Reported the share of each deal size.',
    }),
    followups: ['What is the total sales by product line?', 'How did total sales change each year?', 'Which countries buy the most Classic Cars?'],
  },
  {
    id: 'vg-genre', dataset: 'video_game_sales', match: /genre|type of game/i,
    question: 'Which genre has the highest global sales?', title: 'Global Sales by Genre (millions of units)',
    columns: ['Genre'], calcs: ['Total Global Sales'], dim: 'Genre', dimKey: 'genre', measure: 'Global Sales (M units)',
    rows: [
      { label: 'Action', value: 1751.18 }, { label: 'Sports', value: 1330.93 }, { label: 'Shooter', value: 1037.37 },
      { label: 'Role-Playing', value: 927.37 }, { label: 'Platform', value: 831.37 }, { label: 'Misc', value: 809.96 },
      { label: 'Racing', value: 732.04 }, { label: 'Fighting', value: 448.91 },
    ],
    chart: 'bar', tokens: 2410, digits: 0,
    narrative: [{ kind: 'bullets', items: [
      'Action games sell the most, with [[1,751M]] units worldwide.',
      'Sports ([[1,331M]]) and Shooter ([[1,037M]]) complete the top three.',
    ] }],
    steps: steps({
      intent: 'Intent: total global unit sales for each genre.',
      cols: 'genre, global_sales', dataset: 'video_game_sales',
      sqlText: sql('genre', 'SUM(global_sales)', 'total_global_sales', 'video_game_sales'),
      sqlNote: 'Generated a grouped total, sorted from highest to lowest.', rows: 8,
      visual: 'A ranking with several categories, so a bar chart.',
      narr: 'Named the top three genres.',
    }),
    followups: ['Which platform sold the most units?', 'How do sales split across regions?', 'Which genre has the highest global sales?'],
  },
  {
    id: 'vg-platform', dataset: 'video_game_sales', match: /platform|console/i,
    question: 'Which platform sold the most units?', title: 'Global Sales by Platform (millions of units)',
    columns: ['Platform'], calcs: ['Total Global Sales'], dim: 'Platform', dimKey: 'platform', measure: 'Global Sales (M units)',
    rows: [
      { label: 'PS2', value: 1255.64 }, { label: 'X360', value: 979.96 }, { label: 'PS3', value: 957.84 }, { label: 'Wii', value: 926.71 },
      { label: 'DS', value: 822.49 }, { label: 'PS', value: 730.66 }, { label: 'GBA', value: 318.5 }, { label: 'PSP', value: 296.28 },
    ],
    chart: 'column', tokens: 2330, digits: 0,
    narrative: [{ kind: 'p', text: 'The PS2 sold the most game units, [[1,256M]], well ahead of the Xbox 360 ([[980M]]) and PS3 ([[958M]]).' }],
    steps: steps({
      intent: 'Intent: total global unit sales for each platform.',
      cols: 'platform, global_sales', dataset: 'video_game_sales',
      sqlText: sql('platform', 'SUM(global_sales)', 'total_global_sales', 'video_game_sales') .replace(';', '\nLIMIT 8;'),
      sqlNote: 'Ranked platforms by units sold and kept the top eight.', rows: 8,
      visual: 'One category and one measure, so a column chart.',
      narr: 'Compared the top platform with the next two.',
    }),
    followups: ['Which genre has the highest global sales?', 'How do sales split across regions?', 'Which platform sold the most units?'],
  },
  {
    id: 'vg-region', dataset: 'video_game_sales', match: /region|split|north america|europe|japan/i,
    question: 'How do sales split across regions?', title: 'Unit Sales by Region (millions of units)',
    columns: ['NA, EU, JP, Other sales'], calcs: ['Total NA Sales', 'Total EU Sales', 'Total JP Sales'], dim: 'Region', dimKey: 'region', measure: 'Sales (M units)',
    rows: [
      { label: 'North America', value: 4392.95 }, { label: 'Europe', value: 2434.13 }, { label: 'Japan', value: 1291.02 }, { label: 'Other', value: 797.75 },
    ],
    chart: 'column', tokens: 2620, digits: 0,
    narrative: [{ kind: 'kpis', items: [
      { label: 'North America', value: '4.39B', note: '49% of units' },
      { label: 'Europe', value: '2.43B', note: '27% of units' },
      { label: 'Japan', value: '1.29B', note: '14% of units' },
      { label: 'Other regions', value: '798M', note: '9% of units' },
    ] }],
    steps: steps({
      intent: 'Intent: total unit sales for each region column.',
      cols: 'na_sales, eu_sales, jp_sales, other_sales', dataset: 'video_game_sales',
      sqlText: 'SELECT SUM(na_sales)    AS north_america,\n       SUM(eu_sales)    AS europe,\n       SUM(jp_sales)    AS japan,\n       SUM(other_sales) AS other\nFROM video_game_sales;',
      sqlNote: 'Summed each regional sales column.', rows: 4,
      visual: 'Four regions and one measure, so a column chart.',
      narr: 'Reported each region’s share of units.',
    }),
    followups: ['Which genre has the highest global sales?', 'Which platform sold the most units?', 'How do sales split across regions?'],
  },
  {
    id: 'wh-life', dataset: 'world_health_bank_data', match: /life|lifespan|expectancy/i,
    question: 'What is the average life expectancy by region?', title: 'Average Life Expectancy by Region (years)',
    columns: ['Region'], calcs: ['Average Life Expectancy'], dim: 'Region', dimKey: 'region', measure: 'Life expectancy (years)',
    rows: [
      { label: 'North America', value: 79.2 }, { label: 'Europe & Central Asia', value: 77.9 }, { label: 'East Asia & Pacific', value: 76.0 },
      { label: 'Latin America & Caribbean', value: 75.6 }, { label: 'Middle East & N. Africa', value: 74.2 }, { label: 'South Asia', value: 70.0 },
      { label: 'Sub-Saharan Africa', value: 61.6 },
    ],
    chart: 'bar', tokens: 2275, digits: 1, unit: ' yrs',
    narrative: [{ kind: 'p', text: 'People in North America live the longest on average, [[79.2]] years, about [[17.6]] years more than in Sub-Saharan Africa ([[61.6]]).' }],
    steps: steps({
      intent: 'Intent: average life expectancy for each region in the latest year.',
      cols: 'region, life_expectancy, year', dataset: 'world_health_bank_data',
      sqlText: 'SELECT region,\n       AVG(life_expectancy) AS avg_life_expectancy\nFROM world_health_bank_data\nWHERE year = (SELECT MAX(year) FROM world_health_bank_data)\nGROUP BY region\nORDER BY avg_life_expectancy DESC;',
      sqlNote: 'Averaged life expectancy per region for the latest year.', rows: 7,
      visual: 'A ranking with long labels, so a bar chart.',
      narr: 'Compared the longest and shortest life expectancy.',
    }),
    followups: ['How much do income groups spend on health?', 'Which regions have the highest infant mortality?', 'What is the average life expectancy by region?'],
  },
  {
    id: 'wh-spend', dataset: 'world_health_bank_data', match: /spend|expenditure|income/i,
    question: 'How much do income groups spend on health?', title: 'Health Spend (% of GDP) by Income Group',
    columns: ['Income group'], calcs: ['Average Health Spend (% of GDP)'], dim: 'Income group', dimKey: 'income_group', measure: 'Health spend (% of GDP)',
    rows: [
      { label: 'High income', value: 12.5 }, { label: 'Upper middle', value: 6.2 }, { label: 'Low income', value: 5.4 }, { label: 'Lower middle', value: 4.0 },
    ],
    chart: 'column', tokens: 2190, digits: 1, unit: '%',
    narrative: [{ kind: 'p', text: 'High-income countries spend about [[12.5%]] of GDP on health, roughly twice the share of upper-middle-income countries ([[6.2%]]).' }],
    steps: steps({
      intent: 'Intent: average health expenditure as a share of GDP for each income group.',
      cols: 'income_group, health_exp_pct_gdp', dataset: 'world_health_bank_data',
      sqlText: sql('income_group', 'AVG(health_exp_pct_gdp)', 'avg_health_spend', 'world_health_bank_data'),
      sqlNote: 'Averaged health spend per income group.', rows: 4,
      visual: 'Four groups and one measure, so a column chart.',
      narr: 'Compared high-income spend with the other groups.',
    }),
    followups: ['What is the average life expectancy by region?', 'Which regions have the highest infant mortality?', 'How much do income groups spend on health?'],
  },
  {
    id: 'wh-infant', dataset: 'world_health_bank_data', match: /infant|mortality|baby/i,
    question: 'Which regions have the highest infant mortality?', title: 'Infant Mortality by Region (per 1,000 births)',
    columns: ['Region'], calcs: ['Average Infant Mortality'], dim: 'Region', dimKey: 'region', measure: 'Deaths per 1,000 births',
    rows: [
      { label: 'Sub-Saharan Africa', value: 51.0 }, { label: 'South Asia', value: 33.1 }, { label: 'Middle East & N. Africa', value: 18.6 },
      { label: 'Latin America & Caribbean', value: 14.9 }, { label: 'East Asia & Pacific', value: 12.6 }, { label: 'Europe & Central Asia', value: 7.2 },
      { label: 'North America', value: 5.4 },
    ],
    chart: 'bar', tokens: 2240, digits: 1,
    narrative: [{ kind: 'p', text: 'Sub-Saharan Africa has the highest infant mortality at [[51.0]] deaths per 1,000 births, followed by South Asia at [[33.1]].' }],
    steps: steps({
      intent: 'Intent: average infant mortality rate for each region, highest first.',
      cols: 'region, infant_mortality_rate', dataset: 'world_health_bank_data',
      sqlText: sql('region', 'AVG(infant_mortality_rate)', 'avg_infant_mortality', 'world_health_bank_data'),
      sqlNote: 'Averaged infant mortality per region, sorted highest first.', rows: 7,
      visual: 'A ranking with long labels, so a bar chart.',
      narr: 'Named the two regions with the highest rates.',
    }),
    followups: ['What is the average life expectancy by region?', 'How much do income groups spend on health?', 'Which regions have the highest infant mortality?'],
  },
];

/** Find the canned answer for a question; falls back to the dataset's first answer. */
export function answerFor(question: string, dataset: DatasetName): Answer {
  const pool = ANSWERS.filter((a) => a.dataset === dataset);
  const exact = pool.find((a) => a.question.toLowerCase() === question.trim().toLowerCase());
  if (exact) return exact;
  return pool.find((a) => a.match.test(question)) ?? pool[0];
}

/* ───────────── Filters ───────────── */

export type FilterDefs = Record<string, { label: string; options: string[] }>;

export const ANSWER_FILTERS: FilterDefs = {
  year: { label: 'Year', options: ['2003', '2004', '2005'] },
  country: { label: 'Country', options: ['USA', 'Spain', 'France', 'Australia', 'UK'] },
  deal: { label: 'Deal size', options: ['Small', 'Medium', 'Large'] },
};

export const BOARD_FILTERS: FilterDefs = {
  ...ANSWER_FILTERS,
  line: { label: 'Product line', options: ['Classic Cars', 'Vintage Cars', 'Motorcycles', 'Trucks and Buses', 'Planes', 'Ships', 'Trains'] },
};

export const ALL_PINS_FILTERS: FilterDefs = {
  dataset: { label: 'Dataset', options: ['sales_data', 'video_game_sales', 'world_health_bank_data'] },
  created: { label: 'Date created', options: ['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'This year'] },
  owner: { label: 'Owner', options: ['Me', 'Yash', 'Shared with me'] },
  board: { label: 'Board', options: ['Sales Overview', 'Yash Pins', 'Testing AI Sales', 'Uncategorized'] },
  ctype: { label: 'Chart type', options: ['Line', 'Column', 'Bar', 'Area', 'Table'] },
};

const SHARE: Record<string, Record<string, number>> = {
  year: { '2003': 0.351, '2004': 0.471, '2005': 0.178 },
  country: { USA: 0.362, Spain: 0.121, France: 0.111, Australia: 0.063, UK: 0.048 },
  deal: { Small: 0.263, Medium: 0.607, Large: 0.13 },
  line: { 'Classic Cars': 0.391, 'Vintage Cars': 0.19, Motorcycles: 0.116, 'Trucks and Buses': 0.112, Planes: 0.097, Ships: 0.071, Trains: 0.023 },
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

/** Approximates the rows a filtered query would return, so filters visibly change charts. */
export function applyFilters(rows: Row[], f: Record<string, string>, dimKey: string): Row[] {
  const keys = Object.keys(f).filter((k) => SHARE[k] && f[k]);
  if (!keys.length) return rows;
  return rows
    .map((r) => {
      let v = r.value;
      for (const k of keys) {
        // Filtering on the chart's own dimension keeps only the matching row.
        if ((k === 'year' && dimKey === 'year') || (k === 'line' && dimKey === 'product_line') || (k === 'deal' && dimKey === 'deal_size') || (k === 'country' && dimKey === 'country')) {
          if (!r.label.startsWith(f[k]) && !(k === 'line' && r.label.replace('/', ' and ') === f[k])) return { ...r, value: 0 };
          continue;
        }
        if (k === 'year' && dimKey === 'quarter') {
          if (!r.label.startsWith(f[k])) return { ...r, value: 0 };
          continue;
        }
        const jitter = 0.75 + hash(r.label + k + f[k]) * 0.5;
        v *= SHARE[k][f[k]] * jitter;
      }
      return { ...r, value: Math.round(v * 100) / 100 };
    })
    .filter((r) => r.value > 0);
}
