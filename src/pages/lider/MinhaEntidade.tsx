import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Loader2,
  MapPin,
  Save,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import { CabecalhoPagina } from "@/components/shared/cabecalho-pagina";
import { CartaoIndicador } from "@/components/shared/cartao-indicador";
import { EtiquetaEntidade } from "@/components/shared/ponto-entidade";
import { EstadoVazio } from "@/components/shared/estado-vazio";
import { BlocoCarregando } from "@/components/shared/carregando";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAutenticacao } from "@/hooks/use-auth";
import { chaves, useEntidades, useEquipes, useEventos, useMembros, useReservas } from "@/hooks/use-dados";
import { atualizarEntidade } from "@/lib/api";
import { formatarDataLonga, formatarIntervalo, hojeISO } from "@/lib/format";

export default function MinhaEntidade() {
  const { entidadeId, perfil } = useAutenticacao();
  const queryClient = useQueryClient();

  const { data: entidades, isLoading: carregandoEntidades } = useEntidades();
  const { data: membros } = useMembros();
  const { data: equipes } = useEquipes();
  const { data: eventos } = useEventos();
  const { data: reservas } = useReservas();

  const entidade = useMemo(
    () => entidades?.find((item) => item.id === entidadeId) ?? null,
    [entidades, entidadeId],
  );

  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    setDescricao(entidade?.descricao ?? "");
  }, [entidade?.id, entidade?.descricao]);

  const salvar = useMutation({
    mutationFn: (texto: string) =>
      atualizarEntidade(entidade!.id, { descricao: texto.trim() || null }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chaves.entidades });
      toast.success("Descrição atualizada.");
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  if (carregandoEntidades) return <BlocoCarregando linhas={6} />;

  if (!entidade) {
    return (
      <div className="flex flex-col gap-6">
        <CabecalhoPagina
          titulo="Minha entidade"
          descricao="Nenhuma entidade está vinculada à sua conta."
        />
        <Card>
          <EstadoVazio
            icone={Building2}
            titulo="Sem entidade vinculada"
            descricao="Peça à administração da Liga UNI para vincular a sua conta a uma entidade."
          />
        </Card>
      </div>
    );
  }

  const eventosDaEntidade = (eventos ?? []).filter(
    (evento) => evento.data >= hojeISO(),
  );
  const proximosEventos = [...eventosDaEntidade]
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 4);

  const reservasPendentes = (reservas ?? []).filter((reserva) => reserva.status === "pendente");
  const reservasAprovadas = (reservas ?? []).filter((reserva) => reserva.status === "aprovada");

  const descricaoAlterada = (entidade.descricao ?? "") !== descricao;

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <CabecalhoPagina
        titulo={entidade.nome}
        descricao={`Painel do líder${perfil?.nome ? ` · ${perfil.nome}` : ""}`}
        acoes={
          <>
            <EtiquetaEntidade cor={entidade.cor} nome={`Cor no calendário ${entidade.cor}`} />
            <Button asChild variant="outline" size="sm">
              <Link to="/lider/calendario">
                <CalendarDays />
                Calendário
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CartaoIndicador
          rotulo="Membros"
          valor={membros?.length ?? 0}
          icone={UsersRound}
          descricao="Pessoas cadastradas na entidade"
          destaque
        />
        <CartaoIndicador
          rotulo="Equipes"
          valor={equipes?.length ?? 0}
          icone={Building2}
          descricao="Times ativos"
        />
        <CartaoIndicador
          rotulo="Eventos futuros"
          valor={eventosDaEntidade.length}
          icone={CalendarDays}
          descricao="A partir de hoje"
        />
        <CartaoIndicador
          rotulo="Reservas pendentes"
          valor={reservasPendentes.length}
          icone={ClipboardList}
          descricao={`${reservasAprovadas.length} aprovadas no total`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Sobre a entidade</CardTitle>
            <CardDescription>
              Esta descrição aparece para a administração e no cadastro de novos líderes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={6}
              placeholder="Descreva a atuação da entidade, projetos e frentes de trabalho…"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {descricaoAlterada ? "Alterações não salvas." : "Tudo salvo."}
              </p>
              <Button
                onClick={() => salvar.mutate(descricao)}
                disabled={!descricaoAlterada || salvar.isPending}
                size="sm"
              >
                {salvar.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save />}
                Salvar descrição
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle>Próximos eventos</CardTitle>
              <CardDescription>Agenda da sua entidade.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/lider/calendario">Ver calendário</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {proximosEventos.length === 0 ? (
              <EstadoVazio
                icone={CalendarDays}
                titulo="Sem eventos futuros"
                descricao="Crie o primeiro evento no calendário da entidade."
                acao={
                  <Button asChild size="sm">
                    <Link to="/lider/calendario">Criar evento</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {proximosEventos.map((evento) => (
                  <li
                    key={evento.id}
                    className="flex items-start gap-3 rounded-md border border-border bg-background/40 p-3"
                    style={{ borderLeftWidth: 3, borderLeftColor: entidade.cor }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-foreground">
                        {evento.nome}
                      </p>
                      <p className="mt-0.5 text-[11px] capitalize text-muted-foreground">
                        {formatarDataLonga(evento.data)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1 tabular">
                        <Clock className="size-3.5" />
                        {formatarIntervalo(evento.horario_inicio, evento.horario_fim)}
                      </span>
                      {evento.local && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {evento.local}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo de reservas</CardTitle>
          <CardDescription>Situação das solicitações de sala feitas pela entidade.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {[
            { rotulo: "Pendentes", valor: reservasPendentes.length, icone: Clock },
            { rotulo: "Aprovadas", valor: reservasAprovadas.length, icone: CheckCircle2 },
            {
              rotulo: "Recusadas",
              valor: (reservas ?? []).filter((r) => r.status === "recusada").length,
              icone: ClipboardList,
            },
          ].map((item) => (
            <div
              key={item.rotulo}
              className="flex items-center gap-3 rounded-md border border-border bg-background/40 p-3"
            >
              <span className="grid size-9 place-items-center rounded-md bg-secondary text-muted-foreground">
                <item.icone className="size-4" />
              </span>
              <div>
                <p className="font-display text-xl font-bold leading-none tabular text-foreground">
                  {item.valor}
                </p>
                <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  {item.rotulo}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
