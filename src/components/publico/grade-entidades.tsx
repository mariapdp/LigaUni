import { comAlfa, iniciais, type Entidade } from "@/lib/domain";

export function GradeEntidades({ entidades }: { entidades: Entidade[] }) {
  return (
    <section id="entidades" className="border-b border-border">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            Entidades
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {entidades.length} entidades já cadastradas
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Cada entidade tem sua própria cor no calendário consolidado, equipes, membros e
            histórico de reservas.
          </p>
        </div>

        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entidades.map((entidade) => (
            <article
              key={entidade.id}
              className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm transition-[transform,border-color] duration-200 hover:-translate-y-0.5"
              style={{ borderColor: undefined }}
            >
              <span
                className="absolute inset-x-0 top-0 h-0.5"
                style={{ backgroundColor: entidade.cor }}
                aria-hidden="true"
              />
              <div className="flex items-center gap-2.5">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-md font-display text-[11px] font-bold"
                  style={{
                    backgroundColor: comAlfa(entidade.cor, 0.18),
                    color: entidade.cor,
                    boxShadow: `inset 0 0 0 1px ${comAlfa(entidade.cor, 0.45)}`,
                  }}
                  aria-hidden="true"
                >
                  {iniciais(entidade.nome)}
                </span>
                <h3 className="font-display text-[15px] font-semibold leading-tight text-foreground">
                  {entidade.nome}
                </h3>
              </div>
              {entidade.descricao && (
                <p className="mt-2.5 line-clamp-3 text-[12.5px] leading-relaxed text-muted-foreground">
                  {entidade.descricao}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
