import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface PropsDialogoConfirmacao {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  titulo: string;
  descricao: ReactNode;
  textoConfirmar?: string;
  textoCancelar?: string;
  onConfirmar: () => void;
  carregando?: boolean;
  destrutivo?: boolean;
}

export function DialogoConfirmacao({
  aberto,
  aoMudarAberto,
  titulo,
  descricao,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  onConfirmar,
  carregando = false,
  destrutivo = true,
}: PropsDialogoConfirmacao) {
  return (
    <AlertDialog open={aberto} onOpenChange={aoMudarAberto}>
      <AlertDialogContent className="border-border bg-popover shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-lg">{titulo}</AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] leading-relaxed text-muted-foreground">
            {descricao}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost" disabled={carregando}>
              {textoCancelar}
            </Button>
          </AlertDialogCancel>
          <Button
            variant={destrutivo ? "destructive" : "default"}
            onClick={onConfirmar}
            disabled={carregando}
          >
            {carregando && <Loader2 className="size-4 animate-spin" />}
            {textoConfirmar}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
