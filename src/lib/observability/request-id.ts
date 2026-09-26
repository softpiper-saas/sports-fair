import { headers } from "next/headers";

export const requestIdHeader = "x-request-id";

export function createRequestId() {
  return crypto.randomUUID();
}

export async function getRequestId() {
  const headerStore = await headers();
  return headerStore.get(requestIdHeader);
}
