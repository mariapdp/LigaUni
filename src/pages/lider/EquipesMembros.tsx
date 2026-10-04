import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import { toast } from "sonner";

import { DialogoEquipe } from "@/components/equipes/dialogo-equipe";
import { DialogoMembro } from "@/components/equipes/dialogo-membro";
import { TabelaMembros } from "@/components/membros/tabela-membros";
import { CabecalhoPagina } from "@/components/shared/cabecalho-pagina";
import { DialogoConfirmacao } from "@/components/shared/dialogo-confirmacao";
import { EstadoVazio } from "@/components/shared/estado-vazio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAutenticacao } from "@/hooks/use-auth";
import { chaves, useEquipes, useMembros } from "@/hooks/use-dados";
import {
  atualizarEquipe,
  atualizarMembro,
  criarEquipe,
  criarMembro,
  removerEquipe,
  removerMembro,
  type MembroEntrada,
} from "@/lib/api";
import type { Equipe, Membro } from "@/lib/domain";

export default function EquipesMembros() {
  const { entidadeId } = useAutenticacao();
  const queryClient = useQueryClient();

  const { data: equipes } = useEquipes();
  const { data: membros } = useMembros();

  const [dialogoEquipe, setDialogoEquipe] = useState(false);
  const [equipeEmEdicao, setEquipeEmEdicao] = useState<Equipe | null>(null);
  const [equipeParaExcluir, setEquipeParaExcluir] = useState<Equipe | null>(null);

  const [dialogoMembro, setDialogoMembro] = useState(false);
  const [membroEmEdicao, setMembroEmEdicao] = useState<Membro | null>(null);
  const [membroParaExcluir, setMembroParaExcluir] = useState<Membro | null>(null);

  const listaEquipes = equipes ?? [];
  const listaMembros = membros ?? [];

  const invalidar = () => {
    void queryClient.invalidateQueries({ queryKey: chaves.equipes });
    void queryClient.invalidateQueries({ queryKey: chaves.membros });
  };

  const salvarEquipe = useMutation({
    mutationFn: async ({ nome, id }: { nome: string; id?: string }) => {
      if (id) await atualizarEquipe(id, nome);
      else await criarEquipe({ entidade_id: entidadeId!, nome });
    },
    onSuccess: invalidar,
    onError: (erro: Error) => toast.error(erro.message),
  });

  const excluirEquipe = useMutation({
    mutationFn: (id: string) => removerEquipe(id),
    onSuccess: () => {
      invalidar();
      setEquipeParaExcluir(null);
      toast.success("Equipe removida.");
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  const salvarMembro = useMutation({
    mutationFn: async ({ dados, id }: { dados: MembroEntrada; id?: string }) => {
      if (id) await atualizarMembro(id, dados);
      else await criarMembro(dados);
    },
    onSuccess: invalidar,
    onError: (erro: Error) => toast.error(erro.message),
  });

  const excluirMembro = useMutation({
    mutationFn: (id: string) => removerMembro(id),
    onSuccess: () => {
      invalidar();
      setMembroParaExcluir(null);
      toast.success("Membro removido.");
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  if (!entidadeId) {
    return (
      <div className="flex flex-col gap-6">
        <CabecalhoPagina titulo="Equipes e membros" />
        <Card>
          <EstadoVazio
            icone={UsersRound}
            titulo="Sem entidade vinculada"
            descricao="Sua conta ainda não está ligada a uma entidade. Fale com a administração."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <CabecalhoPagina
        titulo="Equipes e membros"
        descricao="Organize os times da entidade e mantenha o cadastro acadêmico atualizado."
        acoes={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEquipeEmEdicao(null);
                setDialogoEquipe(true);
              }}
            >
              <Plus />
              Nova equipe
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setMembroEmEdicao(null);
                setDialogoMembro(true);
              }}
            >
              <Plus />
              Novo membro
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Equipes</CardTitle>
          <CardDescription>
            {listaEquipes.length === 0
              ? "Nenhuma equipe cadastrada."
              : `${listaEquipes.length} ${
                  listaEquipes.length === 1 ? "equipe" : "equipes"
                } na entidade.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listaEquipes.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-[13px] text-muted-foreground">
              Crie equipes para agrupar membros por frente de trabalho.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {listaEquipes.map((equipe) => {
                const total = listaMembros.filter((m) => m.equipe_id === equipe.id).length;
                return (
                  <div
                    key={equipe.id}
                    className="flex items-center gap-2 rounded-md border border-border bg-background/50 py-1.5 pl-3 pr-1.5"
                  >
                    <span className="text-[13px] font-medium text-foreground">{equipe.nome}</span>
                    <Badge variant="neutro">{total}</Badge>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Editar ${equipe.nome}`}
                      onClick={() => {
                        setEquipeEmEdicao(equipe);
                        setDialogoEquipe(true);
                      }}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remover ${equipe.nome}`}
                      className="hover:text-destructive"
                      onClick={() => setEquipeParaExcluir(equipe)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membros</CardTitle>
          <CardDescription>
            Busque e filtre por equipe, curso ou universidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TabelaMembros
            membros={listaMembros}
            equipes={listaEquipes}
            aoEditar={(membro) => {
              setMembroEmEdicao(membro);
              setDialogoMembro(true);
            }}
            aoExcluir={setMembroParaExcluir}
            aoCriar={() => {
              setMembroEmEdicao(null);
              setDialogoMembro(true);
            }}
          />
        </CardContent>
      </Card>

      <DialogoEquipe
        aberto={dialogoEquipe}
        aoMudarAberto={setDialogoEquipe}
        equipe={equipeEmEdicao}
        aoSalvar={async (nome, id) => {
          await salvarEquipe.mutateAsync({ nome, id });
        }}
      />

      <DialogoMembro
        aberto={dialogoMembro}
        aoMudarAberto={setDialogoMembro}
        membro={membroEmEdicao}
        entidadeId={entidadeId}
        equipes={listaEquipes}
        aoSalvar={async (dados, id) => {
          await salvarMembro.mutateAsync({ dados, id });
        }}
      />

      <DialogoConfirmacao
        aberto={Boolean(equipeParaExcluir)}
        aoMudarAberto={(aberto) => !aberto && setEquipeParaExcluir(null)}
        titulo="Remover equipe"
        descricao={
          <>
            A equipe <strong className="text-foreground">{equipeParaExcluir?.nome}</strong> será
            removida. Os membros permanecem na entidade, mas ficam sem equipe.
          </>
        }
        textoConfirmar="Remover"
        onConfirmar={() => equipeParaExcluir && excluirEquipe.mutate(equipeParaExcluir.id)}
        carregando={excluirEquipe.isPending}
      />

      <DialogoConfirmacao
        aberto={Boolean(membroParaExcluir)}
        aoMudarAberto={(aberto) => !aberto && setMembroParaExcluir(null)}
        titulo="Remover membro"
        descricao={
          <>
            O membro <strong className="text-foreground">{membroParaExcluir?.nome}</strong> será
            removido definitivamente da entidade.
          </>
        }
        textoConfirmar="Remover"
        onConfirmar={() => membroParaExcluir && excluirMembro.mutate(membroParaExcluir.id)}
        carregando={excluirMembro.isPending}
      />
    </div>
  );
}
