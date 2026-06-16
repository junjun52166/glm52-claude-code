import { getGoogleAccessToken } from "@/lib/google-service-account";

const GA_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

const DEFAULT_SITE_URL = "https://glm52-claude-code.vercel.app/";
const DEFAULT_PAGE_PATHS = ["/", "/glm-5-2-claude-code"];
const TRACKED_EVENTS = [
  "copy_glm52_config",
  "official_docs_click",
  "fallback_kit_waitlist_click",
  "fallback_kit_waitlist_submit",
  "source_link_click",
  "scroll_75",
] as const;

type GaReportResponse = {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
};

type GscReportResponse = {
  rows?: Array<{
    keys?: string[];
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
  }>;
};

type DailySnapshot = {
  dateLabel: string;
  ga4: {
    propertyId: string;
    users: number;
    pageViews: number;
    pageBreakdown: Array<{ path: string; views: number; users: number }>;
    events: Array<{ name: string; count: number }>;
  };
  gsc: {
    siteUrl: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    topQueries: Array<{
      query: string;
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }>;
    topPages: Array<{
      page: string;
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }>;
  };
};

function getYesterdayRange() {
  const target = new Date();
  target.setUTCDate(target.getUTCDate() - 1);

  const year = target.getUTCFullYear();
  const month = String(target.getUTCMonth() + 1).padStart(2, "0");
  const day = String(target.getUTCDate()).padStart(2, "0");
  const date = `${year}-${month}-${day}`;

  return {
    startDate: date,
    endDate: date,
    dateLabel: date,
  };
}

function toGoogleDateRange(dateRange: {
  startDate: string;
  endDate: string;
  dateLabel: string;
}) {
  return {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  };
}

function parseMetricValue(value?: string) {
  return Number.parseFloat(value ?? "0") || 0;
}

async function runGaReport(body: Record<string, unknown>) {
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    throw new Error("Missing GA4_PROPERTY_ID.");
  }

  const accessToken = await getGoogleAccessToken(GA_SCOPE);
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GA4 report failed: ${text}`);
  }

  return (await response.json()) as GaReportResponse;
}

async function queryGa4(dateRange: { startDate: string; endDate: string }) {
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    throw new Error("Missing GA4_PROPERTY_ID.");
  }

  const summary = await runGaReport({
    dateRanges: [dateRange],
    metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
  });

  const summaryRow = summary.rows?.[0];
  const users = parseMetricValue(summaryRow?.metricValues?.[0]?.value);
  const pageViews = parseMetricValue(summaryRow?.metricValues?.[1]?.value);

  const pageBreakdownReport = await runGaReport({
    dateRanges: [dateRange],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
    dimensionFilter: {
      filter: {
        fieldName: "pagePath",
        inListFilter: {
          values: DEFAULT_PAGE_PATHS,
        },
      },
    },
    orderBys: [
      {
        metric: {
          metricName: "screenPageViews",
        },
        desc: true,
      },
    ],
  });

  const pageBreakdown = DEFAULT_PAGE_PATHS.map((path) => {
    const row = pageBreakdownReport.rows?.find(
      (candidate) => candidate.dimensionValues?.[0]?.value === path,
    );

    return {
      path,
      views: parseMetricValue(row?.metricValues?.[0]?.value),
      users: parseMetricValue(row?.metricValues?.[1]?.value),
    };
  });

  const eventsReport = await runGaReport({
    dateRanges: [dateRange],
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        inListFilter: {
          values: [...TRACKED_EVENTS],
        },
      },
    },
    limit: TRACKED_EVENTS.length.toString(),
  });

  const events = TRACKED_EVENTS.map((name) => {
    const row = eventsReport.rows?.find(
      (candidate) => candidate.dimensionValues?.[0]?.value === name,
    );

    return {
      name,
      count: parseMetricValue(row?.metricValues?.[0]?.value),
    };
  });

  return {
    propertyId,
    users,
    pageViews,
    pageBreakdown,
    events,
  };
}

async function querySearchConsole(dateRange: { startDate: string; endDate: string }) {
  const siteUrl = process.env.GSC_SITE_URL ?? DEFAULT_SITE_URL;
  const accessToken = await getGoogleAccessToken(GSC_SCOPE);
  const encodedSiteUrl = encodeURIComponent(siteUrl);

  const runQuery = async (body: Record<string, unknown>) => {
    const response = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Search Console query failed: ${text}`);
    }

    return (await response.json()) as GscReportResponse;
  };

  const summary = await runQuery({
    ...dateRange,
    type: "web",
  });

  const summaryRow = summary.rows?.[0];

  const topQueries = await runQuery({
    ...dateRange,
    type: "web",
    dimensions: ["query"],
    rowLimit: 5,
  });

  const topPages = await runQuery({
    ...dateRange,
    type: "web",
    dimensions: ["page"],
    rowLimit: 5,
  });

  return {
    siteUrl,
    clicks: summaryRow?.clicks ?? 0,
    impressions: summaryRow?.impressions ?? 0,
    ctr: summaryRow?.ctr ?? 0,
    position: summaryRow?.position ?? 0,
    topQueries:
      topQueries.rows?.map((row) => ({
        query: row.keys?.[0] ?? "(unknown)",
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
        ctr: row.ctr ?? 0,
        position: row.position ?? 0,
      })) ?? [],
    topPages:
      topPages.rows?.map((row) => ({
        page: row.keys?.[0] ?? "(unknown)",
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
        ctr: row.ctr ?? 0,
        position: row.position ?? 0,
      })) ?? [],
  };
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function formatDecimal(value: number) {
  return value.toFixed(2);
}

