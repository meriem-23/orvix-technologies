import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

// 1) user must be signed in, 2) RLS must let them see the release (= active licence),
// 3) then the server issues a 60-second signed URL from the private bucket.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = z.string().uuid().safeParse((await params).id);
  if (!id.success) return new NextResponse("Introuvable", { status: 404 });

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.redirect(new URL("/connexion?next=/espace/telechargements", request.url));

  if (!(await rateLimit(`dl:${auth.user.id}`, 30, 3600)))
    return new NextResponse("Trop de téléchargements, réessayez plus tard.", { status: 429 });

  const { data: release } = await supabase.from("releases").select("id,file_path,version,product_id").eq("id", id.data).maybeSingle();
  if (!release) return new NextResponse("Accès refusé : aucune licence active pour ce logiciel.", { status: 403 });

  const admin = createAdminClient();
  const filename = release.file_path.split("/").pop() ?? "installateur";
  const { data: signed, error } = await admin.storage.from("releases").createSignedUrl(release.file_path, 60, { download: filename });
  if (error || !signed) return new NextResponse("Fichier indisponible pour le moment.", { status: 500 });

  const res = NextResponse.redirect(signed.signedUrl);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
