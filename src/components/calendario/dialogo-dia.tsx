import { CalendarPlus, Clock, MapPin, Pencil, Trash2 } from "lucide-react";

import { EtiquetaEntidade } from "@/components/shared/ponto-entidade";
import { EstadoVazio } from "@/components/shared/estado-vazio";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { COR_PADRAO, comAlfa, type EventoDetalhado } from "@/lib/domain";
import { formatarDataLonga, formatarIntervalo } from "@/lib/format";

interface PropsDialogoDia {
  dia: string | null;
  eventos: EventoDetalhado[];
  mostrarEntidade?: boolean;
  podeGerenciar?: boolean;
  aoFechar: () => void;
  aoEditar: (evento: EventoDetalhado) => void;
  aoExcluir: (evento: EventoDetalhado) => void;
  aoCriar: (dia: string) => void;
}

export function DialogoDia({
  dia,
  eventos,
  mostrarEntidade = false,
  podeGerenciar = false,
  aoFechar,
  aoEditar,
  aoExcluir,
  aoCriar,
}: PropsDialogoDia) {
  return (
    <Dialog open={Boolean(dia)} onOpenChange={(aberto) => !aberto && aoFechar()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto border-border bg-popover shadow-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg capitalize">
            {dia ? formatarDataLonga(dia) : ""}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            {eventos.length === 0
              ? "Nenhum evento programado para este dia."
              : `${eventos.length} ${eventos.length === 1 ? "evento" : "eventos"} neste dia.`}
          </DialogDescription>
        </DialogHeader>

        {eventos.length === 0 ? (
          <EstadoVazio
            icone={CalendarPlus}
            titulo="Dia livre"
            descricao="Aproveite para planejar uma atividade ou descansar."
            acao={
              podeGerenciar && dia ? (
                <Button size="sm" onClick={() => aoCriar(dia)}>
                  <CalendarPlus />
                  Criar evento neste dia
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {eventos.map((evento) => {
              const cor = evento.entidade?.cor ?? COR_PADRAO;
              return (
                <article
                  key={evento.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 shadow-sm"
                  style={{ borderLeftWidth: 3, borderLeftColor: cor }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">{evento.nome}</h4>
                      {mostrarEntidade && evento.entidade && (
                        <EtiquetaEntidade cor={evento.entidade.cor} nome={evento.entidade.nome} />
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        {formatarIntervalo(evento.horario_inicio, evento.horario_fim)}
                      </span>
                      {evento.local && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          {evento.local}
                        </span>
                      )}
                    </div>
                    {evento.descricao && (
                      <p
                        className="mt-2 rounded-md px-2 py-1.5 text-[12px] leading-relaxed text-muted-foreground"
                        style={{ backgroundColor: comAlfa(cor, 0.08) }}
                      >
                        {evento.descricao}
                      </p>
                    )}
                  </div>

                  {podeGerenciar && (
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar ${evento.nome}`}
                        onClick={() => aoEditar(evento)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Excluir ${evento.nome}`}
                        className="hover:text-destructive"
                        onClick={() => aoExcluir(evento)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  )}
                </article>
              );
            })}

            {podeGerenciar && dia && (
              <Button variant="outline" size="sm" className="self-start" onClick={() => aoCriar(dia)}>
                <CalendarPlus />
                Adicionar evento
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
