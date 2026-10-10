"use client";
import { useActionState } from "react";
import { updateRequest } from "@/app/actions/admin";
import { FormMessage, SubmitButton } from "@/components/forms";
import type { ActionState, RequestStatus } from "@/lib/types";

export function RequestAdminForm({ id, status, note, hasAccount }: { id: string; status: RequestStatus; note: string; hasAccount: boolean }) {
  const [state, action] = useActionState<ActionState, FormData>(updateRequest, {});
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
        <div>
          <label htmlFor={`status-${id}`} className="label">Statut</label>
          <select id={`status-${id}`} name="status" defaultValue={status} className="field">
            <option value="nouvelle">Nouvelle</option>
            <option value="en_cours">En cours</option>
            <option value="traitee">Traitée</option>
            <option value="refusee">Refusée</option>
          </select>
        </div>
        <div>
          <label htmlFor={`note-${id}`} className="label">Réponse au client</label>
          <textarea id={`note-${id}`} name="admin_note" defaultValue={note} maxLength={3000} className="field min-h-[80px]" placeholder={hasAccount ? "Visible dans son espace client" : "Le client n'a pas de compte : contactez-le par téléphone ou e-mail"} />
        </div>
      </div>
      <FormMessage state={state} />
      <SubmitButton pending="Enregistrement…" className="btn-primary sm:justify-self-end">Enregistrer</SubmitButton>
    </form>
  );
}
