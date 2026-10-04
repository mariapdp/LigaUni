import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CalendarioEventos } from "@/components/calendario/calendario-eventos";
import { FiltroEntidades } from "@/components/admin/filtro-entidades";
import { BlocoCarregando } from "@/components/shared/carregando";
import { CabecalhoPagina } from "@/components/shared/cabecalho-pagina";
import { Card } from "@/components/ui/card";
import { chaves, useEntidades, useEventosDetalhados } from "@/hooks/use-dados";
import { atualizarEvento, criarEvento, removerEvento, type EventoEntrada } from "@/lib/api";
import { comAlfa } from "@/lib/domain";
import { cn } from "@/lib/utils";

export default function AdminCalendario() {
  const queryClient = useQueryClient();
  const { data: entidades } = useEntidades();
  const { dados: eventos, carregando } = useEventosDetalhados();

  const [selecionadas, setSelecionadas] = useState<string[] | null>(null);

  const todas = useMemo(() => (entidades ?? []).map((entidade) => entidade.id), [entidades]);
  const efetivas = selecionadas ?? todas;

  const visiveis = useMemo(
    () => eventos.filter((evento) => efetivas.includes(evento.entidade_id)),
    [eventos, efetivas],
  );

  const invalidar = () => void queryClient.invalidateQueries({ queryKey: chaves.eventos });

  const salvar = useMutation({
    mutationFn: async ({ dados, id }: { dados: EventoEntrada; id?: string }) => {
      if (id) await atualizarEvento(id, dados);
      else await criarEvento(dados);
    },
    onSuccess: invalidar,
    onError: (erro: Error) => toast.error(erro.message),
  });

  const excluir = useMutation({
    mutationFn: (id: string) => removerEvento(id),
    onSuccess: invalidar,
    onError: (erro: Error) => toast.error(erro.message),
  });

  const legenda = (
    <Card className="p-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        Cor por entidade
      </p>
      <div className="flex flex-wrap gap-1.5">
        {(entidades ?? []).map((entidade) => {
          const ativa = efetivas.includes(entidade.id);
          return (
            <button
              key={entidade.id}
              type="button"
              onClick={() =>
                setSelecionadas(
                  ativa
                    ? efetivas.filter((id) => id !== entidade.id)
                    : [...efetivas, entidade.id],
                )
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-opacity",
                !ativa && "opacity-35",
              )}
              style={{
                backgroundColor: comAlfa(entidade.cor, 0.14),
                borderColor: comAlfa(entidade.cor, 0.35),
                color: entidade.cor,
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: entidade.cor }}
                aria-hidden="true"
              />
              {entidade.nome}
            </button>
          );
        })}
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <CabecalhoPagina
        titulo="Calendário consolidado"
        descricao="Todos os eventos das entidades acadêmicas, com cor por entidade e filtro multisseleção."
      />

      {carregando ? (
        <Card>
          <BlocoCarregando linhas={6} />
        </Card>
      ) : (
        <CalendarioEventos
          eventos={visiveis}
          carregando={carregando}
          mostrarEntidade
          podeGerenciar
          entidadesDisponiveis={entidades ?? []}
          legenda={legenda}
          acoesFerramentas={
            <FiltroEntidades
              entidades={entidades ?? []}
              selecionadas={efetivas}
              aoMudar={setSelecionadas}
            />
          }
          aoSalvar={async (dados, id) => {
            await salvar.mutateAsync({ dados, id });
          }}
          aoExcluir={async (id) => {
            await excluir.mutateAsync(id);
          }}
        />
      )}
    </div>
  );
}
