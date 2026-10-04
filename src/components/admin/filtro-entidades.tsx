import { Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Entidade } from "@/lib/domain";
import { cn } from "@/lib/utils";

interface PropsFiltroEntidades {
  entidades: Entidade[];
  selecionadas: string[];
  aoMudar: (ids: string[]) => void;
}

export function FiltroEntidades({ entidades, selecionadas, aoMudar }: PropsFiltroEntidades) {
  const todasSelecionadas = selecionadas.length === entidades.length && entidades.length > 0;

  const alternar = (id: string) => {
    aoMudar(
      selecionadas.includes(id)
        ? selecionadas.filter((item) => item !== id)
        : [...selecionadas, id],
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Layers />
          Entidades
          <span className="ml-1 rounded-full bg-primary/15 px-1.5 text-[11px] font-bold text-primary tabular">
            {selecionadas.length}/{entidades.length}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 border-border bg-popover p-0 shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Filtrar por entidade
          </p>
          <button
            type="button"
            className="text-[11px] font-semibold text-primary hover:underline"
            onClick={() =>
              aoMudar(todasSelecionadas ? [] : entidades.map((entidade) => entidade.id))
            }
          >
            {todasSelecionadas ? "Nenhuma" : "Todas"}
          </button>
        </div>

        <div className="scrollbar-thin max-h-72 overflow-y-auto p-1.5">
          {entidades.map((entidade) => {
            const marcada = selecionadas.includes(entidade.id);
            return (
              <label
                key={entidade.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-2 text-[13px] transition-colors",
                  marcada ? "text-foreground hover:bg-secondary" : "text-muted-foreground hover:bg-secondary",
                )}
              >
                <Checkbox checked={marcada} onCheckedChange={() => alternar(entidade.id)} />
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: entidade.cor }}
                  aria-hidden="true"
                />
                <span className="truncate">{entidade.nome}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
