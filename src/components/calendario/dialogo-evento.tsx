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
import { Textarea } from "@/components/ui/textarea";
import type { EventoEntrada } from "@/lib/api";
import type { Entidade, EventoDetalhado } from "@/lib/domain";
import { hojeISO } from "@/lib/format";

interface PropsDialogoEvento {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  evento?: EventoDetalhado | null;
  dataInicial?: string;
  entidadeFixaId?: string | null;
  entidadesDisponiveis?: Entidade[];
  aoSalvar: (dados: EventoEntrada, id?: string) => Promise<void>;
}

interface Erros {
  nome?: string;
  entidade?: string;
  data?: string;
  horario?: string;
}

export function DialogoEvento({
  aberto,
  aoMudarAberto,
  evento,
  dataInicial,
  entidadeFixaId,
  entidadesDisponiveis,
  aoSalvar,
}: PropsDialogoEvento) {
  const [nome, setNome] = useState("");
  const [entidadeId, setEntidadeId] = useState("");
  const [data, setData] = useState(hojeISO());
  const [inicio, setInicio] = useState("18:00");
  const [fim, setFim] = useState("");
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);

  const editando = Boolean(evento);

  useEffect(() => {
    if (!aberto) return;
    setNome(evento?.nome ?? "");
    setEntidadeId(
      evento?.entidade_id ?? entidadeFixaId ?? entidadesDisponiveis?.[0]?.id ?? entidadeFixaId ?? "",
    );
    setData(evento?.data ?? dataInicial ?? hojeISO());
    setInicio(evento?.horario_inicio?.slice(0, 5) ?? "18:00");
    setFim(evento?.horario_fim?.slice(0, 5) ?? "");
    setLocal(evento?.local ?? "");
    setDescricao(evento?.descricao ?? "");
    setErros({});
  }, [aberto, evento, dataInicial, entidadeFixaId, entidadesDisponiveis]);

  const enviar = async (eventoForm: FormEvent) => {
    eventoForm.preventDefault();

    const novosErros: Erros = {};
    if (!nome.trim()) novosErros.nome = "Informe o nome do evento.";
    if (!entidadeId) novosErros.entidade = "Selecione a entidade responsável.";
    if (!data) novosErros.data = "Informe a data.";
    if (!inicio) novosErros.horario = "Informe o horário de início.";
    if (!novosErros.horario && fim && fim <= inicio) {
      novosErros.horario = "O horário final deve ser posterior ao inicial.";
    }
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);
    try {
      await aoSalvar(
        {
          entidade_id: entidadeId,
          nome: nome.trim(),
          data,
          horario_inicio: inicio,
          horario_fim: fim || null,
          local: local.trim() || null,
          descricao: descricao.trim() || null,
        },
        evento?.id,
      );
      toast.success(editando ? "Evento atualizado." : "Evento criado.");
      aoMudarAberto(false);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível salvar o evento.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-border bg-popover shadow-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {editando ? "Editar evento" : "Novo evento"}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            Eventos aparecem no calendário com a cor da entidade responsável.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={enviar}>
          <Campo rotulo="Nome do evento" htmlFor="evento-nome" erro={erros.nome} obrigatorio>
            <Input
              id="evento-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Reunião geral de membros"
            />
          </Campo>

          {entidadesDisponiveis && entidadesDisponiveis.length > 0 && (
            <Campo rotulo="Entidade" erro={erros.entidade} obrigatorio>
              <Select value={entidadeId} onValueChange={setEntidadeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a entidade" />
                </SelectTrigger>
                <SelectContent>
                  {entidadesDisponiveis.map((entidade) => (
                    <SelectItem key={entidade.id} value={entidade.id}>
                      {entidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <Campo rotulo="Data" htmlFor="evento-data" erro={erros.data} obrigatorio>
              <Input
                id="evento-data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </Campo>
            <Campo rotulo="Início" htmlFor="evento-inicio" erro={erros.horario} obrigatorio>
              <Input
                id="evento-inicio"
                type="time"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
            </Campo>
            <Campo rotulo="Fim (opcional)" htmlFor="evento-fim">
              <Input
                id="evento-fim"
                type="time"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
              />
            </Campo>
          </div>

          <Campo rotulo="Local" htmlFor="evento-local">
            <Input
              id="evento-local"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Ex.: Ágora 101"
            />
          </Campo>

          <Campo rotulo="Descrição" htmlFor="evento-descricao">
            <Textarea
              id="evento-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes, público esperado, materiais necessários…"
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
              {editando ? "Salvar alterações" : "Criar evento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
