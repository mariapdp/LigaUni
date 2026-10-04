import { Loader2 } from "lucide-react";

import { MarcaLiga } from "@/components/shared/marca-liga";
import { Skeleton } from "@/components/ui/skeleton";

export function TelaCarregando({ mensagem = "Carregando…" }: { mensagem?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-background surface-grid px-6">
      <div className="flex flex-col items-center gap-5 animate-fade-in">
        <MarcaLiga tamanho="lg" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          {mensagem}
        </div>
      </div>
    </div>
  );
}

export function BlocoCarregando({ linhas = 4 }: { linhas?: number }) {
  return (
    <div className="flex flex-col gap-3 p-6">
      {Array.from({ length: linhas }).map((_, indice) => (
        <Skeleton key={indice} className="h-11 w-full rounded-md bg-secondary/60" />
      ))}
    </div>
  );
}
