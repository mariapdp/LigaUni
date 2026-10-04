import type { Reserva } from "./domain";

/** Duas faixas de horário se sobrepõem quando o início de uma é anterior ao fim da outra. */
export function horariosSobrepostos(
  inicioA: string,
  fimA: string,
  inicioB: string,
  fimB: string,
): boolean {
  return inicioA < fimB && inicioB < fimA;
}

/** Procura reservas aprovadas que colidem com a faixa solicitada na mesma sala e data. */
export function reservasEmConflito(
  reservas: Reserva[],
  alvo: { sala_id: string; data: string; hora_inicio: string; hora_fim: string; id?: string },
): Reserva[] {
  return reservas.filter(
    (reserva) =>
      reserva.status === "aprovada" &&
      reserva.sala_id === alvo.sala_id &&
      reserva.data === alvo.data &&
      reserva.id !== alvo.id &&
      horariosSobrepostos(alvo.hora_inicio, alvo.hora_fim, reserva.hora_inicio, reserva.hora_fim),
  );
}
