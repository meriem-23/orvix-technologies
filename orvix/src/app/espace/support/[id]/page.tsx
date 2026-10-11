import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ChevronLeft } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { TicketThread } from "@/components/ticket-thread";
import { ReplyForm } from "@/components/ticket-forms";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TICKET_STATUS_LABEL } from "@/lib/format";
import type { Ticket, TicketMessage } from "@/lib/types";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const id = z.string().uuid().safeParse((await params).id);
  if (!id.success) notFound();
  const { profile } = await requireUser();
  const supabase = await createClient();
  const { data: ticket } = await supabase
    .from("tickets")
    .select("*, products(name)")
    .eq("id", id.data)
    .eq("user_id", profile.id)
    .maybeSingle<Ticket & { products: { name: string } | null }>();
  if (!ticket) notFound();
  const { data: messages } = await supabase.from("ticket_messages").select("*").eq("ticket_id", ticket.id).order("created_at");

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/espace/support" className="btn-quiet -ml-3 mb-4"><ChevronLeft className="h-4 w-4" /> Tous les tickets</Link>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-muted">{ticket.products?.name ?? "Général"}</p>
        </div>
        <StatusBadge value={ticket.status} label={TICKET_STATUS_LABEL[ticket.status]} />
      </div>
      <TicketThread messages={(messages ?? []) as TicketMessage[]} viewer="client" />
      <div className="mt-6"><ReplyForm ticketId={ticket.id} disabled={ticket.status === "ferme"} /></div>
    </div>
  );
}
