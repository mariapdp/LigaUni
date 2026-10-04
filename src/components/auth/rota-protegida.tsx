import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

import { TelaCarregando } from "@/components/shared/carregando";
import { Button } from "@/components/ui/button";
import { useAutenticacao } from "@/hooks/use-auth";
import type { Papel } from "@/lib/domain";

function SemAcesso() {
  const { sair } = useAutenticacao();

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6 text-center surface-grid">
      <div className="flex max-w-md flex-col items-center gap-4">
        <span className="grid size-14 place-items-center rounded-full border border-border bg-secondary text-primary">
          <ShieldAlert className="size-6" />
        </span>
        <h1 className="font-display text-xl font-semibold text-foreground">
          Conta sem permissão de acesso
        </h1>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Sua conta ainda não possui um papel na Liga UNI. Peça à administração para vincular você a
          uma entidade ou conceder acesso de administração.
        </p>
        <Button variant="outline" onClick={() => void sair()}>
          Sair da conta
        </Button>
      </div>
    </div>
  );
}

interface PropsRotaProtegida {
  papel: Papel;
  children: ReactNode;
}

/**
 * Bloqueia a rota no cliente para orientar a navegação.
 * O acesso real aos dados é decidido pelas políticas do backend.
 */
export function RotaProtegida({ papel, children }: PropsRotaProtegida) {
  const { carregando, usuario, papeis } = useAutenticacao();

  if (carregando) return <TelaCarregando mensagem="Verificando seu acesso…" />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (papeis.length === 0) return <SemAcesso />;
  if (!papeis.includes(papel)) {
    return <Navigate to={papeis.includes("admin") ? "/admin" : "/lider"} replace />;
  }

  return <>{children}</>;
}

/** Envia o usuário autenticado para o painel do seu papel. */
export function RedirecionarPorPapel() {
  const { carregando, usuario, papeis } = useAutenticacao();

  if (carregando) return <TelaCarregando />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (papeis.length === 0) return <SemAcesso />;

  return <Navigate to={papeis.includes("admin") ? "/admin" : "/lider"} replace />;
}
