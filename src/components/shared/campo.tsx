import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PropsCampo {
  rotulo: string;
  htmlFor?: string;
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
  children: ReactNode;
  className?: string;
}

export function Campo({
  rotulo,
  htmlFor,
  erro,
  dica,
  obrigatorio = false,
  children,
  className,
}: PropsCampo) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-[13px] font-medium text-foreground">
        {rotulo}
        {obrigatorio && <span className="ml-0.5 text-primary">*</span>}
      </Label>
      {children}
      {erro ? (
        <p className="text-xs font-medium text-[hsl(0_84%_70%)]">{erro}</p>
      ) : (
        dica && <p className="text-xs text-muted-foreground">{dica}</p>
      )}
    </div>
  );
}
