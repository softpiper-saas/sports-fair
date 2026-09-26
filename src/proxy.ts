import { NextResponse, type NextRequest } from "next/server";
import { createRequestId, requestIdHeader } from "@/lib/observability/request-id";

export function proxy(request: NextRequest) {
  const requestId = request.headers.get(requestIdHeader) || createRequestId();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(requestIdHeader, requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  response.headers.set(requestIdHeader, requestId);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|news-sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml)$).*)"
  ]
};
