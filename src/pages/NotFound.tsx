import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass } from "lucide-react";

import { MarcaLiga } from "@/components/shared/marca-liga";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: rota inexistente acessada:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center surface-grid">
      <MarcaLiga tamanho="lg" />
      <span className="grid size-14 place-items-center rounded-full border border-border bg-secondary text-primary">
        <Compass className="size-6" />
      </span>
      <div className="flex flex-col gap-2">
        <p className="font-display text-4xl font-bold tracking-tight text-foreground">404</p>
        <h1 className="font-display text-xl font-semibold text-foreground">
          Página não encontrada
        </h1>
        <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
          O endereço <strong className="text-foreground">{location.pathname}</strong> não existe na
          Liga UNI. Volte para a página inicial ou entre no painel.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link to="/">Ir para o início</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/painel">Abrir meu painel</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
