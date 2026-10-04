import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Campo } from "@/components/shared/campo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { ReservaDetalhada } from "@/lib/domain";
import { formatarData, formatarIntervalo } from "@/lib/format";

interface PropsDialogoRecusa {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  reserva: ReservaDetalhada | null;
  onConfirmar: (justificativa: string) => void;
  carregando?: boolean;
}

export function DialogoRecusa({
  aberto,
  aoMudarAberto,
  reserva,
  onConfirmar,
  carregando = false,
}: PropsDialogoRecusa) {
  const [justificativa, setJustificativa] = useState("");
  const [erro, setErro] = useState<string | undefined>();

  useEffect(() => {
    if (!aberto) return;
    setJustificativa("");
    setErro(undefined);
  }, [aberto]);

  const confirmar = () => {
    if (justificativa.trim().length < 5) {
      setErro("Descreva o motivo da recusa (mínimo 5 caracteres).");
      return;
    }
    setErro(undefined);
    onConfirmar(justificativa.trim());
  };

  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="border-border bg-popover shadow-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Recusar reserva</DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-muted-foreground">
            {reserva
              ? `${reserva.salaNome} · ${formatarData(reserva.data)} · ${formatarIntervalo(
                  reserva.hora_inicio,
                  reserva.hora_fim,
                )} · ${reserva.entidadeNome}`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Campo
            rotulo="Justificativa"
            htmlFor="recusa-justificativa"
            erro={erro}
            dica="O líder verá esta mensagem na lista de solicitações."
            obrigatorio
          >
            <Textarea
              id="recusa-justificativa"
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              rows={4}
              placeholder="Ex.: conflito com evento institucional no mesmo horário."
            />
          </Campo>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => aoMudarAberto(false)} disabled={carregando}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmar} disabled={carregando}>
              {carregando && <Loader2 className="size-4 animate-spin" />}
              Recusar reserva
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
