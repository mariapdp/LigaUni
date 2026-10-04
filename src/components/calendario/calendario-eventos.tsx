import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CalendarPlus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { DialogoDia } from "@/components/calendario/dialogo-dia";
import { DialogoEvento } from "@/components/calendario/dialogo-evento";
import { VisaoMes } from "@/components/calendario/visao-mes";
import { VisaoSemana } from "@/components/calendario/visao-semana";
import { DialogoConfirmacao } from "@/components/shared/dialogo-confirmacao";
import { Button } from "@/components/ui/button";
import type { EventoEntrada } from "@/lib/api";
import type { Entidade, EventoDetalhado } from "@/lib/domain";
import {
  adicionarDias,
  adicionarMeses,
  dataParaBR,
  formatarDataLonga,
  inicioDaSemana,
  mesAno,
  paraISO,
} from "@/lib/format";
import { cn } from "@/lib/utils";

type Modo = "mes" | "semana";

interface PropsCalendario {
  eventos: EventoDetalhado[];
  carregando?: boolean;
  mostrarEntidade?: boolean;
  podeGerenciar?: boolean;
  entidadeFixaId?: string | null;
  entidadesDisponiveis?: Entidade[];
  legenda?: ReactNode;
  acoesFerramentas?: ReactNode;
  aoSalvar: (dados: EventoEntrada, id?: string) => Promise<void>;
  aoExcluir: (id: string) => Promise<void>;
}

export function CalendarioEventos({
  eventos,
  carregando = false,
  mostrarEntidade = false,
  podeGerenciar = false,
  entidadeFixaId,
  entidadesDisponiveis,
  legenda,
  acoesFerramentas,
  aoSalvar,
  aoExcluir,
}: PropsCalendario) {
  const [modo, setModo] = useState<Modo>("mes");
  const [referencia, setReferencia] = useState(() => new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [eventoEmEdicao, setEventoEmEdicao] = useState<EventoDetalhado | null>(null);
  const [dataNova, setDataNova] = useState<string | undefined>(undefined);
  const [eventoParaExcluir, setEventoParaExcluir] = useState<EventoDetalhado | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const rotulo = useMemo(() => {
    if (modo === "mes") return mesAno(referencia);
    const inicio = inicioDaSemana(referencia);
    return `${dataParaBR(inicio)} – ${dataParaBR(adicionarDias(inicio, 6))}`;
  }, [modo, referencia]);

  const eventosDoDia = useMemo(
    () =>
      (diaSelecionado ? eventos.filter((evento) => evento.data === diaSelecionado) : []).sort(
        (a, b) => a.horario_inicio.localeCompare(b.horario_inicio),
      ),
    [eventos, diaSelecionado],
  );

  const navegar = (direcao: -1 | 1) => {
    setReferencia((atual) =>
      modo === "mes" ? adicionarMeses(atual, direcao) : adicionarDias(atual, direcao * 7),
    );
  };

  const abrirNovo = (dia?: string) => {
    setEventoEmEdicao(null);
    setDataNova(dia ?? paraISO(referencia));
    setDialogoAberto(true);
  };

  const abrirEdicao = (evento: EventoDetalhado) => {
    setEventoEmEdicao(evento);
    setDataNova(undefined);
    setDialogoAberto(true);
  };

  const confirmarExclusao = async () => {
    if (!eventoParaExcluir) return;
    setExcluindo(true);
    try {
      await aoExcluir(eventoParaExcluir.id);
      toast.success("Evento excluído.");
      setEventoParaExcluir(null);
      setDiaSelecionado(null);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível excluir o evento.");
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon-sm"
            aria-label="Período anterior"
            onClick={() => navegar(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="secondary"
            size="icon-sm"
            aria-label="Próximo período"
            onClick={() => navegar(1)}
          >
            <ChevronRight />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setReferencia(new Date())}>
            Hoje
          </Button>
          <h2 className="ml-1 font-display text-sm font-semibold capitalize text-foreground sm:text-base">
            {rotulo}
          </h2>
          {carregando && <Loader2 className="size-4 animate-spin text-primary" />}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {acoesFerramentas}
          <div className="flex items-center rounded-md border border-border bg-background p-0.5">
            {(["mes", "semana"] as Modo[]).map((opcao) => (
              <button
                key={opcao}
                type="button"
                onClick={() => setModo(opcao)}
                className={cn(
                  "rounded-sm px-3 py-1.5 text-[13px] font-medium capitalize transition-colors",
                  modo === opcao
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opcao === "mes" ? "Mês" : "Semana"}
              </button>
            ))}
          </div>
          {podeGerenciar && (
            <Button size="sm" onClick={() => abrirNovo()}>
              <CalendarPlus />
              Novo evento
            </Button>
          )}
        </div>
      </div>

      {legenda}

      {modo === "mes" ? (
        <VisaoMes
          mes={referencia}
          eventos={eventos}
          mostrarEntidade={mostrarEntidade}
          aoSelecionarDia={setDiaSelecionado}
          aoSelecionarEvento={abrirEdicao}
          aoCriarNoDia={podeGerenciar ? abrirNovo : undefined}
        />
      ) : (
        <VisaoSemana
          diaBase={referencia}
          eventos={eventos}
          mostrarEntidade={mostrarEntidade}
          aoSelecionarDia={setDiaSelecionado}
          aoSelecionarEvento={abrirEdicao}
          aoCriarNoDia={podeGerenciar ? abrirNovo : undefined}
        />
      )}

      <DialogoDia
        dia={diaSelecionado}
        eventos={eventosDoDia}
        mostrarEntidade={mostrarEntidade}
        podeGerenciar={podeGerenciar}
        aoFechar={() => setDiaSelecionado(null)}
        aoEditar={(evento) => {
          setDiaSelecionado(null);
          abrirEdicao(evento);
        }}
        aoExcluir={(evento) => setEventoParaExcluir(evento)}
        aoCriar={abrirNovo}
      />

      {podeGerenciar && (
        <DialogoEvento
          aberto={dialogoAberto}
          aoMudarAberto={setDialogoAberto}
          evento={eventoEmEdicao}
          dataInicial={dataNova}
          entidadeFixaId={entidadeFixaId}
          entidadesDisponiveis={entidadesDisponiveis}
          aoSalvar={aoSalvar}
        />
      )}

      <DialogoConfirmacao
        aberto={Boolean(eventoParaExcluir)}
        aoMudarAberto={(aberto) => !aberto && setEventoParaExcluir(null)}
        titulo="Excluir evento"
        descricao={
          <>
            O evento <strong className="text-foreground">{eventoParaExcluir?.nome}</strong> de{" "}
            {eventoParaExcluir ? formatarDataLonga(eventoParaExcluir.data) : ""} será removido do
            calendário. Esta ação não pode ser desfeita.
          </>
        }
        textoConfirmar="Excluir"
        onConfirmar={() => void confirmarExclusao()}
        carregando={excluindo}
      />
    </div>
  );
}
