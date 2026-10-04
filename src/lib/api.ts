import { supabase } from "@/integrations/supabase/client";
import type {
  Entidade,
  Equipe,
  Evento,
  Membro,
  Perfil,
  Reserva,
  ReservaStatus,
  Sala,
} from "./domain";

function falhar(error: unknown): never {
  const mensagem =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : "Não foi possível concluir a operação.";
  throw new Error(mensagem);
}

/* ---------------------------------- entidades --------------------------------- */

export async function listarEntidades(): Promise<Entidade[]> {
  const { data, error } = await supabase
    .from("entidades")
    .select("id,nome,descricao,cor,criado_em")
    .order("nome");
  if (error) falhar(error);
  return data ?? [];
}

export async function criarEntidade(dados: {
  nome: string;
  descricao: string | null;
  cor: string;
}): Promise<Entidade> {
  const { data, error } = await supabase.from("entidades").insert(dados).select().single();
  if (error) falhar(error);
  return data;
}

export async function atualizarEntidade(
  id: string,
  dados: Partial<Pick<Entidade, "nome" | "descricao" | "cor">>,
): Promise<Entidade> {
  const { data, error } = await supabase
    .from("entidades")
    .update(dados)
    .eq("id", id)
    .select()
    .single();
  if (error) falhar(error);
  return data;
}

export async function removerEntidade(id: string): Promise<void> {
  const { error } = await supabase.from("entidades").delete().eq("id", id);
  if (error) falhar(error);
}

/* ------------------------------------ salas ----------------------------------- */

export async function listarSalas(): Promise<Sala[]> {
  const { data, error } = await supabase
    .from("salas")
    .select("id,nome,capacidade,recursos,ativa,criado_em")
    .order("nome");
  if (error) falhar(error);
  return data ?? [];
}

export async function criarSala(dados: {
  nome: string;
  capacidade: number;
  recursos: string | null;
  ativa: boolean;
}): Promise<void> {
  const { error } = await supabase.from("salas").insert(dados);
  if (error) falhar(error);
}

export async function atualizarSala(
  id: string,
  dados: Partial<Pick<Sala, "nome" | "capacidade" | "recursos" | "ativa">>,
): Promise<void> {
  const { error } = await supabase.from("salas").update(dados).eq("id", id);
  if (error) falhar(error);
}

export async function removerSala(id: string): Promise<void> {
  const { error } = await supabase.from("salas").delete().eq("id", id);
  if (error) falhar(error);
}

/* ----------------------------------- equipes ---------------------------------- */

export async function listarEquipes(): Promise<Equipe[]> {
  const { data, error } = await supabase
    .from("equipes")
    .select("id,entidade_id,nome,criado_em")
    .order("nome");
  if (error) falhar(error);
  return data ?? [];
}

export async function criarEquipe(dados: { entidade_id: string; nome: string }): Promise<void> {
  const { error } = await supabase.from("equipes").insert(dados);
  if (error) falhar(error);
}

export async function atualizarEquipe(id: string, nome: string): Promise<void> {
  const { error } = await supabase.from("equipes").update({ nome }).eq("id", id);
  if (error) falhar(error);
}

export async function removerEquipe(id: string): Promise<void> {
  const { error } = await supabase.from("equipes").delete().eq("id", id);
  if (error) falhar(error);
}

/* ----------------------------------- membros ---------------------------------- */

export async function listarMembros(): Promise<Membro[]> {
  const { data, error } = await supabase
    .from("membros")
    .select("id,entidade_id,equipe_id,nome,curso,universidade,funcao,criado_em")
    .order("nome");
  if (error) falhar(error);
  return data ?? [];
}

export interface MembroEntrada {
  entidade_id: string;
  equipe_id: string | null;
  nome: string;
  curso: string | null;
  universidade: string | null;
  funcao: string | null;
}

export async function criarMembro(dados: MembroEntrada): Promise<void> {
  const { error } = await supabase.from("membros").insert(dados);
  if (error) falhar(error);
}

