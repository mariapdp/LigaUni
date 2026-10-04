const MESES_LONGOS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** Cria uma Date local a partir de "YYYY-MM-DD" (sem deslocamento de fuso). */
export function criarData(iso: string): Date {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, (mes ?? 1) - 1, dia ?? 1);
}

/** Converte uma Date local em "YYYY-MM-DD". */
export function paraISO(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function hojeISO(): string {
  return paraISO(new Date());
}

export function formatarData(iso: string): string {
  const data = criarData(iso);
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${data.getFullYear()}`;
}

export function formatarDataLonga(iso: string): string {
  const data = criarData(iso);
  return `${data.getDate()} de ${MESES_LONGOS[data.getMonth()]} de ${data.getFullYear()}`;
}

export function formatarDiaSemana(iso: string): string {
  return DIAS_CURTOS[criarData(iso).getDay()];
}

export function nomeMes(data: Date): string {
  return MESES_LONGOS[data.getMonth()];
}

export function mesAno(data: Date): string {
  const mes = MESES_LONGOS[data.getMonth()];
  return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} de ${data.getFullYear()}`;
}

export function formatarHorario(horario: string | null | undefined): string {
  if (!horario) return "—";
  return horario.slice(0, 5);
}

export function formatarIntervalo(
  inicio: string | null | undefined,
  fim: string | null | undefined,
): string {
  if (!inicio) return "—";
  if (!fim) return formatarHorario(inicio);
  return `${formatarHorario(inicio)} – ${formatarHorario(fim)}`;
}

export function inicioDoMes(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}

export function fimDoMes(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth() + 1, 0);
}

export function adicionarMeses(data: Date, quantidade: number): Date {
  return new Date(data.getFullYear(), data.getMonth() + quantidade, 1);
}

export function adicionarDias(data: Date, quantidade: number): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate() + quantidade);
}

/** Semana começando no domingo. */
export function inicioDaSemana(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate() - data.getDay());
}

/** 42 dias cobrindo o mês informado, começando no domingo. */
export function gradeDoMes(data: Date): Date[] {
  const primeiro = inicioDaSemana(inicioDoMes(data));
  return Array.from({ length: 42 }, (_, indice) => adicionarDias(primeiro, indice));
}

export function diasDaSemana(data: Date): Date[] {
  const inicio = inicioDaSemana(data);
  return Array.from({ length: 7 }, (_, indice) => adicionarDias(inicio, indice));
}

export function mesmoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function rotuloDiaCurto(data: Date): string {
  return DIAS_CURTOS[data.getDay()];
}

/** "seg, 06/10" */
export function rotuloDiaCompleto(data: Date): string {
  return `${DIAS_CURTOS[data.getDay()]}, ${String(data.getDate()).padStart(2, "0")}/${String(
    data.getMonth() + 1,
  ).padStart(2, "0")}`;
}

/** "06/10/2026" a partir de uma Date. */
export function dataParaBR(data: Date): string {
  return formatarData(paraISO(data));
}
