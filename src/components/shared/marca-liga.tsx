import { cn } from "@/lib/utils";

interface PropsMarca {
  className?: string;
  tamanho?: "sm" | "md" | "lg";
  mostrarTexto?: boolean;
}

const TAMANHOS = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
} as const;

const TEXTOS = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
} as const;

/** Logotipo "Liga UNI": monograma laranja + wordmark. */
export function MarcaLiga({ className, tamanho = "md", mostrarTexto = true }: PropsMarca) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative grid shrink-0 place-items-center rounded-md bg-gradient-brand shadow-brand",
          TAMANHOS[tamanho],
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            "font-display font-bold leading-none text-primary-foreground",
            tamanho === "lg" ? "text-lg" : tamanho === "md" ? "text-sm" : "text-xs",
          )}
        >
          LU
        </span>
      </span>
      {mostrarTexto && (
        <span className={cn("font-display font-bold leading-none tracking-tight", TEXTOS[tamanho])}>
          Liga <span className="text-primary">UNI</span>
        </span>
      )}
    </div>
  );
}
