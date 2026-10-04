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
import { Textarea } from "@/components/ui/textarea";
import { COR_PADRAO, PALETA, type Entidade } from "@/lib/domain";
import { cn } from "@/lib/utils";

interface PropsDialogoEntidade {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  entidade?: Entidade | null;
  aoSalvar: (dados: { nome: string; descricao: string | null; cor: string }, id?: string) => Promise<void>;
}

interface Erros {
  nome?: string;
}

export function DialogoEntidade({ aberto, aoMudarAberto, entidade, aoSalvar }: PropsDialogoEntidade) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cor, setCor] = useState(COR_PADRAO);
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);

  const editando = Boolean(entidade);

  useEffect(() => {
    if (!aberto) return;
    setNome(entidade?.nome ?? "");
    setDescricao(entidade?.descricao ?? "");
    setCor(entidade?.cor ?? PALETA[Math.floor(Math.random() * PALETA.length)]);
    setErros({});
  }, [aberto, entidade]);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();

    if (!nome.trim()) {
      setErros({ nome: "Informe o nome da entidade." });
      return;
    }
    setErros({});

    setSalvando(true);
    try {
      await aoSalvar(
        { nome: nome.trim(), descricao: descricao.trim() || null, cor },
        entidade?.id,
      );
      toast.success(editando ? "Entidade atualizada." : "Entidade criada.");
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
            {editando ? "Editar entidade" : "Nova entidade"}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            A cor é usada para identificar a entidade no calendário consolidado.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={enviar}>
          <Campo rotulo="Nome" htmlFor="entidade-nome" erro={erros.nome} obrigatorio>
            <Input
              id="entidade-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Equipe de Robótica"
            />
          </Campo>

          <Campo rotulo="Descrição" htmlFor="entidade-descricao">
            <Textarea
              id="entidade-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Atuação, projetos e frentes de trabalho da entidade"
              rows={4}
            />
          </Campo>

          <Campo rotulo="Cor no calendário">
            <div className="flex flex-wrap items-center gap-2">
              {PALETA.map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  aria-label={`Usar a cor ${opcao}`}
                  onClick={() => setCor(opcao)}
                  className={cn(
                    "size-7 rounded-full border-2 transition-transform hover:scale-105",
                    cor.toLowerCase() === opcao.toLowerCase()
                      ? "border-foreground"
                      : "border-transparent",
                  )}
                  style={{ backgroundColor: opcao }}
                />
              ))}
              <label className="ml-1 flex items-center gap-2 text-[12px] text-muted-foreground">
                Outra:
                <input
                  type="color"
                  value={cor}
                  onChange={(e) => setCor(e.target.value)}
                  className="size-7 cursor-pointer rounded-sm border border-border bg-transparent"
                  aria-label="Escolher outra cor"
                />
              </label>
            </div>
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
              {editando ? "Salvar" : "Criar entidade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