export async function atualizarMembro(id: string, dados: MembroEntrada): Promise<void> {
  const { error } = await supabase.from("membros").update(dados).eq("id", id);
  if (error) falhar(error);
}

export async function removerMembro(id: string): Promise<void> {
  const { error } = await supabase.from("membros").delete().eq("id", id);
  if (error) falhar(error);
}

/* ----------------------------------- eventos ---------------------------------- */

export async function listarEventos(): Promise<Evento[]> {
  const { data, error } = await supabase
    .from("eventos")
    .select("id,entidade_id,nome,data,horario_inicio,horario_fim,local,descricao,criado_em")
    .order("data");
  if (error) falhar(error);
  return data ?? [];
}

export interface EventoEntrada {
  entidade_id: string;
  nome: string;
  data: string;
  horario_inicio: string;
  horario_fim: string | null;
  local: string | null;
  descricao: string | null;
}

export async function criarEvento(dados: EventoEntrada): Promise<void> {
  const { error } = await supabase.from("eventos").insert(dados);
  if (error) falhar(error);
}

export async function atualizarEvento(id: string, dados: EventoEntrada): Promise<void> {
  const { error } = await supabase.from("eventos").update(dados).eq("id", id);
  if (error) falhar(error);
}

export async function removerEvento(id: string): Promise<void> {
  const { error } = await supabase.from("eventos").delete().eq("id", id);
  if (error) falhar(error);
}

/* ---------------------------------- reservas ---------------------------------- */

export async function listarReservas(): Promise<Reserva[]> {
  const { data, error } = await supabase
    .from("reservas")
    .select(
      "id,sala_id,entidade_id,solicitante_id,finalidade,data,hora_inicio,hora_fim,status,justificativa_admin,criado_em",
    )
    .order("data", { ascending: false });
  if (error) falhar(error);
  return data ?? [];
}

export interface ReservaEntrada {
  sala_id: string;
  entidade_id: string;
  solicitante_id: string;
  finalidade: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
}

export async function criarReserva(dados: ReservaEntrada): Promise<void> {
  const { error } = await supabase.from("reservas").insert({ ...dados, status: "pendente" });
  if (error) falhar(error);
}

export async function atualizarReserva(
  id: string,
  dados: Partial<ReservaEntrada>,
): Promise<void> {
  const { error } = await supabase.from("reservas").update(dados).eq("id", id);
  if (error) falhar(error);
}

export async function definirStatusReserva(
  id: string,
  status: ReservaStatus,
  justificativa: string | null,
): Promise<void> {
  const { error } = await supabase
    .from("reservas")
    .update({ status, justificativa_admin: justificativa })
    .eq("id", id);
  if (error) falhar(error);
}

export async function removerReserva(id: string): Promise<void> {
  const { error } = await supabase.from("reservas").delete().eq("id", id);
  if (error) falhar(error);
}

/* ------------------------------ perfis e papéis ------------------------------- */

export async function listarPerfis(): Promise<Perfil[]> {
  const { data, error } = await supabase
    .from("liga_profiles")
    .select("id,nome,email,criado_em")
    .order("nome");
  if (error) falhar(error);
  return data ?? [];
}

export async function atualizarPerfil(id: string, nome: string): Promise<void> {
  const { error } = await supabase.from("liga_profiles").update({ nome }).eq("id", id);
  if (error) falhar(error);
}

export interface VinculoLider {
  user_id: string;
  entidade_id: string;
}

export async function listarVinculos(): Promise<VinculoLider[]> {
  const { data, error } = await supabase
    .from("lideres_entidades")
    .select("user_id,entidade_id");
  if (error) falhar(error);
  return data ?? [];
}

export async function listarAdministradores(): Promise<string[]> {
  const { data, error } = await supabase.from("user_roles").select("user_id,role").eq("role", "admin");
  if (error) falhar(error);
  return (data ?? []).map((linha) => linha.user_id);
}

export async function promoverAdmin(userId: string): Promise<void> {
  const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
  if (error) falhar(error);
}

export async function rebaixarAdmin(userId: string): Promise<void> {
  const { error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role", "admin");
  if (error) falhar(error);
}
