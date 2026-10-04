import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  ClipboardList,
  Clock,
  DoorOpen,
  MapPin,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import { CabecalhoPagina } from "@/components/shared/cabecalho-pagina";
import { CartaoIndicador } from "@/components/shared/cartao-indicador";
import { EstadoVazio } from "@/components/shared/estado-vazio";
import { PontoEntidade } from "@/components/shared/ponto-entidade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  chaves,
  useEntidades,
  useEventosDetalhados,
  useMembros,
  useReservasDetalhadas,
  useSalas,
} from "@/hooks/use-dados";
import { formatarData, formatarIntervalo, hojeISO } from "@/lib/format";

export default function AdminDashboard() {
  const { data: entidades } = useEntidades();
  const { data: membros } = useMembros();
  const { data: salas } = useSalas();
  const { dados: reservas } = useReservasDetalhadas();
  const { dados: eventos } = useEventosDetalhados();

  const pendentes = useMemo(
    () =>
      reservas
        .filter((reserva) => reserva.status === "pendente")
        .sort((a, b) => a.data.localeCompare(b.data)),
    [reservas],
  );

  const proximosEventos = useMemo(
    () =>
      eventos
        .filter((evento) => evento.data >= hojeISO())
        .sort((a, b) => a.data.localeCompare(b.data))
        .slice(0, 6),
    [eventos],
  );

  const rankingEntidades = useMemo(() => {
    const contagem = new Map<string, number>();
    for (const membro of membros ?? []) {
      contagem.set(membro.entidade_id, (contagem.get(membro.entidade_id) ?? 0) + 1);
    }
    const maximo = Math.max(1, ...Array.from(contagem.values()));
    return (entidades ?? [])
      .map((entidade) => ({
        entidade,
        total: contagem.get(entidade.id) ?? 0,
        percentual: Math.round(((contagem.get(entidade.id) ?? 0) / maximo) * 100),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [entidades, membros]);

  const salasAtivas = (salas ?? []).filter((sala) => sala.ativa).length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <CabecalhoPagina
        titulo="Dashboard da Liga UNI"
        descricao="Panorama geral das entidades, do calendário e das reservas das salas do Ágora."
        acoes={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/calendario">
                <CalendarDays />
                Calendário geral
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/admin/reservas">
                <ClipboardList />
                Fila de reservas
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CartaoIndicador
          rotulo="Entidades"
          valor={entidades?.length ?? 0}
          icone={Building2}
          descricao="Cadastradas na plataforma"
          destaque
        />
        <CartaoIndicador
          rotulo="Membros"
          valor={membros?.length ?? 0}
          icone={UsersRound}
          descricao="Somando todas as entidades"
        />
        <CartaoIndicador
          rotulo="Reservas pendentes"
          valor={pendentes.length}
          icone={Clock}
          descricao="Aguardando decisão"
        />
        <CartaoIndicador
          rotulo="Salas ativas"
          valor={`${salasAtivas}/${salas?.length ?? 0}`}
          icone={DoorOpen}
          descricao="Disponíveis no Ágora"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle>Solicitações pendentes</CardTitle>
              <CardDescription>
                {pendentes.length === 0
                  ? "Nenhuma solicitação aguardando análise."
                  : `${pendentes.length} ${
                      pendentes.length === 1 ? "solicitação aguarda" : "solicitações aguardam"
                    } análise.`}
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/reservas">Analisar</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendentes.length === 0 ? (
              <EstadoVazio
                icone={ClipboardList}
                titulo="Fila limpa"
                descricao="Todas as solicitações de sala já foram analisadas."
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {pendentes.slice(0, 5).map((reserva) => (
                  <li
                    key={reserva.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background/40 p-3"
                    style={{ borderLeftWidth: 3, borderLeftColor: reserva.entidadeCor }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-foreground">
                        {reserva.salaNome}
                      </p>
                      <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                        {reserva.finalidade}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[12px] tabular text-muted-foreground">
                        {formatarData(reserva.data)} ·{" "}
                        {formatarIntervalo(reserva.hora_inicio, reserva.hora_fim)}
                      </span>
                      <PontoEntidade cor={reserva.entidadeCor} nome={reserva.entidadeNome} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Entidades com mais membros
            </CardTitle>
            <CardDescription>Distribuição do cadastro acadêmico.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5">
            {rankingEntidades.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">Sem membros cadastrados ainda.</p>
            ) : (
              rankingEntidades.map((linha) => (
                <div key={linha.entidade.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <PontoEntidade cor={linha.entidade.cor} nome={linha.entidade.nome} />
                    <span className="text-[12px] font-semibold tabular text-muted-foreground">
                      {linha.total}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${linha.percentual}%`, backgroundColor: linha.entidade.cor }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle>Próximos eventos</CardTitle>
            <CardDescription>Agenda consolidada de todas as entidades.</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/calendario">Abrir calendário</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {proximosEventos.length === 0 ? (
            <EstadoVazio
              icone={CalendarDays}
              titulo="Sem eventos futuros"
              descricao="Assim que as entidades publicarem eventos eles aparecem aqui."
            />
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {proximosEventos.map((evento) => {
                const cor = evento.entidade?.cor ?? "#FA5C04";
                return (
                  <article
                    key={evento.id}
                    className="flex items-start gap-3 rounded-md border border-border bg-background/40 p-3"
                    style={{ borderLeftWidth: 3, borderLeftColor: cor }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-foreground">
                        {evento.nome}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="capitalize">{formatarData(evento.data)}</span>
                        <span className="tabular">
                          {formatarIntervalo(evento.horario_inicio, evento.horario_fim)}
                        </span>
                        {evento.local && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" />
                            {evento.local}
                          </span>
                        )}
                      </div>
                    </div>
                    {evento.entidade && (
                      <Badge
                        variant="neutro"
                        className="shrink-0 border-0"
                        style={{ color: cor, backgroundColor: `${cor}22` }}
                      >
                        {evento.entidade.nome}
                      </Badge>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
