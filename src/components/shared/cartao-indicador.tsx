import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface PropsCartaoIndicador {
  rotulo: string;
  valor: number | string;
  icone: LucideIcon;
  descricao?: string;
  destaque?: boolean;
  className?: string;
}

export function CartaoIndicador({
  rotulo,
  valor,
  icone: Icone,
  descricao,
  destaque = false,
  className,
}: PropsCartaoIndicador) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-sm transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-border/80 hover:shadow-md",
        destaque && "bg-gradient-brand-soft",
        className,
      )}
    >
      {destaque && <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-brand" />}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {rotulo}
        </p>
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-md",
            destaque ? "bg-primary/18 text-primary" : "bg-secondary text-muted-foreground",
          )}
        >
          <Icone className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold leading-none tabular text-foreground">
        {valor}
      </p>
      {descricao && <p className="mt-2 text-xs text-muted-foreground">{descricao}</p>}
    </div>
  );
}
