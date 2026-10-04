import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
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
import type { ReservaEntrada } from "@/lib/api";
import type { Reserva, Sala } from "@/lib/domain";
import { hojeISO } from "@/lib/format";
import { horariosSobrepostos } from "@/lib/reservas";

interface PropsDialogoReserva {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  salas: Sala[];
  reservas: Reserva[];
  entidadeId: string;
  solicitanteId: string;
  aoSalvar: (dados: ReservaEntrada) => Promise<void>;
}

interface Erros {
  sala?: string;
  data?: string;
  horario?: string;
  finalidade?: string;
}

export function DialogoReserva({
  aberto,
  aoMudarAberto,
  salas,
  reservas,
  entidadeId,
  solicitanteId,
  aoSalvar,
}: PropsDialogoReserva) {
  const [salaId, setSalaId] = useState("");
  const [data, setData] = useState(hojeISO());
  const [inicio, setInicio] = useState("18:00");
  const [fim, setFim] = useState("20:00");
  const [finalidade, setFinalidade] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);

  const salasAtivas = useMemo(() => salas.filter((sala) => sala.ativa), [salas]);

  useEffect(() => {
    if (!aberto) return;
    setSalaId(salasAtivas[0]?.id ?? "");
    setData(hojeISO());
    setInicio("18:00");
    setFim("20:00");
    setFinalidade("");
    setErros({});
  }, [aberto, salasAtivas]);

  const conflitos = useMemo(() => {
    if (!salaId || !data || !inicio || !fim || fim <= inicio) return [];
    return reservas.filter(
      (reserva) =>
        reserva.status === "aprovada" &&
        reserva.sala_id === salaId &&
        reserva.data === data &&
        horariosSobrepostos(inicio, fim, reserva.hora_inicio, reserva.hora_fim),
    );
  }, [reservas, salaId, data, inicio, fim]);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();

    const novosErros: Erros = {};
    if (!salaId) novosErros.sala = "Selecione a sala.";
    if (!data) novosErros.data = "Informe a data.";
    if (!inicio) novosErros.horario = "Informe o horário de início.";
    else if (!fim) novosErros.horario = "Informe o horário de término.";
    else if (fim <= inicio) novosErros.horario = "O horário final deve ser posterior ao inicial.";
    if (!finalidade.trim()) novosErros.finalidade = "Descreva a finalidade da reserva.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);
    try {
      await aoSalvar({
        sala_id: salaId,
        entidade_id: entidadeId,
        solicitante_id: solicitanteId,
        finalidade: finalidade.trim(),
        data,
        hora_inicio: inicio,
        hora_fim: fim,
      });
      toast.success("Solicitação enviada para a administração.");
      aoMudarAberto(false);
    } catch (erroSalvar) {
      toast.error(
        erroSalvar instanceof Error ? erroSalvar.message : "Não foi possível solicitar a reserva.",
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-border bg-popover shadow-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Solicitar sala do Ágora</DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            A solicitação entra como pendente e é analisada pela administração.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={enviar}>
          <Campo rotulo="Sala" erro={erros.sala} obrigatorio>
            <Select value={salaId} onValueChange={setSalaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a sala" />
              </SelectTrigger>
              <SelectContent>
                {salasAtivas.map((sala) => (
                  <SelectItem key={sala.id} value={sala.id}>
                    {sala.nome} · {sala.capacidade} lugares
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <div className="grid gap-4 sm:grid-cols-3">
            <Campo rotulo="Data" htmlFor="reserva-data" erro={erros.data} obrigatorio>
              <Input
                id="reserva-data"
                type="date"
                min={hojeISO()}
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </Campo>
            <Campo rotulo="Início" htmlFor="reserva-inicio" erro={erros.horario} obrigatorio>
              <Input
                id="reserva-inicio"
                type="time"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
            </Campo>
            <Campo rotulo="Fim" htmlFor="reserva-fim" obrigatorio>
              <Input
                id="reserva-fim"
                type="time"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
              />
            </Campo>
          </div>

          {conflitos.length > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-warning/35 bg-warning/10 px-3 py-2 text-[12.5px] leading-relaxed text-warning">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                Atenção: já existe reserva aprovada nesta sala para o horário selecionado (
                {conflitos[0].hora_inicio.slice(0, 5)}–{conflitos[0].hora_fim.slice(0, 5)}). A
                solicitação pode ser recusada.
              </span>
            </div>
          )}

          <Campo
            rotulo="Finalidade"
            htmlFor="reserva-finalidade"
            erro={erros.finalidade}
            obrigatorio
          >
            <Textarea
              id="reserva-finalidade"
              value={finalidade}
              onChange={(e) => setFinalidade(e.target.value)}
              placeholder="Ex.: Reunião de diretoria para planejamento do semestre"
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
            <Button type="submit" disabled={salvando || salasAtivas.length === 0}>
              {salvando && <Loader2 className="size-4 animate-spin" />}
              Enviar solicitação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
