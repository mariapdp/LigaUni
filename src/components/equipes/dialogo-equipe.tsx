import { useMemo } from "react";
import { CalendarOff, Plus } from "lucide-react";

import { PilulaEvento } from "@/components/calendario/pilula-evento";
import { Button } from "@/components/ui/button";
import type { EventoDetalhado } from "@/lib/domain";
import { diasDaSemana, mesmoDia, paraISO, rotuloDiaCompleto } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PropsVisaoSemana {
  diaBase: Date;
  eventos: EventoDetalhado[];
  mostrarEntidade?: boolean;
  aoSelecionarDia: (dia: string) => void;
  aoSelecionarEvento: (evento: EventoDetalhado) => void;
  aoCriarNoDia?: (dia: string) => void;
}

export function VisaoSemana({
  diaBase,
  eventos,
  mostrarEntidade = false,
  aoSelecionarDia,
  aoSelecionarEvento,
  aoCriarNoDia,
}: PropsVisaoSemana) {
  const dias = useMemo(() => diasDaSemana(diaBase), [diaBase]);
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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7 lg:gap-2">
      {dias.map((dia) => {
        const iso = paraISO(dia);
        const lista = porDia.get(iso) ?? [];
        const ehHoje = mesmoDia(dia, hoje);

        return (
          <div
            key={iso}
            className={cn(
              "flex min-h-[180px] flex-col gap-2 rounded-lg border bg-card p-3 shadow-sm lg:min-h-[320px]",
              ehHoje ? "border-primary/40 bg-gradient-brand-soft" : "border-border",
            )}
          >
            <button
              type="button"
              onClick={() => aoSelecionarDia(iso)}
              className="flex items-baseline justify-between gap-2 text-left"
            >
              <span
                className={cn(
                  "font-display text-[13px] font-semibold capitalize",
                  ehHoje ? "text-primary" : "text-foreground",
                )}
              >
                {rotuloDiaCompleto(dia)}
              </span>
              {lista.length > 0 && (
                <span className="text-[11px] tabular text-muted-foreground">{lista.length}</span>
              )}
            </button>

            <div className="flex flex-1 flex-col gap-1.5">
              {lista.length === 0 ? (
                <p className="flex flex-1 items-center gap-2 rounded-md border border-dashed border-border px-2 py-3 text-[11px] text-muted-foreground">
                  <CalendarOff className="size-3.5 shrink-0" />
                  Sem eventos
                </p>
              ) : (
                lista.map((evento) => (
                  <div key={evento.id} className="flex flex-col gap-0.5">
                    <PilulaEvento
                      evento={evento}
                      mostrarEntidade={mostrarEntidade}
                      className="h-auto items-start py-1.5"
                      onClick={() => aoSelecionarEvento(evento)}
                    />
                    {evento.local && (
                      <span className="truncate pl-3 text-[10px] text-muted-foreground">
                        {evento.local}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {aoCriarNoDia && (
              <Button
                variant="ghost"
                size="xs"
                className="justify-start text-muted-foreground hover:text-primary"
                onClick={() => aoCriarNoDia(iso)}
              >
                <Plus />
                Evento
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
