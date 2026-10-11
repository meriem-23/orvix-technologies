"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { generateLicenseKey } from "@/lib/security";
import { fieldErrors, licenseSchema, lines, productSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/types";

const uuid = z.string().uuid();

/** Every admin action starts here: role + 2FA check, then an RLS-bound client. */
async function admin() {
  const current = await requireAdmin();
  const supabase = await createClient();
  const log = async (action: string, entity: string, entity_id?: string, meta: Record<string, unknown> = {}) => {
    await supabase.from("audit_log").insert({ actor_id: current.user.id, action, entity, entity_id, meta });
  };
  return { supabase, log, current };
}

// ---------------- Products ----------------

export async function saveProduct(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, log } = await admin();
  const id = form.get("id");
  const parsed = productSchema.safeParse({
    ...Object.fromEntries(form),
    is_published: form.get("is_published") === "on",
    in_stock: form.get("in_stock") === "on",
  });
  if (!parsed.success) return { error: "Vérifiez les champs en rouge.", fieldErrors: fieldErrors(parsed.error) };

  const d = parsed.data;
  const row = {
    ...d,
    features: lines(d.features),
    modules: lines(d.modules),
    platforms: d.platforms.split(",").map((s) => s.trim()).filter(Boolean),
    price_dzd: d.price_dzd ? Number(d.price_dzd) : null,
  };

  if (typeof id === "string" && id) {
    if (!uuid.safeParse(id).success) return { error: "Identifiant invalide." };
    const { data: before } = await supabase.from("products").select("image_path").eq("id", id).single();
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (!error && before?.image_path && before.image_path !== row.image_path)
      await supabase.storage.from("catalog").remove([before.image_path]);
    if (error) return { error: error.code === "23505" ? "Cette adresse (slug) est déjà utilisée." : "Enregistrement impossible." };
    await log("update", "product", id, { name: d.name });
    revalidatePath(`/admin/logiciels/${id}`);
    revalidatePath("/", "layout");
    return { ok: true, message: "Logiciel enregistré." };
  }

  const { data, error } = await supabase.from("products").insert(row).select("id").single();
  if (error || !data) return { error: error?.code === "23505" ? "Cette adresse (slug) est déjà utilisée." : "Création impossible." };
  await log("create", "product", data.id, { name: d.name });
  revalidatePath("/", "layout");
  redirect(`/admin/logiciels/${data.id}`);
}

export async function deleteProduct(form: FormData) {
  const { supabase, log } = await admin();
  const id = uuid.parse(form.get("id"));
  const { data: prod } = await supabase.from("products").select("image_path").eq("id", id).single();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (!error && prod?.image_path) await supabase.storage.from("catalog").remove([prod.image_path]);
  if (error) {
    // Products with licences cannot be deleted (FK restrict): unpublish instead.
    await supabase.from("products").update({ is_published: false }).eq("id", id);
    await log("unpublish", "product", id);
  } else {
    await log("delete", "product", id);
  }
  revalidatePath("/", "layout");
  redirect("/admin/logiciels");
}

const releaseSchema = z.object({
  product_id: uuid,
  version: z.string().trim().min(1).max(30).regex(/^[0-9A-Za-z.\-_ ]+$/, "Version invalide"),
  file_path: z.string().trim().max(300).regex(/^[a-z0-9-]+\/[0-9A-Za-z._-]+\/[0-9A-Za-z._ ()-]+$/, "Chemin de fichier invalide"),
  file_size: z.coerce.number().int().min(0),
  notes: z.string().trim().max(3000),
});

const externalReleaseSchema = z.object({
  product_id: uuid,
  version: releaseSchema.shape.version,
  external_url: z.string().trim().max(1000).url("Lien invalide").refine((u) => u.startsWith("https://"), "Le lien doit commencer par https://"),
  file_size: z.coerce.number().int().min(0).max(10_000_000_000).default(0),
  notes: releaseSchema.shape.notes,
});

/** Big installer hosted elsewhere: only the link is stored, revealed after the licence check. */
export async function createExternalRelease(input: z.input<typeof externalReleaseSchema>): Promise<ActionState> {
  const { supabase, log } = await admin();
  const parsed = externalReleaseSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { error } = await supabase.from("releases").insert({ ...parsed.data, file_path: "" });
  if (error) return { error: error.code === "23505" ? "Cette version existe déjà pour ce logiciel." : "Version non enregistrée." };
  await log("create", "release", parsed.data.product_id, { version: parsed.data.version, external: true });
  revalidatePath(`/admin/logiciels/${parsed.data.product_id}`);
  return { ok: true, message: "Version publiée. Le lien est donné uniquement aux clients qui ont une licence active." };
}

/** File is uploaded straight from the browser to the private bucket; this records it. */
export async function createRelease(input: z.input<typeof releaseSchema>): Promise<ActionState> {
  const { supabase, log } = await admin();
  const parsed = releaseSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { error } = await supabase.from("releases").insert(parsed.data);
  if (error) return { error: error.code === "23505" ? "Cette version existe déjà pour ce logiciel." : "Version non enregistrée." };
  await log("create", "release", parsed.data.product_id, { version: parsed.data.version });
  revalidatePath(`/admin/logiciels/${parsed.data.product_id}`);
  return { ok: true, message: "Version publiée. Elle est disponible pour les clients qui ont une licence active." };
}

