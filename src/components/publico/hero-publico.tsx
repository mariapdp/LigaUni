import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Users } from "lucide-react";

import { EtiquetaEntidade } from "@/components/shared/ponto-entidade";
import { Button } from "@/components/ui/button";
import type { Entidade } from "@/lib/domain";

interface PropsHeroPublico {
  entidades: Entidade[];
}

export function HeroPublico({ entidades }: PropsHeroPublico) {
  return (
    <section className="relative overflow-hidden border-b border-border surface-grid">
      <span className="pointer-events-none absolute -left-32 top-10 size-80 rounded-full bg-primary/12 blur-3xl animate-float-slow" />

      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-5 py-16 sm:px-8 lg:flex-row lg:items-center lg:py-24">
        <div className="flex flex-1 flex-col gap-6 animate-fade-in-up">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
            Ágora · Campus Joinville
          </span>

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            A gestão das
            <br />
            entidades acadêmicas,
            <br />
            <span className="text-gradient-brand">centralizada.</span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Liga UNI reúne equipes, membros, o calendário de eventos e as reservas das salas do
            Ágora em uma única plataforma — cada líder cuida da sua entidade, a administração
            acompanha tudo.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/cadastro">
                Cadastrar minha entidade
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Já tenho conta</Link>
            </Button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-primary/14 text-primary">
                <Users className="size-5" />
              </span>
              <div>
                <p className="font-display text-2xl font-bold leading-none tabular text-foreground">
                  {entidades.length}
                </p>
                <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  Entidades
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-primary/14 text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="font-display text-2xl font-bold leading-none tabular text-foreground">
                  2
                </p>
                <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  Perfis de acesso
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-lg border border-border bg-card/80 p-5 shadow-lg animate-fade-in">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Entidades ativas
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {entidades.slice(0, 14).map((entidade) => (
              <EtiquetaEntidade key={entidade.id} cor={entidade.cor} nome={entidade.nome} />
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-5">
            <div className="rounded-md border border-border bg-background/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                Perfis
              </p>
              <p className="mt-1 text-[13px] font-semibold text-foreground">
                Líder e administração
              </p>
            </div>
            <div className="rounded-md border border-border bg-background/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                Salas do Ágora
              </p>
              <p className="mt-1 text-[13px] font-semibold text-foreground">
                Reserva com aprovação
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
