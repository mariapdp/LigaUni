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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MembroEntrada } from "@/lib/api";
import type { Entidade, Equipe, Membro } from "@/lib/domain";

const SEM_EQUIPE = "sem-equipe";

interface PropsDialogoMembro {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  membro?: Membro | null;
  entidadeId?: string;
  entidades?: Entidade[];
  equipes: Equipe[];
  aoSalvar: (dados: MembroEntrada, id?: string) => Promise<void>;
}

interface Erros {
  nome?: string;
  curso?: string;
  entidade?: string;
}

export function DialogoMembro({
  aberto,
  aoMudarAberto,
  membro,
  entidadeId,
  entidades,
  equipes,
  aoSalvar,
}: PropsDialogoMembro) {
  const [nome, setNome] = useState("");
  const [entidadeSelecionada, setEntidadeSelecionada] = useState("");
  const [equipeId, setEquipeId] = useState<string>(SEM_EQUIPE);
  const [curso, setCurso] = useState("");
  const [universidade, setUniversidade] = useState("");
  const [funcao, setFuncao] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);

  const editando = Boolean(membro);

  useEffect(() => {
    if (!aberto) return;
    setNome(membro?.nome ?? "");
    setEntidadeSelecionada(membro?.entidade_id ?? entidadeId ?? entidades?.[0]?.id ?? "");
    setEquipeId(membro?.equipe_id ?? SEM_EQUIPE);
    setCurso(membro?.curso ?? "");
    setUniversidade(membro?.universidade ?? "");
    setFuncao(membro?.funcao ?? "");
    setErros({});
  }, [aberto, membro, entidadeId, entidades]);

  const equipesDisponiveis = equipes.filter(
    (equipe) => !entidadeSelecionada || equipe.entidade_id === entidadeSelecionada,
  );

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();

    const novosErros: Erros = {};
    if (!nome.trim()) novosErros.nome = "Informe o nome do membro.";
    if (!curso.trim()) novosErros.curso = "Informe o curso.";
    if (!entidadeSelecionada) novosErros.entidade = "Selecione a entidade.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);
    try {
      await aoSalvar(
        {
          entidade_id: entidadeSelecionada,
          equipe_id: equipeId === SEM_EQUIPE ? null : equipeId,
          nome: nome.trim(),
          curso: curso.trim(),
          universidade: universidade.trim() || null,
          funcao: funcao.trim() || null,
        },
        membro?.id,
      );
      toast.success(editando ? "Membro atualizado." : "Membro adicionado.");
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
            {editando ? "Editar membro" : "Novo membro"}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            Dados acadêmicos e função dentro da entidade.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={enviar}>
          {entidades && entidades.length > 0 && (
            <Campo rotulo="Entidade" erro={erros.entidade} obrigatorio>
              <Select value={entidadeSelecionada} onValueChange={setEntidadeSelecionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a entidade" />
                </SelectTrigger>
                <SelectContent>
                  {entidades.map((entidade) => (
                    <SelectItem key={entidade.id} value={entidade.id}>
                      {entidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
          )}

          <Campo rotulo="Nome completo" htmlFor="membro-nome" erro={erros.nome} obrigatorio>
            <Input
              id="membro-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Marina Duarte"
            />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Curso" htmlFor="membro-curso" erro={erros.curso} obrigatorio>
              <Input
                id="membro-curso"
                value={curso}
                onChange={(e) => setCurso(e.target.value)}
                placeholder="Ex.: Engenharia Mecânica"
              />
            </Campo>
            <Campo rotulo="Universidade" htmlFor="membro-universidade">
              <Input
                id="membro-universidade"
                value={universidade}
                onChange={(e) => setUniversidade(e.target.value)}
                placeholder="Ex.: UFSC"
              />
            </Campo>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Equipe" dica="Opcional">
              <Select value={equipeId} onValueChange={setEquipeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sem equipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEM_EQUIPE}>Sem equipe</SelectItem>
                  {equipesDisponiveis.map((equipe) => (
                    <SelectItem key={equipe.id} value={equipe.id}>
                      {equipe.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
            <Campo rotulo="Função" htmlFor="membro-funcao">
              <Input
                id="membro-funcao"
                value={funcao}
                onChange={(e) => setFuncao(e.target.value)}
                placeholder="Ex.: Diretor(a) de Projetos"
              />
            </Campo>
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
              {editando ? "Salvar" : "Adicionar membro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
