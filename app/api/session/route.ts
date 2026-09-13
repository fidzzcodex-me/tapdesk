import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/store";

export async function POST(req: NextRequest) {
  const session = createSession();
  const origin = req.nextUrl.origin;

  const snippet = `<script src="${origin}/tapdesk.js" data-session="${session.id}" data-sync="true"></script>`;

  const bookmarkletSrc = `(function(){var s=document.createElement('script');s.src='${origin}/tapdesk.js';s.setAttribute('data-session','${session.id}');s.setAttribute('data-sync','true');document.body.appendChild(s);})();`;
  const bookmarklet = `javascript:${encodeURIComponent(bookmarkletSrc)}`;

  return NextResponse.json({
    sessionId: session.id,
    snippet,
    bookmarklet,
  });
}
