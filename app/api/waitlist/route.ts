import { NextResponse } from "next/server";

const waitlistEmail = process.env.WAITLIST_EMAIL;

type WaitlistPayload = {
  email?: string;
  note?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as WaitlistPayload | null;

  if (!body?.email || !isValidEmail(body.email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (!waitlistEmail) {
    return NextResponse.json(
      { error: "Waitlist is not configured yet." },
      { status: 503 },
    );
  }

  const response = await fetch(`https://formsubmit.co/ajax/${waitlistEmail}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: body.email,
      note: body.note ?? "",
      _subject: "GLM52 Claude Code waitlist",
      _template: "table",
      _replyto: body.email,
      _cc: body.email,
      _captcha: "false",
    }),
  }).catch(() => null);

  if (!response?.ok) {
    return NextResponse.json(
      { error: "Could not save your waitlist request right now." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
