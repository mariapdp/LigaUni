import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  ClipboardList,
  History,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { DialogoRecusa } from "@/components/admin/dialogo-recusa";
import { CabecalhoPagina } from "@/components/shared/cabecalho-pagina";
import { EstadoVazio } from "@/components/shared/estado-vazio";
import { EtiquetaEntidade } from "@/components/shared/ponto-entidade";
import { StatusReservaBadge } from "@/components/shared/status-reserva-badge";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { chaves, useEntidades, useReservasDetalhadas, useSalas } from "@/hooks/use-dados";
import { definirStatusReserva } from "@/lib/api";
import type { ReservaDetalhada } from "@/lib/domain";
import { formatarData, formatarIntervalo } from "@/lib/format";
import { reservasEmConflito } from "@/lib/reservas";

const TODOS = "todos";

export default function AdminReservas() {
  const queryClient = useQueryClient();
  const { dados: reservas, carregando } = useReservasDetalhadas();
  const { data: salas } = useSalas();
  const { data: entidades } = useEntidades();

  const [aba, setAba] = useState("pendentes");
  const [reservaParaRecusar, setReservaParaRecusar] = useState<ReservaDetalhada | null>(null);
  const [aprovandoId, setAprovandoId] = useState<string | null>(null);

  const [filtroStatus, setFiltroStatus] = useState(TODOS);
  const [filtroSala, setFiltroSala] = useState(TODOS);
  const [filtroEntidade, setFiltroEntidade] = useState(TODOS);

  const invalidar = () => void queryClient.invalidateQueries({ queryKey: chaves.reservas });

  const aprovar = useMutation({
    mutationFn: (id: string) => definirStatusReserva(id, "aprovada", null),
    onSuccess: () => {
      invalidar();
      toast.success("Reserva aprovada.");
    },
    onError: (erro: Error) => toast.error(erro.message),
    onSettled: () => setAprovandoId(null),
  });

  const recusar = useMutation({
    mutationFn: ({ id, justificativa }: { id: string; justificativa: string }) =>
      definirStatusReserva(id, "recusada", justificativa),
    onSuccess: () => {
      invalidar();
      setReservaParaRecusar(null);
      toast.success("Reserva recusada com justificativa.");
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  const pendentes = useMemo(
    () =>
      reservas
        .filter((reserva) => reserva.status === "pendente")
        .sort((a, b) => a.data.localeCompare(b.data)),
    [reservas],
  );

  const historico = useMemo(
    () =>
      reservas
        .filter((reserva) => reserva.status !== "pendente")
        .filter((reserva) => filtroStatus === TODOS || reserva.status === filtroStatus)
        .filter((reserva) => filtroSala === TODOS || reserva.sala_id === filtroSala)
        .filter((reserva) => filtroEntidade === TODOS || reserva.entidade_id === filtroEntidade)
        .sort((a, b) => b.data.localeCompare(a.data)),
    [reservas, filtroStatus, filtroSala, filtroEntidade],
  );

  const conflitosDe = (reserva: ReservaDetalhada) =>
    reservasEmConflito(reservas, reserva);

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <CabecalhoPagina
        titulo="Reservas de sala"
        descricao="Analise as solicitações pendentes e consulte o histórico das salas do Ágora."
      />

      <Tabs value={aba} onValueChange={setAba} className="flex flex-col gap-5">
        <TabsList className="w-full justify-start border border-border bg-card p-1 sm:w-auto">
          <TabsTrigger value="pendentes" className="gap-2">
            <ClipboardList className="size-4" />
            Pendentes
            {pendentes.length > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                {pendentes.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <History className="size-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="mt-0">
          {pendentes.length === 0 ? (
            <Card>
              <EstadoVazio
                icone={ClipboardList}
                titulo="Nenhuma solicitação pendente"
                descricao="Quando uma entidade solicitar uma sala do Ágora, ela aparece aqui para análise."
              />
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {pendentes.map((reserva) => {
                const conflitos = conflitosDe(reserva);
                const temConflito = conflitos.length > 0;
                return (
                  <Card key={reserva.id} className="relative overflow-hidden">
                    <span
                      className="absolute inset-y-0 left-0 w-1"
                      style={{ backgroundColor: reserva.entidadeCor }}
                      aria-hidden="true"
                    />
                    <CardContent className="flex flex-col gap-4 p-5 pl-6 sm:p-6 sm:pl-7">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <h3 className="font-display text-base font-semibold text-foreground">
                            {reserva.salaNome}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground">
                            <span className="tabular">{formatarData(reserva.data)}</span>
                            <span className="tabular">
                              {formatarIntervalo(reserva.hora_inicio, reserva.hora_fim)}
                            </span>
                            <span>
                              Capacidade {reserva.salaCapacidade} · Solicitante{" "}
                              {reserva.solicitanteNome ?? "—"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <StatusReservaBadge status={reserva.status} />
                          <EtiquetaEntidade
                            cor={reserva.entidadeCor}
                            nome={reserva.entidadeNome}
                          />
                        </div>
                      </div>

                      <p className="rounded-md border border-border bg-background/40 px-3 py-2 text-[13px] leading-relaxed text-foreground">
                        {reserva.finalidade}
                      </p>

                      {temConflito && (
                        <p className="flex items-start gap-2 rounded-md border border-warning/35 bg-warning/10 px-3 py-2 text-[12.5px] leading-relaxed text-warning">
                          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                          <span>
                            Conflito de horário: já existe reserva aprovada em{" "}
                            <strong className="font-semibold">{reserva.salaNome}</strong> em{" "}
                            {formatarData(conflitos[0].data)} das{" "}
                            {formatarIntervalo(conflitos[0].hora_inicio, conflitos[0].hora_fim)}. A
                            aprovação é bloqueada — recuse ou peça outro horário à entidade.
                          </span>
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          disabled={temConflito || aprovandoId === reserva.id}
                          title={
                            temConflito
                              ? "Existe conflito de horário nesta sala"
                              : "Aprovar a reserva"
                          }
                          onClick={() => {
                            setAprovandoId(reserva.id);
                            aprovar.mutate(reserva.id);
                          }}
                        >
                          {aprovandoId === reserva.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Check />
                          )}
                          Aprovar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReservaParaRecusar(reserva)}
                        >
                          <X />
                          Recusar
                        </Button>
                        <Badge variant="neutro" className="ml-auto">
                          Solicitada em {formatarData(reserva.criado_em.slice(0, 10))}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="historico" className="mt-0">
          <Card>
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle>Histórico de decisões</CardTitle>
                <CardDescription>
                  {carregando
                    ? "Carregando reservas…"
                    : `${historico.length} ${
                        historico.length === 1 ? "reserva" : "reservas"
                      } com decisão registrada.`}
                </CardDescription>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TODOS}>Todos os status</SelectItem>
                    <SelectItem value="aprovada">Aprovadas</SelectItem>
                    <SelectItem value="recusada">Recusadas</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filtroSala} onValueChange={setFiltroSala}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sala" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TODOS}>Todas as salas</SelectItem>
                    {(salas ?? []).map((sala) => (
                      <SelectItem key={sala.id} value={sala.id}>
                        {sala.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filtroEntidade} onValueChange={setFiltroEntidade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Entidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TODOS}>Todas as entidades</SelectItem>
                    {(entidades ?? []).map((entidade) => (
                      <SelectItem key={entidade.id} value={entidade.id}>
                        {entidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="p-0 sm:p-0">
              {historico.length === 0 ? (
                <EstadoVazio
                  icone={History}
                  titulo="Nenhum registro"
                  descricao="Ajuste os filtros para encontrar reservas com decisão registrada."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Sala</TableHead>
                        <TableHead>Entidade</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Horário</TableHead>
                        <TableHead className="min-w-[200px]">Finalidade</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historico.map((reserva) => (
                        <TableRow key={reserva.id} className="border-border/70 align-top">
                          <TableCell className="font-medium text-foreground">
                            {reserva.salaNome}
                          </TableCell>
                          <TableCell>
                            <EtiquetaEntidade
                              cor={reserva.entidadeCor}
                              nome={reserva.entidadeNome}
                            />
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
                              <p className="mt-1.5 text-[12px] leading-relaxed text-[hsl(0_84%_72%)]">
                                <strong className="font-semibold">Justificativa:</strong>{" "}
                                {reserva.justificativa_admin}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusReservaBadge status={reserva.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DialogoRecusa
        aberto={Boolean(reservaParaRecusar)}
        aoMudarAberto={(aberto) => !aberto && setReservaParaRecusar(null)}
        reserva={reservaParaRecusar}
        carregando={recusar.isPending}
        onConfirmar={(justificativa) =>
          reservaParaRecusar &&
          recusar.mutate({ id: reservaParaRecusar.id, justificativa })
        }
      />
    </div>
  );
}
