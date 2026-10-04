import { useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  ClipboardList,
  DoorOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { MarcaLiga } from "@/components/shared/marca-liga";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAutenticacao } from "@/hooks/use-auth";
import { useEntidades, useReservas } from "@/hooks/use-dados";
import { iniciais, ROTULO_PAPEL, type Papel } from "@/lib/domain";
import { cn } from "@/lib/utils";

interface ItemNavegacao {
  para: string;
  rotulo: string;
  icone: LucideIcon;
  exato?: boolean;
}

const NAVEGACAO: Record<Papel, ItemNavegacao[]> = {
  lider: [
    { para: "/lider", rotulo: "Minha entidade", icone: Building2, exato: true },
    { para: "/lider/equipes", rotulo: "Equipes e membros", icone: UsersRound },
    { para: "/lider/calendario", rotulo: "Calendário", icone: CalendarDays },
    { para: "/lider/reservas", rotulo: "Reservas", icone: ClipboardList },
  ],
  admin: [
    { para: "/admin", rotulo: "Dashboard", icone: LayoutDashboard, exato: true },
    { para: "/admin/entidades", rotulo: "Entidades e membros", icone: Building2 },
    { para: "/admin/calendario", rotulo: "Calendário geral", icone: CalendarDays },
    { para: "/admin/reservas", rotulo: "Reservas", icone: ClipboardList },
    { para: "/admin/salas", rotulo: "Salas do Ágora", icone: DoorOpen },
  ],
};

interface PropsNavegacao {
  papel: Papel;
  pendentes: number;
  aoSelecionar?: () => void;
}

function ListaNavegacao({ papel, pendentes, aoSelecionar }: PropsNavegacao) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      <p className="px-3 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/60">
        {papel === "admin" ? "Administração" : "Gestão da entidade"}
      </p>
      {NAVEGACAO[papel].map((item) => (
        <NavLink
          key={item.para}
          to={item.para}
          end={item.exato}
          onClick={aoSelecionar}
          className={({ isActive }) =>
            cn(
              "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150",
              isActive
                ? "bg-primary/12 text-primary"
                : "text-sidebar-foreground hover:bg-secondary/70 hover:text-foreground",
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute inset-y-1.5 -left-3 w-[3px] rounded-full bg-gradient-brand" />
              )}
              <item.icone className="size-[18px] shrink-0" />
              <span className="truncate">{item.rotulo}</span>
              {item.para.endsWith("reservas") && pendentes > 0 && (
                <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                  {pendentes}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppShell() {
  const { perfil, papeis, entidadeId, sair } = useAutenticacao();
  const { data: entidades } = useEntidades();
  const { data: reservas } = useReservas();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  const papel: Papel = papeis.includes("admin") ? "admin" : "lider";

  const pendentes = useMemo(() => {
    const lista = reservas ?? [];
    const filtradas =
      papel === "admin"
        ? lista
        : lista.filter((reserva) => !entidadeId || reserva.entidade_id === entidadeId);
    return filtradas.filter((reserva) => reserva.status === "pendente").length;
  }, [reservas, papel, entidadeId]);

  const nomeEntidade = useMemo(
    () => entidades?.find((entidade) => entidade.id === entidadeId)?.nome ?? null,
    [entidades, entidadeId],
  );

  const nome = perfil?.nome ?? perfil?.email ?? "Usuário";

  const aoSair = async () => {
    await sair();
    navigate("/login", { replace: true });
  };

  const rodape = (
    <div className="mt-auto border-t border-sidebar-border p-3">
      <div className="flex items-center gap-3 rounded-md bg-secondary/50 p-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-background font-display text-xs font-bold text-primary">
          {iniciais(nome)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-foreground">{nome}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {nomeEntidade ?? ROTULO_PAPEL[papel]}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Sair"
          title="Sair"
          onClick={() => void aoSair()}
        >
          <LogOut />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh w-full bg-background">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <MarcaLiga />
        </div>
        <ListaNavegacao papel={papel} pendentes={pendentes} />
        {rodape}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col border-sidebar-border bg-sidebar p-0">
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              <div className="flex h-16 items-center border-b border-sidebar-border px-5">
                <MarcaLiga />
              </div>
              <ListaNavegacao
                papel={papel}
                pendentes={pendentes}
                aoSelecionar={() => setMenuAberto(false)}
              />
              {rodape}
            </SheetContent>
          </Sheet>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0 lg:hidden">
              <MarcaLiga tamanho="sm" />
            </div>
            <Badge variant="brand" className="hidden sm:inline-flex">
              {ROTULO_PAPEL[papel]}
            </Badge>
            {nomeEntidade && (
              <span className="hidden truncate text-[13px] text-muted-foreground md:inline">
                {nomeEntidade}
              </span>
            )}
          </div>

          <div className="hidden items-center gap-2 text-[13px] text-muted-foreground sm:flex">
            <CalendarDays className="size-4 text-primary" />
            <span>Ágora · Campus Joinville</span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
