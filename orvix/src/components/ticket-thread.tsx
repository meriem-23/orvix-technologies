import { date } from "@/lib/format";
import type { TicketMessage } from "@/lib/types";

export function TicketThread({ messages, viewer }: { messages: TicketMessage[]; viewer: "client" | "staff" }) {
  return (
    <ol className="grid gap-4">
      {messages.map((m) => {
        const mine = viewer === "staff" ? m.is_staff : !m.is_staff;
        return (
          <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] rounded-lg px-4 py-3 sm:max-w-[75%] ${mine ? "bg-grad text-white" : "border border-line bg-raised"}`}>
              <p className={`text-xs font-semibold ${mine ? "text-white/75" : "text-muted"}`}>
                {m.is_staff ? "Équipe support" : viewer === "staff" ? "Client" : "Vous"}, {date(m.created_at, true)}
              </p>
              <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed">{m.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
