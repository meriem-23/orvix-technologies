import type { NextRequest } from "next/server";
import { handleLicenseRequest } from "@/lib/license-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Called by the desktop software the first time a key is entered on a PC. */
export function POST(request: NextRequest) {
  return handleLicenseRequest(request, true);
}
