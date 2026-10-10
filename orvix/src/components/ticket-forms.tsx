"use client";
import { useActionState, useEffect, useRef } from "react";
import { createTicket, replyTicket } from "@/app/actions/client";
import { Field, FormMessage, SubmitButton } from "./forms";
import type { ActionState } from "@/lib/types";

export function NewTicketForm({ products }: { products: { id: string; name: string }[] }) {
  const [state, action] = useActionState<ActionState, FormData>(createTicket, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="grid gap-5" noValidate>
      <Field label="Sujet" name="subject" error={fe.subject}>
        <input id="subject" name="subject" className="field" required maxLength={160} placeholder="Ex. Le ticket de caisse ne s'imprime plus" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Logiciel" name="product_id">
          <select id="product_id" name="product_id" className="field" defaultValue="">
            <option value="">Autre / général</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Urgence" name="priority">
          <select id="priority" name="priority" className="field" defaultValue="normale">
            <option value="basse">Pas pressé</option>
            <option value="normale">Normale</option>
            <option value="urgente">Urgente : je ne peux plus travailler</option>
          </select>
        </Field>
      </div>
      <Field label="Description" name="body" error={fe.body} hint="Ce que vous faisiez, le message d'erreur exact, depuis quand.">
        <textarea id="body" name="body" className="field min-h-[160px]" required maxLength={5000} />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pending="Envoi…" className="btn-primary h-12 sm:justify-self-start sm:px-8">Ouvrir le ticket</SubmitButton>
    </form>
  );
}

export function ReplyForm({ ticketId, disabled }: { ticketId: string; disabled?: boolean }) {
  const [state, action] = useActionState<ActionState, FormData>(replyTicket, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  if (disabled) return <p className="panel p-4 text-sm text-muted">Ce ticket est fermé. Ouvrez un nouveau ticket si le problème revient.</p>;
  return (
    <form ref={ref} action={action} className="grid gap-3">
      <input type="hidden" name="ticket_id" value={ticketId} />
      <label htmlFor="body" className="sr-only">Votre réponse</label>
      <textarea id="body" name="body" className="field" required maxLength={5000} placeholder="Écrire une réponse…" />
      {state.error && <FormMessage state={state} />}
      <SubmitButton pending="Envoi…" className="btn-primary sm:justify-self-end">Envoyer</SubmitButton>
    </form>
  );
}
