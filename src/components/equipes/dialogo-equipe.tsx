import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import type { Equipe } from "@/lib/domain";

interface PropsDialogoEquipe {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  equipe?: Equipe | null;
  aoSalvar: (nome: string, id?: string) => Promise<void>;
}

export function DialogoEquipe({ aberto, aoMudarAberto, equipe, aoSalvar }: PropsDialogoEquipe) {
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | undefined>();
  const [salvando, setSalvando] = useState(false);
  const editando = Boolean(equipe);

  useEffect(() => {
    if (!aberto) return;
    setNome(equipe?.nome ?? "");
    setErro(undefined);
  }, [aberto, equipe]);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!nome.trim()) {
      setErro("Informe o nome da equipe.");
      return;
    }

    setSalvando(true);
    try {
      await aoSalvar(nome.trim(), equipe?.id);
      toast.success(editando ? "Equipe atualizada." : "Equipe criada.");
      aoMudarAberto(false);
    } catch (erroSalvar) {
      toast.error(erroSalvar instanceof Error ? erroSalvar.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="border-border bg-popover shadow-lg sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {editando ? "Editar equipe" : "Nova equipe"}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            Equipes agrupam membros dentro da entidade (ex.: Diretoria, Powertrain, Extensão).
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={enviar}>
          <Campo rotulo="Nome da equipe" htmlFor="equipe-nome" erro={erro} obrigatorio>
            <Input
              id="equipe-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Comissão de Eventos"
            />
          </Campo>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => aoMudarAberto(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando && <Loader2 className="size-4 animate-spin" />}
              {editando ? "Salvar" : "Criar equipe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
