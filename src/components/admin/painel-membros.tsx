import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { DialogoMembro } from "@/components/equipes/dialogo-membro";
import { TabelaMembros } from "@/components/membros/tabela-membros";
import { DialogoConfirmacao } from "@/components/shared/dialogo-confirmacao";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chaves, useEntidades, useEquipes, useMembros } from "@/hooks/use-dados";
import { atualizarMembro, criarMembro, removerMembro, type MembroEntrada } from "@/lib/api";
import type { Membro } from "@/lib/domain";

const TODAS = "todas";

export function PainelMembros() {
  const queryClient = useQueryClient();
  const { data: entidades } = useEntidades();
  const { data: equipes } = useEquipes();
  const { data: membros } = useMembros();

  const [filtroEntidade, setFiltroEntidade] = useState(TODAS);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Membro | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Membro | null>(null);

  const lista = useMemo(
    () =>
      (membros ?? []).filter(
        (membro) => filtroEntidade === TODAS || membro.entidade_id === filtroEntidade,
      ),
    [membros, filtroEntidade],
  );

  const invalidar = () => void queryClient.invalidateQueries({ queryKey: chaves.membros });

  const salvar = useMutation({
    mutationFn: async ({ dados, id }: { dados: MembroEntrada; id?: string }) => {
      if (id) await atualizarMembro(id, dados);
      else await criarMembro(dados);
    },
    onSuccess: invalidar,
    onError: (erro: Error) => toast.error(erro.message),
  });

  const excluir = useMutation({
    mutationFn: (id: string) => removerMembro(id),
    onSuccess: () => {
      invalidar();
      setParaExcluir(null);
      toast.success("Membro removido.");
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Todos os membros</CardTitle>
              <CardDescription>
                Visão geral dos cursos e universidades das entidades acadêmicas.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={filtroEntidade} onValueChange={setFiltroEntidade}>
                <SelectTrigger className="sm:w-56">
                  <SelectValue placeholder="Entidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODAS}>Todas as entidades</SelectItem>
                  {(entidades ?? []).map((entidade) => (
                    <SelectItem key={entidade.id} value={entidade.id}>
                      {entidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={() => {
                  setEmEdicao(null);
                  setDialogoAberto(true);
                }}
              >
                <Plus />
                Novo membro
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <TabelaMembros
            membros={lista}
            equipes={equipes ?? []}
            entidades={entidades ?? []}
            aoEditar={(membro) => {
              setEmEdicao(membro);
              setDialogoAberto(true);
            }}
            aoExcluir={setParaExcluir}
            aoCriar={() => {
              setEmEdicao(null);
              setDialogoAberto(true);
            }}
          />
        </CardContent>
      </Card>

      <DialogoMembro
        aberto={dialogoAberto}
        aoMudarAberto={setDialogoAberto}
        membro={emEdicao}
        entidades={entidades ?? []}
        equipes={equipes ?? []}
        aoSalvar={async (dados, id) => {
          await salvar.mutateAsync({ dados, id });
        }}
      />

      <DialogoConfirmacao
        aberto={Boolean(paraExcluir)}
        aoMudarAberto={(aberto) => !aberto && setParaExcluir(null)}
        titulo="Remover membro"
        descricao={
          <>
            O membro <strong className="text-foreground">{paraExcluir?.nome}</strong> será removido
            definitivamente.
          </>
        }
        textoConfirmar="Remover"
        onConfirmar={() => paraExcluir && excluir.mutate(paraExcluir.id)}
        carregando={excluir.isPending}
      />
    </div>
  );
}
