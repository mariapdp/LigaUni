import { Badge } from "@/components/ui/badge";
import { STATUS_RESERVA, type ReservaStatus } from "@/lib/domain";
import { cn } from "@/lib/utils";

const VARIANTES: Record<ReservaStatus, "pendente" | "aprovada" | "recusada"> = {
  pendente: "pendente",
  aprovada: "aprovada",
  recusada: "recusada",
};

const CORES_PONTO: Record<ReservaStatus, string> = {
  pendente: "bg-warning animate-pulse-pending",
  aprovada: "bg-success",
  recusada: "bg-destructive",
};

export function StatusReservaBadge({
  status,
  className,
}: {
  status: ReservaStatus;
  className?: string;
}) {
  return (
    <Badge variant={VARIANTES[status]} className={className}>
      <span
        className={cn("size-1.5 shrink-0 rounded-full", CORES_PONTO[status])}
        aria-hidden="true"
      />
      {STATUS_RESERVA[status].rotulo}
    </Badge>
  );
}
