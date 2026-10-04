import { comAlfa, COR_PADRAO, type EventoDetalhado } from "@/lib/domain";
import { formatarHorario } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PropsPilulaEvento {
  evento: EventoDetalhado;
  mostrarEntidade?: boolean;
  className?: string;
  onClick?: () => void;
}

export function PilulaEvento({
  evento,
  mostrarEntidade = false,
  className,
  onClick,
}: PropsPilulaEvento) {
  const cor = evento.entidade?.cor ?? COR_PADRAO;

  return (
    <button
      type="button"
      onClick={(eventoClique) => {
        eventoClique.stopPropagation();
        onClick?.();
      }}
      title={`${evento.nome} · ${formatarHorario(evento.horario_inicio)}${
        evento.local ? ` · ${evento.local}` : ""
      }`}
      className={cn(
        "flex h-6 w-full items-center gap-1.5 rounded-sm border-l-2 px-1.5 text-left text-[11px] font-medium transition-transform duration-150 hover:-translate-y-px focus-visible:shadow-focus",
        className,
      )}
      style={{ backgroundColor: comAlfa(cor, 0.18), borderLeftColor: cor }}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: cor }}
        aria-hidden="true"
      />
      <span className="shrink-0 tabular text-muted-foreground">
        {formatarHorario(evento.horario_inicio)}
      </span>
      <span className="truncate text-foreground">{evento.nome}</span>
      {mostrarEntidade && evento.entidade && (
        <span className="ml-auto hidden shrink-0 truncate text-[10px] text-muted-foreground xl:inline">
          {evento.entidade.nome}
        </span>
      )}
    </button>
  );
}
