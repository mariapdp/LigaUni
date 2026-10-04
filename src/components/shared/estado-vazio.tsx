import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PropsEstadoVazio {
  icone: LucideIcon;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  className?: string;
}

export function EstadoVazio({ icone: Icone, titulo, descricao, acao, className }: PropsEstadoVazio) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-14 text-center animate-fade-in-up",
        className,
      )}
    >
      <span className="grid size-14 place-items-center rounded-full border border-border bg-secondary text-muted-foreground">
        <Icone className="size-6" />
      </span>
      <p className="font-display text-base font-semibold text-foreground">{titulo}</p>
      {descricao && <p className="text-[13px] leading-relaxed text-muted-foreground">{descricao}</p>}
      {acao && <div className="mt-1">{acao}</div>}
    </div>
  );
}
