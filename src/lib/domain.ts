import type { Database } from "@/integrations/supabase/types";

type Tabelas = Database["public"]["Tables"];

export type Entidade = Tabelas["entidades"]["Row"];
export type Equipe = Tabelas["equipes"]["Row"];
export type Membro = Tabelas["membros"]["Row"];
export type Evento = Tabelas["eventos"]["Row"];
export type Sala = Tabelas["salas"]["Row"];
export type Reserva = Tabelas["reservas"]["Row"];
export type Perfil = Tabelas["liga_profiles"]["Row"];

export type ReservaStatus = Reserva["status"];
export type Papel = Tabelas["user_roles"]["Row"]["role"];

export interface EntidadeResumo {
  id: string;
  nome: string;
  cor: string;
}

export interface EventoDetalhado extends Evento {
  entidade: EntidadeResumo | null;
}

export interface ReservaDetalhada extends Reserva {
  salaNome: string;
  salaCapacidade: number;
  entidadeNome: string;
  entidadeCor: string;
  solicitanteNome: string | null;
}

export const COR_PADRAO = "#FA5C04";

export const ROTULO_PAPEL: Record<Papel, string> = {
  lider: "Líder de entidade",
  admin: "Administrador",
};

export const STATUS_RESERVA: Record<
  ReservaStatus,
  { rotulo: string; descricao: string }
> = {
  pendente: {
    rotulo: "Pendente",
    descricao: "Aguardando análise da administração",
  },
  aprovada: {
    rotulo: "Aprovada",
    descricao: "Sala confirmada para o horário solicitado",
  },
  recusada: {
    rotulo: "Recusada",
    descricao: "Solicitação não atendida pela administração",
  },
};

export const PALETA = [
  "#FA5C04",
  "#16A34A",
  "#DC2626",
  "#EAB308",
  "#0891B2",
  "#9333EA",
  "#0D9488",
  "#2563EB",
  "#DB2777",
  "#65A30D",
  "#4F46E5",
  "#C026D3",
];

/** Converte uma cor hexadecimal em rgba com a opacidade informada. */
export function comAlfa(hex: string, alpha: number): string {
  const limpo = (hex || COR_PADRAO).replace("#", "").trim();
  const completo =
    limpo.length === 3
      ? limpo
          .split("")
          .map((c) => c + c)
          .join("")
      : limpo;
  const numero = Number.parseInt(completo, 16);
  if (Number.isNaN(numero) || completo.length !== 6) {
    return `rgba(250, 92, 4, ${alpha})`;
  }
  const r = (numero >> 16) & 255;
  const g = (numero >> 8) & 255;
  const b = numero & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
