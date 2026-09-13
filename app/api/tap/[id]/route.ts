import { NextRequest, NextResponse } from "next/server";
import { deactivateSession, getSession, pushEvent, store } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSession(params.id);
  if (!session) {
    return NextResponse.json({ error: "sesi tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({
    sessionId: session.id,
    active: session.active,
    events: session.events,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSession(params.id);
  if (!session) {
    return NextResponse.json({ error: "sesi tidak ditemukan" }, { status: 404 });
  }
  if (!session.active) {
    return NextResponse.json({ error: "sync sedang mati" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "payload tidak valid" }, { status: 400 });
  }

  const updated = pushEvent(params.id, {
    type: body.type === "console" ? "console" : "network",
    method: body.method,
    url: body.url,
    status: body.status,
    duration: body.duration,
    level: body.level,
    message: body.message,
    timestamp: typeof body.timestamp === "number" ? body.timestamp : Date.now(),
  });

  if (!updated) {
    return NextResponse.json({ error: "gagal menyimpan" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSession(params.id);
  if (!session) {
    return NextResponse.json({ error: "sesi tidak ditemukan" }, { status: 404 });
  }
  session.active = true;
  store.sessions.set(params.id, session);
  return NextResponse.json({ ok: true, active: session.active });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = deactivateSession(params.id);
  if (!session) {
    return NextResponse.json({ error: "sesi tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, active: session.active });
}
