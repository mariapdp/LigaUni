import type { ReactNode } from "react";
import { CalendarDays, DoorOpen, ShieldCheck } from "lucide-react";

import { MarcaLiga } from "@/components/shared/marca-liga";
import { EtiquetaEntidade } from "@/components/shared/ponto-entidade";
import { useEntidades } from "@/hooks/use-dados";

const DESTAQUES = [
  {
    icone: CalendarDays,
    titulo: "Calendário unificado",
    texto: "Eventos de todas as entidades com cor própria e filtros por entidade.",
  },
  {
    icone: DoorOpen,
    titulo: "Reservas do Ágora",
    texto: "Solicite salas, acompanhe o status e evite conflitos de horário.",
  },
  {
    icone: ShieldCheck,
    titulo: "Acesso por papel",
    texto: "Líderes cuidam da própria entidade; a administração enxerga tudo.",
  },
];

interface PropsLayoutAutenticacao {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
  rodape?: ReactNode;
}

export function LayoutAutenticacao({
  titulo,
  subtitulo,
  children,
  rodape,
}: PropsLayoutAutenticacao) {
  const { data: entidades } = useEntidades();

  return (
    <div className="grid min-h-dvh w-full grid-cols-1 bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-sidebar p-10 surface-grid lg:flex">
        <span className="pointer-events-none absolute -right-24 top-16 size-72 rounded-full bg-primary/10 blur-3xl animate-float-slow" />
        <MarcaLiga tamanho="lg" />

        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground">
              Todas as entidades
              <br />
              acadêmicas em
              <br />
              <span className="text-gradient-brand">um só painel.</span>
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Liga UNI organiza equipes, calendário de eventos e as reservas das salas do Ágora —
              com controle de acesso por papel e histórico completo.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {DESTAQUES.map((destaque) => (
              <div key={destaque.titulo} className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/14 text-primary">
                  <destaque.icone className="size-4" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{destaque.titulo}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{destaque.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex flex-wrap gap-1.5">
          {(entidades ?? []).slice(0, 10).map((entidade) => (
            <EtiquetaEntidade key={entidade.id} cor={entidade.cor} nome={entidade.nome} />
          ))}
          {(entidades?.length ?? 0) > 10 && (
            <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              +{(entidades?.length ?? 0) - 10} entidades
            </span>
          )}
        </div>
      </aside>

      <main className="flex flex-col items-center justify-center gap-6 px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="mb-6 flex lg:hidden">
            <MarcaLiga />
          </div>

          <div className="mb-6 flex flex-col gap-1.5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {titulo}
            </h1>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{subtitulo}</p>
          </div>

          {children}

          {rodape && <div className="mt-6 text-center text-[13px] text-muted-foreground">{rodape}</div>}
        </div>
      </main>
    </div>
  );
}
