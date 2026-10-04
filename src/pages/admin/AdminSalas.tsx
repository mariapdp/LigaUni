import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DoorOpen, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { DialogoSala } from "@/components/admin/dialogo-sala";
import { CabecalhoPagina } from "@/components/shared/cabecalho-pagina";
import { DialogoConfirmacao } from "@/components/shared/dialogo-confirmacao";
import { EstadoVazio } from "@/components/shared/estado-vazio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { chaves, useReservas, useSalas } from "@/hooks/use-dados";
import { atualizarSala, criarSala, removerSala } from "@/lib/api";
import type { Sala } from "@/lib/domain";

export default function AdminSalas() {
  const queryClient = useQueryClient();
  const { data: salas } = useSalas();
  const { data: reservas } = useReservas();

  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [salaEmEdicao, setSalaEmEdicao] = useState<Sala | null>(null);
  const [salaParaExcluir, setSalaParaExcluir] = useState<Sala | null>(null);

  const lista = salas ?? [];

  const invalidar = () => void queryClient.invalidateQueries({ queryKey: chaves.salas });

  const salvar = useMutation({
    mutationFn: async ({
      dados,
      id,
    }: {
      dados: { nome: string; capacidade: number; recursos: string | null; ativa: boolean };
      id?: string;
    }) => {
      if (id) await atualizarSala(id, dados);
      else await criarSala(dados);
    },
    onSuccess: invalidar,
    onError: (erro: Error) => toast.error(erro.message),
  });

  const alternarAtiva = useMutation({
    mutationFn: ({ id, ativa }: { id: string; ativa: boolean }) => atualizarSala(id, { ativa }),
    onSuccess: invalidar,
    onError: (erro: Error) => toast.error(erro.message),
  });

  const excluir = useMutation({
    mutationFn: (id: string) => removerSala(id),
    onSuccess: () => {
      invalidar();
      void queryClient.invalidateQueries({ queryKey: chaves.reservas });
      setSalaParaExcluir(null);
      toast.success("Sala removida.");
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  const reservasDaSala = (salaId: string) =>
    (reservas ?? []).filter((reserva) => reserva.sala_id === salaId).length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <CabecalhoPagina
        titulo="Salas do Ágora"
        descricao="Cadastre, edite e desative as salas disponíveis para reserva."
        acoes={
          <Button
            size="sm"
            onClick={() => {
              setSalaEmEdicao(null);
              setDialogoAberto(true);
            }}
          >
            <Plus />
            Nova sala
          </Button>
        }
      />

      {lista.length === 0 ? (
        <Card>
          <EstadoVazio
            icone={DoorOpen}
            titulo="Nenhuma sala cadastrada"
            descricao="Cadastre as salas do Ágora para que as entidades possam solicitar reservas."
            acao={
              <Button size="sm" onClick={() => setDialogoAberto(true)}>
                <Plus />
                Cadastrar primeira sala
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((sala) => (
            <Card
              key={sala.id}
              className="flex flex-col transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/35"
            >
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1.5">
                    <CardTitle className="text-[15px]">{sala.nome}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="brand">
                        <Users className="size-3" />
                        {sala.capacidade} lugares
                      </Badge>
                      <Badge variant={sala.ativa ? "aprovada" : "neutro"}>
                        {sala.ativa ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Editar ${sala.nome}`}
                      onClick={() => {
                        setSalaEmEdicao(sala);
                        setDialogoAberto(true);
                      }}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remover ${sala.nome}`}
                      className="hover:text-destructive"
                      onClick={() => setSalaParaExcluir(sala)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {(sala.recursos ?? "")
                    .split(",")
                    .map((recurso) => recurso.trim())
                    .filter(Boolean)
                    .map((recurso) => (
                      <span
                        key={recurso}
                        className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {recurso}
                      </span>
                    ))}
                  {!sala.recursos && (
                    <span className="text-[12px] text-muted-foreground">
                      Nenhum recurso informado.
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
                  <Label
                    htmlFor={`ativa-${sala.id}`}
                    className="text-[12px] font-medium text-muted-foreground"
                  >
                    Disponível para reservas
                  </Label>
                  <Switch
                    id={`ativa-${sala.id}`}
                    checked={sala.ativa}
                    onCheckedChange={(valor) =>
                      alternarAtiva.mutate({ id: sala.id, ativa: valor })
                    }
                  />
                </div>

                <CardDescription className="text-[11px]">
                  {reservasDaSala(sala.id)}{" "}
                  {reservasDaSala(sala.id) === 1 ? "reserva registrada" : "reservas registradas"}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DialogoSala
        aberto={dialogoAberto}
        aoMudarAberto={setDialogoAberto}
        sala={salaEmEdicao}
        aoSalvar={async (dados, id) => {
          await salvar.mutateAsync({ dados, id });
        }}
      />

      <DialogoConfirmacao
        aberto={Boolean(salaParaExcluir)}
        aoMudarAberto={(aberto) => !aberto && setSalaParaExcluir(null)}
        titulo="Remover sala"
        descricao={
          <>
            A sala <strong className="text-foreground">{salaParaExcluir?.nome}</strong> e todas as
            reservas vinculadas a ela serão removidas. Para apenas suspendê-la, desative a sala.
          </>
        }
        textoConfirmar="Remover sala"
        onConfirmar={() => salaParaExcluir && excluir.mutate(salaParaExcluir.id)}
        carregando={excluir.isPending}
      />
    </div>
  );
}
