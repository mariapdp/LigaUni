import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import NotFound from "./pages/NotFound";
import LiderEntidade from "./pages/lider/MinhaEntidade";
import LiderEquipes from "./pages/lider/EquipesMembros";
import LiderCalendario from "./pages/lider/LiderCalendario";
import LiderReservas from "./pages/lider/LiderReservas";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEntidades from "./pages/admin/AdminEntidades";
import AdminCalendario from "./pages/admin/AdminCalendario";
import AdminReservas from "./pages/admin/AdminReservas";
import AdminSalas from "./pages/admin/AdminSalas";
import { AppShell } from "./components/layout/app-shell";
import { RedirecionarPorPapel, RotaProtegida } from "./components/auth/rota-protegida";

export const routers = [
  {
    path: "/",
    name: "home",
    element: <Index />,
  },
  {
    path: "/login",
    name: "login",
    element: <Login />,
  },
  {
    path: "/cadastro",
    name: "cadastro",
    element: <Cadastro />,
  },
  {
    path: "/painel",
    name: "painel",
    element: <RedirecionarPorPapel />,
  },
  {
    path: "/lider",
    element: (
      <RotaProtegida papel="lider">
        <AppShell />
      </RotaProtegida>
    ),
    children: [
      { path: "", name: "lider-entidade", element: <LiderEntidade /> },
      { path: "equipes", name: "lider-equipes", element: <LiderEquipes /> },
      { path: "calendario", name: "lider-calendario", element: <LiderCalendario /> },
      { path: "reservas", name: "lider-reservas", element: <LiderReservas /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <RotaProtegida papel="admin">
        <AppShell />
      </RotaProtegida>
    ),
    children: [
      { path: "", name: "admin-dashboard", element: <AdminDashboard /> },
      { path: "entidades", name: "admin-entidades", element: <AdminEntidades /> },
      { path: "calendario", name: "admin-calendario", element: <AdminCalendario /> },
      { path: "reservas", name: "admin-reservas", element: <AdminReservas /> },
      { path: "salas", name: "admin-salas", element: <AdminSalas /> },
    ],
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
