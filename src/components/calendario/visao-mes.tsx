import { useMemo } from "react";
import { Plus } from "lucide-react";

import { PilulaEvento } from "@/components/calendario/pilula-evento";
import type { EventoDetalhado } from "@/lib/domain";
import { gradeDoMes, mesmoDia, paraISO } from "@/lib/format";
import { cn } from "@/lib/utils";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const LIMITE_PILULAS = 3;

interface PropsVisaoMes {
  mes: Date;
  eventos: EventoDetalhado[];
  mostrarEntidade?: boolean;
  aoSelecionarDia: (dia: string) => void;
  aoSelecionarEvento: (evento: EventoDetalhado) => void;
  aoCriarNoDia?: (dia: string) => void;
}

export function VisaoMes({
  mes,
  eventos,
  mostrarEntidade = false,
  aoSelecionarDia,
  aoSelecionarEvento,
  aoCriarNoDia,
}: PropsVisaoMes) {
  const dias = useMemo(() => gradeDoMes(mes), [mes]);
  const hoje = useMemo(() => new Date(), []);

  const porDia = useMemo(() => {
    const mapa = new Map<string, EventoDetalhado[]>();
    for (const evento of eventos) {
      const lista = mapa.get(evento.data) ?? [];
      lista.push(evento);
      mapa.set(evento.data, lista);
    }
    for (const lista of mapa.values()) {
      lista.sort((a, b) => a.horario_inicio.localeCompare(b.horario_inicio));
    }
    return mapa;
  }, [eventos]);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="grid grid-cols-7 border-b border-border bg-secondary/30">
        {DIAS_SEMANA.map((dia) => (
          <div
            key={dia}
            className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
          >
            {dia}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-border/60">
        {dias.map((dia) => {
          const iso = paraISO(dia);
          const doMes = dia.getMonth() === mes.getMonth();
          const ehHoje = mesmoDia(dia, hoje);
          const lista = porDia.get(iso) ?? [];
          const visiveis = lista.slice(0, LIMITE_PILULAS);
          const restantes = lista.length - visiveis.length;

          return (
            <div
              key={iso}
              role="button"
              tabIndex={0}
              onClick={() => aoSelecionarDia(iso)}
              onKeyDown={(eventoTecla) => {
                if (eventoTecla.key === "Enter" || eventoTecla.key === " ") {
                  aoSelecionarDia(iso);
                }
              }}
              className={cn(
                "group flex min-h-[92px] cursor-pointer flex-col gap-1 bg-card p-1.5 transition-colors duration-150 hover:bg-secondary/40 sm:min-h-[112px] sm:p-2",
                !doMes && "opacity-45",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full text-[11px] font-semibold tabular",
                    ehHoje
                      ? "bg-gradient-brand text-primary-foreground shadow-brand"
                      : "text-muted-foreground",
                  )}
                >
                  {dia.getDate()}
                </span>
                {aoCriarNoDia && (
                  <button
                    type="button"
                    aria-label={`Novo evento em ${iso}`}
                    onClick={(eventoClique) => {
                      eventoClique.stopPropagation();
                      aoCriarNoDia(iso);
                    }}
                    className="hidden size-5 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary group-hover:grid"
                  >
                    <Plus className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1">
                {visiveis.map((evento) => (
                  <PilulaEvento
                    key={evento.id}
                    evento={evento}
                    mostrarEntidade={mostrarEntidade}
                    onClick={() => aoSelecionarEvento(evento)}
                  />
                ))}
                {restantes > 0 && (
                  <span className="px-1 text-[10px] font-semibold text-muted-foreground">
                    +{restantes} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
