import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  listarAdministradores,
  listarEntidades,
  listarEquipes,
  listarEventos,
  listarMembros,
  listarPerfis,
  listarReservas,
  listarSalas,
  listarVinculos,
} from "@/lib/api";
import type { EventoDetalhado, ReservaDetalhada } from "@/lib/domain";

export const chaves = {
  entidades: ["entidades"] as const,
  salas: ["salas"] as const,
  equipes: ["equipes"] as const,
  membros: ["membros"] as const,
  eventos: ["eventos"] as const,
  reservas: ["reservas"] as const,
  perfis: ["perfis"] as const,
  vinculos: ["vinculos"] as const,
  admins: ["admins"] as const,
};

export function useEntidades() {
  return useQuery({ queryKey: chaves.entidades, queryFn: listarEntidades });
}

export function useSalas() {
  return useQuery({ queryKey: chaves.salas, queryFn: listarSalas });
}

export function useEquipes() {
  return useQuery({ queryKey: chaves.equipes, queryFn: listarEquipes });
}

export function useMembros() {
  return useQuery({ queryKey: chaves.membros, queryFn: listarMembros });
}

export function useEventos() {
  return useQuery({ queryKey: chaves.eventos, queryFn: listarEventos });
}

export function useReservas() {
  return useQuery({ queryKey: chaves.reservas, queryFn: listarReservas });
}

export function usePerfis() {
  return useQuery({ queryKey: chaves.perfis, queryFn: listarPerfis });
}

export function useVinculos() {
  return useQuery({ queryKey: chaves.vinculos, queryFn: listarVinculos });
}

export function useAdministradores() {
  return useQuery({ queryKey: chaves.admins, queryFn: listarAdministradores });
}

/** Eventos enriquecidos com a entidade de origem (cor usada no calendário). */
export function useEventosDetalhados() {
  const { data: eventos, isLoading: carregandoEventos } = useEventos();
  const { data: entidades, isLoading: carregandoEntidades } = useEntidades();

  const dados = useMemo<EventoDetalhado[]>(() => {
    const mapa = new Map((entidades ?? []).map((entidade) => [entidade.id, entidade]));
    return (eventos ?? []).map((evento) => {
      const entidade = mapa.get(evento.entidade_id);
      return {
        ...evento,
        entidade: entidade ? { id: entidade.id, nome: entidade.nome, cor: entidade.cor } : null,
      };
    });
  }, [eventos, entidades]);

  return { dados, carregando: carregandoEventos || carregandoEntidades };
}

/** Reservas enriquecidas com sala, entidade e solicitante. */
export function useReservasDetalhadas() {
  const { data: reservas, isLoading: carregandoReservas } = useReservas();
  const { data: salas, isLoading: carregandoSalas } = useSalas();
  const { data: entidades, isLoading: carregandoEntidades } = useEntidades();
  const { data: perfis } = usePerfis();

  const dados = useMemo<ReservaDetalhada[]>(() => {
    const mapaSalas = new Map((salas ?? []).map((sala) => [sala.id, sala]));
    const mapaEntidades = new Map((entidades ?? []).map((entidade) => [entidade.id, entidade]));
    const mapaPerfis = new Map((perfis ?? []).map((perfil) => [perfil.id, perfil.nome]));

    return (reservas ?? []).map((reserva) => {
      const sala = mapaSalas.get(reserva.sala_id);
      const entidade = mapaEntidades.get(reserva.entidade_id);
      return {
        ...reserva,
        salaNome: sala?.nome ?? "Sala removida",
        salaCapacidade: sala?.capacidade ?? 0,
        entidadeNome: entidade?.nome ?? "Entidade removida",
        entidadeCor: entidade?.cor ?? "#FA5C04",
        solicitanteNome: reserva.solicitante_id
          ? (mapaPerfis.get(reserva.solicitante_id) ?? null)
          : null,
      };
    });
  }, [reservas, salas, entidades, perfis]);

  return {
    dados,
    carregando: carregandoReservas || carregandoSalas || carregandoEntidades,
  };
}
