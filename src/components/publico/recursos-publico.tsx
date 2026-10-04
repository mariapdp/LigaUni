import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  DoorOpen,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const RECURSOS = [
  {
    icone: UsersRound,
    titulo: "Equipes e membros",
    texto:
      "Cadastre equipes e membros com curso, universidade e função. Busque e filtre por equipe, curso ou instituição.",
  },
  {
    icone: CalendarDays,
    titulo: "Calendário de eventos",
    texto:
      "Visão mensal e semanal, com a cor de cada entidade e criação, edição e exclusão de eventos em poucos cliques.",
  },
  {
    icone: DoorOpen,
    titulo: "Reservas do Ágora",
    texto:
      "Solicite salas do Ágora com data e horário. A administração aprova ou recusa, com justificativa registrada.",
  },
  {
    icone: ShieldCheck,
    titulo: "Papéis separados",
    texto:
      "Líderes acessam apenas a própria entidade. A administração enxerga o panorama completo do campus.",
  },
  {
    icone: ClipboardList,
    titulo: "Fila de aprovação",
    texto:
      "Pendências, histórico filtrável e alerta de conflito de horário antes de cada aprovação.",
  },
  {
    icone: CheckCircle2,
    titulo: "Sem choque de agenda",
    texto:
      "Reservas sobrepostas na mesma sala são bloqueadas — pela interface e pelas regras do banco.",
  },
];

const FLUXO = [
  {
    passo: "01",
    titulo: "Crie sua conta e escolha a entidade",
    texto: "O cadastro entra automaticamente como líder da entidade selecionada.",
  },
  {
    passo: "02",
    titulo: "Organize equipes, membros e eventos",
    texto: "Monte o time, registre cursos e funções e publique o calendário do semestre.",
  },
  {
    passo: "03",
    titulo: "Reserve as salas do Ágora",
    texto: "Envie a solicitação e acompanhe o status até a aprovação da administração.",
  },
];

export function RecursosPublico() {
  return (
    <>
      <section id="recursos" className="border-b border-border">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              Recursos
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Feito para a rotina das ligas e atléticas
            </h2>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RECURSOS.map((recurso) => (
              <article
                key={recurso.titulo}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm transition-colors duration-200 hover:border-primary/35"
              >
                <span className="grid size-10 place-items-center rounded-md bg-primary/14 text-primary">
                  <recurso.icone className="size-5" />
                </span>
                <h3 className="font-display text-base font-semibold text-foreground">
                  {recurso.titulo}
                </h3>
                <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                  {recurso.texto}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="fluxo" className="border-b border-border bg-sidebar">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              Como funciona
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Do cadastro à sala reservada
            </h2>
          </div>

          <ol className="mt-9 grid gap-4 md:grid-cols-3">
            {FLUXO.map((etapa) => (
              <li
                key={etapa.passo}
                className="relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-sm"
              >
                <span className="font-display text-3xl font-bold text-primary/35">
                  {etapa.passo}
                </span>
                <h3 className="mt-2 font-display text-[15px] font-semibold text-foreground">
                  {etapa.titulo}
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                  {etapa.texto}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
