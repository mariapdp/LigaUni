import { cn } from "@/lib/utils";
import { comAlfa } from "@/lib/domain";

export function PontoEntidade({
  cor,
  nome,
  className,
}: {
  cor: string;
  nome: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className="size-2.5 shrink-0 rounded-full ring-2"
        style={{ backgroundColor: cor, boxShadow: `0 0 0 2px ${comAlfa(cor, 0.25)}` }}
        aria-hidden="true"
      />
      <span className="truncate text-[13px] font-medium text-foreground">{nome}</span>
    </span>
  );
}

export function EtiquetaEntidade({
  cor,
  nome,
  className,
}: {
  cor: string;
  nome: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 truncate rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        className,
      )}
      style={{
        backgroundColor: comAlfa(cor, 0.14),
        borderColor: comAlfa(cor, 0.35),
        color: cor,
      }}
    >
      <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: cor }} />
      <span className="truncate">{nome}</span>
    </span>
  );
}
