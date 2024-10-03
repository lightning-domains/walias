import { NextRequest, NextResponse } from "next/server";
import { validateEvent } from "nostr-tools";

export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Nostr ")) {
    // Not authenticated
    // Remove the pubkey from the request headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.delete("x-authenticated-pubkey");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const encodedEvent = authHeader.substring(6).trim();

  try {
    const event = JSON.parse(
      Buffer.from(encodedEvent, "base64").toString("utf-8")
    );

    // Validate event
    const isValid = validateEvent(event);
    if (!isValid) {
      return NextResponse.json(
        { reason: "Invalid signature" },
        { status: 401 }
      );
    }

    // 1. Check if the kind is 27235
    if (event.kind !== 27235) {
      return NextResponse.json({ reason: "Invalid kind" }, { status: 401 });
    }

    // 2. Check if the created_at timestamp is within 60 seconds
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - event.created_at) > 60) {
      return NextResponse.json(
        { reason: "The event is more than 60 seconds old" },
        { status: 403 }
      );
    }

    // 3. Check if the URL tag matches the request URL
    const urlTag = event.tags.find((tag: string[]) => tag[0] === "u");
    if (!urlTag || urlTag[1] !== req.url) {
      return NextResponse.json({ reason: "URL doesnt match" }, { status: 403 });
    }

    // 4. Check if the method tag matches the request method
    const methodTag = event.tags.find((tag: string[]) => tag[0] === "method");
    if (!methodTag || methodTag[1] !== req.method) {
      return NextResponse.json(
        { reason: "Method doesnt match" },
        { status: 403 }
      );
    }

    // Optional: Check the payload hash for requests with body (POST/PUT/PATCH)
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      const payloadTag = event.tags.find(
        (tag: string[]) => tag[0] === "payload"
      );
      if (payloadTag) {
        const requestBody = await req.text();
        const hash = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(requestBody)
        );
        const hashHex = Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        if (hashHex !== payloadTag[1]) {
          return NextResponse.json(
            { reason: "Body doesnt match" },
            { status: 403 }
          );
        }
      }
    }

    // Inject the pubkey into the request
    (req as any).session = {
      pubkey: event.pubkey,
    };

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-authenticated-pubkey", event.pubkey);
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (error) {
    return NextResponse.json({ reason: "Unauthorized" }, { status: 401 });
  }
}

export const config = {
  matcher: [{ source: "/api/:path*" }],
};
