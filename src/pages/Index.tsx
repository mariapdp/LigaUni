import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { GradeEntidades } from "@/components/publico/grade-entidades";
import { HeroPublico } from "@/components/publico/hero-publico";
import { NavPublica } from "@/components/publico/nav-publica";
import { RecursosPublico } from "@/components/publico/recursos-publico";
import { MarcaLiga } from "@/components/shared/marca-liga";
import { Button } from "@/components/ui/button";
import { useEntidades } from "@/hooks/use-dados";

const Index = () => {
  const { data: entidades } = useEntidades();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <NavPublica />
      <main className="flex-1">
        <HeroPublico entidades={entidades ?? []} />
        <GradeEntidades entidades={entidades ?? []} />
        <RecursosPublico />

        <section className="relative overflow-hidden">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-6 px-5 py-16 text-center sm:px-8 lg:py-20">
            <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              Pronto para organizar a sua entidade na Liga UNI?
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Cadastre-se em menos de um minuto, escolha a sua entidade e comece a publicar eventos
              e reservar as salas do Ágora.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/cadastro">
                  Criar minha conta
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Entrar no painel</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-sidebar">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start justify-between gap-4 px-5 py-8 sm:flex-row sm:items-center sm:px-8">
          <MarcaLiga tamanho="sm" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Gestão de entidades acadêmicas, calendário de eventos e reservas de salas do Ágora.
          </p>
          <p className="text-xs text-muted-foreground">Campus Joinville</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
