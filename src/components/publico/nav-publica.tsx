import { Link } from "react-router-dom";

import { MarcaLiga } from "@/components/shared/marca-liga";
import { Button } from "@/components/ui/button";
import { useAutenticacao } from "@/hooks/use-auth";

const LINKS = [
  { id: "entidades", rotulo: "Entidades" },
  { id: "recursos", rotulo: "Recursos" },
  { id: "fluxo", rotulo: "Como funciona" },
];

function irPara(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function NavPublica() {
  const { usuario } = useAutenticacao();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" aria-label="Liga UNI">
          <MarcaLiga />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          {LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => irPara(link.id)}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.rotulo}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {usuario ? (
            <Button asChild size="sm">
              <Link to="/painel">Ir para o painel</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/cadastro">Criar conta</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}