const RECURSOS = [
  ["Equipes e membros", "Cadastro com curso, universidade e função, com busca e filtros por equipe, curso ou instituição."],
  ["Calendário de eventos", "Visão mensal e semanal com a cor de cada entidade. Criar, editar e excluir eventos em poucos cliques."],
  ["Reservas do Ágora", "Solicite salas com data e horário. A administração aprova ou recusa, e a justificativa fica registrada."],
  ["Papéis separados", "Líderes acessam só a própria entidade. A administração enxerga o panorama completo."],
  ["Fila de aprovação", "Pendências, histórico filtrável e alerta de conflito de horário antes de cada aprovação."],
  ["Sem choque de agenda", "Reservas sobrepostas na mesma sala são bloqueadas, pela interface e pelo banco."],
];

const FLUXO = [
  ["1", "Crie a conta e escolha a entidade", "O cadastro entra como líder da entidade selecionada."],
  ["2", "Organize equipes, membros e eventos", "Monte o time e publique o calendário do semestre."],
  ["3", "Reserve as salas do Ágora", "Envie a solicitação e acompanhe até a aprovação."],
];

export function RecursosPublico() {
  return (
    <>
      <section id="recursos" className="border-b border-border">
        <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_2fr] lg:py-20">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            O que dá para fazer por aqui
          </h2>
          <dl className="divide-y divide-border border-y border-border">
            {RECURSOS.map(([titulo, texto]) => (
              <div key={titulo} className="grid gap-1 py-4 sm:grid-cols-[210px_1fr] sm:gap-6">
                <dt className="font-display font-bold">{titulo}</dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">{texto}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="fluxo" className="border-b border-border bg-sidebar">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Do cadastro à sala reservada
          </h2>
          <ol className="mt-9 grid gap-8 md:grid-cols-3">
            {FLUXO.map(([n, titulo, texto]) => (
              <li key={n} className="flex gap-4">
                <span className="font-display text-5xl font-extrabold leading-none text-primary">
                  {n}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold">{titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}