export async function deleteRelease(form: FormData) {
  const { supabase, log } = await admin();
  const id = uuid.parse(form.get("id"));
  const { data: rel } = await supabase.from("releases").select("file_path,product_id").eq("id", id).single();
  if (rel) {
    if (rel.file_path) await supabase.storage.from("releases").remove([rel.file_path]);
    await supabase.from("releases").delete().eq("id", id);
    await log("delete", "release", id, { file: rel.file_path });
    revalidatePath(`/admin/logiciels/${rel.product_id}`);
  }
}

// ---------------- Licences ----------------

export async function createLicense(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, log } = await admin();
  const parsed = licenseSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Vérifiez les champs en rouge.", fieldErrors: fieldErrors(parsed.error) };

  const d = parsed.data;
  // Retry on the (astronomically unlikely) key collision.
  for (let attempt = 0; attempt < 3; attempt++) {
    const license_key = generateLicenseKey();
    const { data, error } = await supabase
      .from("licenses")
      .insert({ ...d, license_key, expires_at: d.expires_at ? `${d.expires_at}T23:59:59Z` : null })
      .select("id")
      .single();
    if (!error && data) {
      await log("create", "license", data.id, { user_id: d.user_id, product_id: d.product_id });
      revalidatePath("/admin/licences");
      return { ok: true, message: `Licence créée : ${license_key}` };
    }
    if (error?.code !== "23505") return { error: "Licence non créée. Vérifiez le client et le logiciel." };
  }
  return { error: "Licence non créée, réessayez." };
}

export async function setLicenseStatus(form: FormData) {
  const { supabase, log } = await admin();
  const id = uuid.parse(form.get("id"));
  const status = z.enum(["active", "suspendue", "expiree"]).parse(form.get("status"));
  await supabase.from("licenses").update({ status }).eq("id", id);
  await log("status", "license", id, { status });
  revalidatePath("/admin/licences");
}

/** Frees every PC activated with this licence (e.g. the client changed computer). */
export async function resetActivations(form: FormData) {
  const { supabase, log } = await admin();
  const id = uuid.parse(form.get("id"));
  await supabase.from("license_activations").delete().eq("license_id", id);
  await log("reset_devices", "license", id);
  revalidatePath("/admin/licences");
}

export async function deleteLicense(form: FormData) {
  const { supabase, log } = await admin();
  const id = uuid.parse(form.get("id"));
  await supabase.from("licenses").delete().eq("id", id);
  await log("delete", "license", id);
  revalidatePath("/admin/licences");
}

// ---------------- Requests ----------------

export async function updateRequest(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, log } = await admin();
  const parsed = z
    .object({
      id: uuid,
      status: z.enum(["nouvelle", "en_cours", "traitee", "refusee"]),
      admin_note: z.string().trim().max(3000),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Données invalides." };
  const { id, ...rest } = parsed.data;
  const { error } = await supabase.from("requests").update(rest).eq("id", id);
  if (error) return { error: "Mise à jour impossible." };
  await log("update", "request", id, { status: rest.status });
  revalidatePath("/admin/demandes");
  revalidatePath("/admin");
  return { ok: true, message: "Enregistré." };
}

export async function deleteRequest(form: FormData) {
  const { supabase, log } = await admin();
  const id = uuid.parse(form.get("id"));
  await supabase.from("requests").delete().eq("id", id);
  await log("delete", "request", id);
  revalidatePath("/admin/demandes");
}

// ---------------- Tickets ----------------

export async function setTicketStatus(form: FormData) {
  const { supabase, log } = await admin();
  const id = uuid.parse(form.get("id"));
  const status = z.enum(["ouvert", "en_attente", "resolu", "ferme"]).parse(form.get("status"));
  await supabase.from("tickets").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  await log("status", "ticket", id, { status });
  revalidatePath(`/admin/support/${id}`);
  revalidatePath("/admin/support");
}

// ---------------- Clients ----------------

export async function setClientBlocked(form: FormData) {
  const { supabase, log, current } = await admin();
  const id = uuid.parse(form.get("id"));
  if (id === current.user.id) return; // never lock yourself out
  const blocked = form.get("blocked") === "1";
  await supabase.from("profiles").update({ is_blocked: blocked }).eq("id", id).eq("role", "client");
  await log(blocked ? "block" : "unblock", "profile", id);
  revalidatePath("/admin/clients");
}

// ---------------- Settings ----------------

export async function saveSettings(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, log } = await admin();
  const parsed = z
    .object({
      phone: z.string().trim().max(30).regex(/^[+0-9 ().-]*$/, "Numéro invalide"),
      whatsapp: z.string().trim().regex(/^\d{8,15}$/, "Format international sans + ni espaces, ex. 213668792239"),
      email: z.string().trim().email("E-mail invalide").max(200),
      city: z.string().trim().max(80),
      announcement: z.string().trim().max(200),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Vérifiez les champs en rouge.", fieldErrors: fieldErrors(parsed.error) };

  const rows = Object.entries(parsed.data).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
  const { error } = await supabase.from("site_settings").upsert(rows);
  if (error) return { error: "Paramètres non enregistrés." };
  await log("update", "settings");
  revalidatePath("/", "layout");
  return { ok: true, message: "Paramètres enregistrés. Le site est à jour." };
}
