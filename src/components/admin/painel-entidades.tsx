import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import { toast } from "sonner";

import { DialogoEntidade } from "@/components/admin/dialogo-entidade";
import { DialogoConfirmacao } from "@/components/shared/dialogo-confirmacao";
import { EstadoVazio } from "@/components/shared/estado-vazio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { chaves, useEntidades, useEquipes, useMembros } from "@/hooks/use-dados";
import {
  atualizarEntidade,
  criarEntidade,
  removerEntidade,
} from "@/lib/api";
import { comAlfa, type Entidade } from "@/lib/domain";

export function PainelEntidades() {
  const queryClient = useQueryClient();
  const { data: entidades } = useEntidades();
  const { data: membros } = useMembros();
  const { data: equipes } = useEquipes();

  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Entidade | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Entidade | null>(null);

  const lista = entidades ?? [];

  const invalidar = () => {
    void queryClient.invalidateQueries({ queryKey: chaves.entidades });
    void queryClient.invalidateQueries({ queryKey: chaves.membros });
    void queryClient.invalidateQueries({ queryKey: chaves.equipes });
  };

  const salvar = useMutation({
    mutationFn: async ({
      dados,
      id,
    }: {
      dados: { nome: string; descricao: string | null; cor: string };
      id?: string;
    }) => {
      if (id) await atualizarEntidade(id, dados);
      else await criarEntidade(dados);
    },
    onSuccess: invalidar,
    onError: (erro: Error) => toast.error(erro.message),
  });

  const excluir = useMutation({
    mutationFn: (id: string) => removerEntidade(id),
    onSuccess: () => {
      invalidar();
      setParaExcluir(null);
      toast.success("Entidade removida.");
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  const contagem = useMemo(() => {
    const mapa = new Map<string, { membros: number; equipes: number }>();
    for (const membro of membros ?? []) {
      const atual = mapa.get(membro.entidade_id) ?? { membros: 0, equipes: 0 };
      atual.membros += 1;
      mapa.set(membro.entidade_id, atual);
    }
    for (const equipe of equipes ?? []) {
      const atual = mapa.get(equipe.entidade_id) ?? { membros: 0, equipes: 0 };
      atual.equipes += 1;
      mapa.set(equipe.entidade_id, atual);
    }
    return mapa;
  }, [membros, equipes]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Entidades cadastradas
          </h2>
          <p className="text-[13px] text-muted-foreground">
            {lista.length} {lista.length === 1 ? "entidade" : "entidades"} com cor própria no
            calendário.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEmEdicao(null);
            setDialogoAberto(true);
          }}
        >
          <Plus />
          Nova entidade
        </Button>
      </div>

      {lista.length === 0 ? (
        <Card>
          <EstadoVazio
            icone={UsersRound}
            titulo="Nenhuma entidade cadastrada"
            descricao="Cadastre as entidades acadêmicas para que os líderes possam se vincular."
            acao={
              <Button size="sm" onClick={() => setDialogoAberto(true)}>
                <Plus />
                Cadastrar entidade
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((entidade) => {
            const dados = contagem.get(entidade.id) ?? { membros: 0, equipes: 0 };
            return (
              <Card
                key={entidade.id}
                className="relative flex flex-col overflow-hidden transition-[transform,border-color] duration-200 hover:-translate-y-0.5"
              >
                <span
                  className="absolute inset-x-0 top-0 h-0.5"
                  style={{ backgroundColor: entidade.cor }}
                  aria-hidden="true"
                />
                <CardHeader className="gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="grid size-9 shrink-0 place-items-center rounded-md font-display text-[11px] font-bold"
                        style={{
                          backgroundColor: comAlfa(entidade.cor, 0.16),
                          color: entidade.cor,
                          boxShadow: `inset 0 0 0 1px ${comAlfa(entidade.cor, 0.4)}`,
                        }}
                      >
                        {entidade.nome.slice(0, 2).toUpperCase()}
                      </span>
                      <CardTitle className="text-[15px] leading-tight">{entidade.nome}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar ${entidade.nome}`}
                        onClick={() => {
                          setEmEdicao(entidade);
                          setDialogoAberto(true);
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remover ${entidade.nome}`}
                        className="hover:text-destructive"
                        onClick={() => setParaExcluir(entidade)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  <CardDescription className="line-clamp-3">
                    {entidade.descricao ?? "Sem descrição cadastrada."}
                  </CardDescription>
                  <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <Badge variant="neutro">{dados.membros} membros</Badge>
                    <Badge variant="neutro">{dados.equipes} equipes</Badge>
                    <span className="ml-auto text-[11px] font-medium text-muted-foreground">
                      {entidade.cor}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <DialogoEntidade
        aberto={dialogoAberto}
        aoMudarAberto={setDialogoAberto}
        entidade={emEdicao}
        aoSalvar={async (dados, id) => {
          await salvar.mutateAsync({ dados, id });
        }}
      />

      <DialogoConfirmacao
        aberto={Boolean(paraExcluir)}
        aoMudarAberto={(aberto) => !aberto && setParaExcluir(null)}
        titulo="Remover entidade"
        descricao={
          <>
            A entidade <strong className="text-foreground">{paraExcluir?.nome}</strong> será
            removida junto com seus membros, equipes, eventos e reservas. Esta ação não pode ser
            desfeita.
          </>
        }
        textoConfirmar="Remover entidade"
        onConfirmar={() => paraExcluir && excluir.mutate(paraExcluir.id)}
        carregando={excluir.isPending}
      />
    </div>
  );
}
