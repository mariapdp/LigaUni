import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PropsCabecalhoPagina {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
  className?: string;
}

export function CabecalhoPagina({ titulo, descricao, acoes, className }: PropsCabecalhoPagina) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
          {titulo}
        </h1>
        {descricao && (
          <p className="max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{descricao}</p>
        )}
      </div>
      {acoes && <div className="flex flex-wrap items-center gap-2">{acoes}</div>}
    </header>
  );
}
