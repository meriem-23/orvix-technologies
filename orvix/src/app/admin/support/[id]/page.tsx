import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ChevronLeft, Phone, Mail } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { TicketThread } from "@/components/ticket-thread";
import { ReplyForm } from "@/components/ticket-forms";
import { setTicketStatus } from "@/app/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TICKET_STATUS_LABEL } from "@/lib/format";
import type { Ticket, TicketMessage, TicketStatus } from "@/lib/types";

type Row = Ticket & { products: { name: string } | null; profiles: { full_name: string; email: string; phone: string; company: string } | null };

export default async function AdminTicket({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = z.string().uuid().safeParse((await params).id);
  if (!id.success) notFound();
  const supabase = await createClient();
  const { data: ticket } = await supabase
    .from("tickets").select("*, products(name), profiles(full_name,email,phone,company)").eq("id", id.data).maybeSingle<Row>();
  if (!ticket) notFound();
  const { data: messages } = await supabase.from("ticket_messages").select("*").eq("ticket_id", ticket.id).order("created_at");
  const c = ticket.profiles;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/support" className="btn-quiet -ml-3 mb-4"><ChevronLeft className="h-4 w-4" /> Support</Link>
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{ticket.subject}</h1>
              <p className="mt-1 text-sm text-muted">{ticket.products?.name ?? "Général"}</p>
            </div>
            <div className="flex gap-2">
              {ticket.priority === "urgente" && <StatusBadge value="urgente" label="Urgent" />}
              <StatusBadge value={ticket.status} label={TICKET_STATUS_LABEL[ticket.status]} />
            </div>
          </div>
          <TicketThread messages={(messages ?? []) as TicketMessage[]} viewer="staff" />
          <div className="mt-6"><ReplyForm ticketId={ticket.id} /></div>
        </div>

        <aside className="grid h-fit gap-4">
          <div className="panel p-4 text-sm">
            <p className="font-semibold">{c?.full_name}</p>
            {c?.company && <p className="text-muted">{c.company}</p>}
            <div className="mt-3 grid gap-2">
              {c?.phone && <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-muted hover:text-ink"><Phone className="h-4 w-4" /> {c.phone}</a>}
              {c?.email && <a href={`mailto:${c.email}`} className="flex items-center gap-2 break-all text-muted hover:text-ink"><Mail className="h-4 w-4 shrink-0" /> {c.email}</a>}
            </div>
          </div>
          <div className="panel p-4">
            <p className="mb-3 text-sm font-semibold">Changer le statut</p>
            <div className="grid grid-cols-2 gap-2">
              {(["ouvert", "en_attente", "resolu", "ferme"] as TicketStatus[]).map((s) => (
                <form key={s} action={setTicketStatus}>
                  <input type="hidden" name="id" value={ticket.id} />
                  <input type="hidden" name="status" value={s} />
                  <button disabled={ticket.status === s} className={`btn h-9 w-full text-xs ${ticket.status === s ? "bg-brand text-brand-ink" : "border border-line hover:border-brand/50"}`}>
                    {TICKET_STATUS_LABEL[s]}
                  </button>
                </form>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