export async function buildDailySnapshot(): Promise<DailySnapshot> {
  const dateRange = getYesterdayRange();
  const googleDateRange = toGoogleDateRange(dateRange);
  const [ga4, gsc] = await Promise.all([
    queryGa4(googleDateRange),
    querySearchConsole(googleDateRange),
  ]);

  return {
    dateLabel: dateRange.dateLabel,
    ga4,
    gsc,
  };
}

export function formatDailySnapshot(snapshot: DailySnapshot) {
  const gaLines = [
    `GA4 (${snapshot.ga4.propertyId})`,
    `- Users: ${snapshot.ga4.users}`,
    `- Pageviews: ${snapshot.ga4.pageViews}`,
    ...snapshot.ga4.pageBreakdown.map(
      (item) => `- ${item.path}: ${item.views} views / ${item.users} users`,
    ),
    ...snapshot.ga4.events.map((event) => `- ${event.name}: ${event.count}`),
  ];

  const gscLines = [
    `GSC (${snapshot.gsc.siteUrl})`,
    `- Clicks: ${snapshot.gsc.clicks}`,
    `- Impressions: ${snapshot.gsc.impressions}`,
    `- CTR: ${formatPercent(snapshot.gsc.ctr)}`,
    `- Avg position: ${formatDecimal(snapshot.gsc.position)}`,
    ...snapshot.gsc.topQueries.map(
      (item) =>
        `- Query: ${item.query} | ${item.clicks} clicks | ${item.impressions} impressions | CTR ${formatPercent(item.ctr)} | Pos ${formatDecimal(item.position)}`,
    ),
    ...snapshot.gsc.topPages.map(
      (item) =>
        `- Page: ${item.page} | ${item.clicks} clicks | ${item.impressions} impressions | CTR ${formatPercent(item.ctr)} | Pos ${formatDecimal(item.position)}`,
    ),
  ];

  return [
    `GLM52 daily report for ${snapshot.dateLabel}`,
    "",
    ...gaLines,
    "",
    ...gscLines,
  ].join("\n");
}

export async function sendFeishuReport(text: string) {
  const webhookUrl = process.env.FEISHU_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("Missing FEISHU_WEBHOOK_URL.");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      msg_type: "text",
      content: {
        text,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Feishu webhook failed: ${body}`);
  }
}
