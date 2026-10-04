import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, ClipboardList, Info, Trash2, UsersRound } from "lucide-react";
import { toast } from "sonner";

import { DialogoReserva } from "@/components/reservas/dialogo-reserva";
import { CabecalhoPagina } from "@/components/shared/cabecalho-pagina";
import { CartaoIndicador } from "@/components/shared/cartao-indicador";
import { DialogoConfirmacao } from "@/components/shared/dialogo-confirmacao";
import { EstadoVazio } from "@/components/shared/estado-vazio";
import { StatusReservaBadge } from "@/components/shared/status-reserva-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAutenticacao } from "@/hooks/use-auth";
import { chaves, useReservas, useSalas } from "@/hooks/use-dados";
import { criarReserva, removerReserva, type ReservaEntrada } from "@/lib/api";
import { formatarData, formatarIntervalo } from "@/lib/format";

const TODOS = "todos";

export default function LiderReservas() {
  const { entidadeId, usuario } = useAutenticacao();
  const queryClient = useQueryClient();

  const { data: reservas } = useReservas();
  const { data: salas } = useSalas();

  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>(TODOS);
  const [reservaParaCancelar, setReservaParaCancelar] = useState<string | null>(null);

  const lista = useMemo(() => reservas ?? [], [reservas]);

  const nomeSala = (id: string) => salas?.find((sala) => sala.id === id)?.nome ?? "Sala removida";

  const filtradas = useMemo(
    () =>
      [...lista]
        .filter((reserva) => filtroStatus === TODOS || reserva.status === filtroStatus)
        .sort((a, b) => b.data.localeCompare(a.data)),
    [lista, filtroStatus],
  );

  const invalidar = () => void queryClient.invalidateQueries({ queryKey: chaves.reservas });

  const solicitar = useMutation({
    mutationFn: (dados: ReservaEntrada) => criarReserva(dados),
    onSuccess: invalidar,
    onError: (erro: Error) => toast.error(erro.message),
  });

  const cancelar = useMutation({
    mutationFn: (id: string) => removerReserva(id),
    onSuccess: () => {
      invalidar();
      setReservaParaCancelar(null);
      toast.success("Solicitação cancelada.");
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  const contagem = {
    pendente: lista.filter((r) => r.status === "pendente").length,
    aprovada: lista.filter((r) => r.status === "aprovada").length,
    recusada: lista.filter((r) => r.status === "recusada").length,
  };

  const semSalasAtivas = (salas ?? []).filter((sala) => sala.ativa).length === 0;

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <CabecalhoPagina
        titulo="Reservas de sala"
        descricao="Solicite salas do Ágora e acompanhe a análise da administração."
        acoes={
          <Button size="sm" onClick={() => setDialogoAberto(true)} disabled={semSalasAtivas}>
            <CalendarPlus />
            Solicitar sala
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <CartaoIndicador rotulo="Pendentes" valor={contagem.pendente} icone={ClipboardList} destaque />
        <CartaoIndicador rotulo="Aprovadas" valor={contagem.aprovada} icone={ClipboardList} />
        <CartaoIndicador rotulo="Recusadas" valor={contagem.recusada} icone={ClipboardList} />
      </div>

      {semSalasAtivas && (
        <p className="flex items-center gap-2 rounded-md border border-warning/35 bg-warning/10 px-3 py-2 text-[13px] text-warning">
          <Info className="size-4 shrink-0" />
          Nenhuma sala está ativa no momento. Fale com a administração da Liga UNI.
        </p>
      )}

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Minhas solicitações</CardTitle>
              <CardDescription>
                {filtradas.length} de {lista.length} solicitações exibidas.
              </CardDescription>
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos os status</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="aprovada">Aprovadas</SelectItem>
                <SelectItem value="recusada">Recusadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-0">
          {filtradas.length === 0 ? (
            <EstadoVazio
              icone={UsersRound}
              titulo={lista.length === 0 ? "Nenhuma reserva ainda" : "Nada nesse status"}
              descricao={
                lista.length === 0
                  ? "Solicite uma sala do Ágora para reuniões, ensaios e eventos da entidade."
                  : "Troque o filtro de status para ver outras solicitações."
              }
              acao={
                lista.length === 0 ? (
                  <Button
                    size="sm"
                    onClick={() => setDialogoAberto(true)}
                    disabled={semSalasAtivas}
                  >
                    <CalendarPlus />
                    Solicitar sala
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setFiltroStatus(TODOS)}>
                    Ver todas
                  </Button>
                )
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Sala</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead className="min-w-[220px]">Finalidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtradas.map((reserva) => (
                    <TableRow key={reserva.id} className="border-border/70 align-top">
                      <TableCell className="font-medium text-foreground">
                        {nomeSala(reserva.sala_id)}
                      </TableCell>
                      <TableCell className="tabular text-muted-foreground">
                        {formatarData(reserva.data)}
                      </TableCell>
                      <TableCell className="tabular text-muted-foreground">
                        {formatarIntervalo(reserva.hora_inicio, reserva.hora_fim)}
                      </TableCell>
                      <TableCell>
                        <p className="text-[13px] text-foreground">{reserva.finalidade}</p>
                        {reserva.status === "recusada" && reserva.justificativa_admin && (
                          <p className="mt-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-[12px] leading-relaxed text-[hsl(0_84%_72%)]">
                            <strong className="font-semibold">Justificativa:</strong>{" "}
                            {reserva.justificativa_admin}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusReservaBadge status={reserva.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {reserva.status === "pendente" && reserva.solicitante_id === usuario?.id && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Cancelar solicitação"
                            className="hover:text-destructive"
                            onClick={() => setReservaParaCancelar(reserva.id)}
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <DialogoReserva
        aberto={dialogoAberto}
        aoMudarAberto={setDialogoAberto}
        salas={salas ?? []}
        reservas={lista}
        entidadeId={entidadeId ?? ""}
        solicitanteId={usuario?.id ?? ""}
        aoSalvar={async (dados) => {
          await solicitar.mutateAsync(dados);
        }}
      />

      <DialogoConfirmacao
        aberto={Boolean(reservaParaCancelar)}
        aoMudarAberto={(aberto) => !aberto && setReservaParaCancelar(null)}
        titulo="Cancelar solicitação"
        descricao="A solicitação pendente será removida. Você pode enviar uma nova depois."
        textoConfirmar="Cancelar solicitação"
        textoCancelar="Manter"
        onConfirmar={() => reservaParaCancelar && cancelar.mutate(reservaParaCancelar)}
        carregando={cancelar.isPending}
      />
    </div>
  );
}
