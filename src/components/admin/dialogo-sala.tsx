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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Sala } from "@/lib/domain";

interface PropsDialogoSala {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  sala?: Sala | null;
  aoSalvar: (
    dados: { nome: string; capacidade: number; recursos: string | null; ativa: boolean },
    id?: string,
  ) => Promise<void>;
}

interface Erros {
  nome?: string;
  capacidade?: string;
}

export function DialogoSala({ aberto, aoMudarAberto, sala, aoSalvar }: PropsDialogoSala) {
  const [nome, setNome] = useState("");
  const [capacidade, setCapacidade] = useState("20");
  const [recursos, setRecursos] = useState("");
  const [ativa, setAtiva] = useState(true);
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);

  const editando = Boolean(sala);

  useEffect(() => {
    if (!aberto) return;
    setNome(sala?.nome ?? "");
    setCapacidade(String(sala?.capacidade ?? 20));
    setRecursos(sala?.recursos ?? "");
    setAtiva(sala?.ativa ?? true);
    setErros({});
  }, [aberto, sala]);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();

    const novosErros: Erros = {};
    if (!nome.trim()) novosErros.nome = "Informe o nome da sala.";
    const numero = Number(capacidade);
    if (!capacidade || Number.isNaN(numero) || numero < 1) {
      novosErros.capacidade = "Informe uma capacidade válida (mínimo 1).";
    }
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);
    try {
      await aoSalvar(
        {
          nome: nome.trim(),
          capacidade: numero,
          recursos: recursos.trim() || null,
          ativa,
        },
        sala?.id,
      );
      toast.success(editando ? "Sala atualizada." : "Sala cadastrada.");
      aoMudarAberto(false);
    } catch (erroSalvar) {
      toast.error(erroSalvar instanceof Error ? erroSalvar.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-border bg-popover shadow-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {editando ? "Editar sala" : "Nova sala"}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            Salas inativas continuam no histórico, mas não podem receber novas solicitações.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={enviar}>
          <Campo rotulo="Nome" htmlFor="sala-nome" erro={erros.nome} obrigatorio>
            <Input
              id="sala-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Ágora 203 · Sala de Estudos"
            />
          </Campo>

          <Campo rotulo="Capacidade" htmlFor="sala-capacidade" erro={erros.capacidade} obrigatorio>
            <Input
              id="sala-capacidade"
              type="number"
              min={1}
              value={capacidade}
              onChange={(e) => setCapacidade(e.target.value)}
            />
          </Campo>

          <Campo
            rotulo="Recursos"
            htmlFor="sala-recursos"
            dica="Separe por vírgulas: projetor, som, quadro branco…"
          >
            <Textarea
              id="sala-recursos"
              value={recursos}
              onChange={(e) => setRecursos(e.target.value)}
              rows={3}
              placeholder="Projetor, sonorização, ar-condicionado"
            />
          </Campo>

          <div className="flex items-center justify-between rounded-md border border-border bg-background/50 px-3 py-3">
            <div className="flex flex-col">
              <Label htmlFor="sala-ativa" className="text-[13px] font-medium">
                Sala ativa
              </Label>
              <span className="text-xs text-muted-foreground">
                Disponibilizar para novas reservas
              </span>
            </div>
            <Switch id="sala-ativa" checked={ativa} onCheckedChange={setAtiva} />
          </div>

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
              {editando ? "Salvar" : "Cadastrar sala"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
