import type { NextRequest } from "next/server";
import { handleLicenseRequest } from "@/lib/license-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Called periodically by an already-activated PC to renew its offline token. */
export function POST(request: NextRequest) {
  return handleLicenseRequest(request, false);
}
