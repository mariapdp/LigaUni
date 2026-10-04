import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Entidade } from "@/lib/domain";

export function HeroPublico({ entidades }: { entidades: Entidade[] }) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:py-24">
        <div className="flex flex-col gap-6">
          <p className="text-sm font-semibold text-muted-foreground">Ágora · Campus Joinville</p>

          <h1 className="font-display text-5xl font-extrabold leading-[0.98] sm:text-6xl lg:text-7xl">
            Cada entidade na sua cor.
            <br />
            <span className="text-primary">Todas na mesma agenda.</span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Equipes, membros, calendário de eventos e reservas das salas do Ágora num lugar só.
            O líder cuida da própria entidade; a administração enxerga o campus inteiro.
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
        </div>

        <aside className="border-2 border-foreground bg-card p-5 shadow-[6px_6px_0_0_hsl(var(--foreground))]">
          <h2 className="font-display text-lg font-bold">Quem já está aqui</h2>
          {entidades.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Nenhuma entidade ainda. A primeira pode ser a sua.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {entidades.slice(0, 8).map((entidade) => (
                <li key={entidade.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: entidade.cor }}
                    aria-hidden="true"
                  />
                  <span className="truncate font-medium">{entidade.nome}</span>
                </li>
              ))}
            </ul>
          )}
          {entidades.length > 8 && (
            <p className="mt-3 text-xs text-muted-foreground">+ {entidades.length - 8} entidades</p>
          )}
        </aside>
      </div>
    </section>
  );
}