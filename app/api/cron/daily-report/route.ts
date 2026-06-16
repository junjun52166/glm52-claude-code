import { NextRequest, NextResponse } from "next/server";

import {
  buildDailySnapshot,
  formatDailySnapshot,
  sendFeishuReport,
} from "@/lib/daily-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return true;
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await buildDailySnapshot();
    const text = formatDailySnapshot(snapshot);

    await sendFeishuReport(text);

    return NextResponse.json({
      ok: true,
      text,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown cron failure.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
