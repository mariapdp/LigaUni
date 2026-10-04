import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CalendarioEventos } from "@/components/calendario/calendario-eventos";
import { BlocoCarregando } from "@/components/shared/carregando";
import { CabecalhoPagina } from "@/components/shared/cabecalho-pagina";
import { Card } from "@/components/ui/card";
import { useAutenticacao } from "@/hooks/use-auth";
import { chaves, useEventosDetalhados } from "@/hooks/use-dados";
import { atualizarEvento, criarEvento, removerEvento, type EventoEntrada } from "@/lib/api";

export default function LiderCalendario() {
  const { entidadeId } = useAutenticacao();
  const queryClient = useQueryClient();
  const { dados: eventos, carregando } = useEventosDetalhados();

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

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <CabecalhoPagina
        titulo="Calendário de eventos"
        descricao="Visão mensal e semanal dos eventos da sua entidade. Clique em um dia para ver os detalhes."
      />

      {carregando ? (
        <Card>
          <BlocoCarregando linhas={6} />
        </Card>
      ) : (
        <CalendarioEventos
          eventos={eventos}
          carregando={carregando}
          mostrarEntidade={false}
          podeGerenciar={Boolean(entidadeId)}
          entidadeFixaId={entidadeId}
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
