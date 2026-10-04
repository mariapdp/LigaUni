import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import { EstadoVazio } from "@/components/shared/estado-vazio";
import { EtiquetaEntidade } from "@/components/shared/ponto-entidade";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAutenticacao } from "@/hooks/use-auth";
import {
  chaves,
  useAdministradores,
  useEntidades,
  usePerfis,
  useVinculos,
} from "@/hooks/use-dados";
import { promoverAdmin, rebaixarAdmin } from "@/lib/api";
import { iniciais } from "@/lib/domain";

export function PainelUsuarios() {
  const queryClient = useQueryClient();
  const { usuario } = useAutenticacao();
  const { data: perfis } = usePerfis();
  const { data: vinculos } = useVinculos();
  const { data: administradores } = useAdministradores();
  const { data: entidades } = useEntidades();

  const invalidar = () => void queryClient.invalidateQueries({ queryKey: chaves.admins });

  const promover = useMutation({
    mutationFn: (userId: string) => promoverAdmin(userId),
    onSuccess: () => {
      invalidar();
      toast.success("Usuário promovido a administrador.");
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  const rebaixar = useMutation({
    mutationFn: (userId: string) => rebaixarAdmin(userId),
    onSuccess: () => {
      invalidar();
      toast.success("Acesso de administrador removido.");
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  const entidadesDoUsuario = useMemo(() => {
    const mapa = new Map<string, string[]>();
    for (const vinculo of vinculos ?? []) {
      const lista = mapa.get(vinculo.user_id) ?? [];
      lista.push(vinculo.entidade_id);
      mapa.set(vinculo.user_id, lista);
    }
    return mapa;
  }, [vinculos]);

  const lista = perfis ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários da plataforma</CardTitle>
        <CardDescription>
          Novos cadastros entram como líder da entidade escolhida. Use a chave para conceder acesso
          de administração.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {lista.length === 0 ? (
          <EstadoVazio
            icone={UserRound}
            titulo="Nenhum usuário cadastrado"
            descricao="Assim que alguém criar uma conta, ela aparece nesta lista."
          />
        ) : (
          lista.map((perfil) => {
            const ehAdmin = (administradores ?? []).includes(perfil.id);
            const ehVoce = perfil.id === usuario?.id;
            const ids = (entidadesDoUsuario.get(perfil.id) ?? [])
              .map((id) => entidades?.find((entidade) => entidade.id === id))
              .filter(Boolean);

            return (
              <div
                key={perfil.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background/40 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-secondary font-display text-[11px] font-bold text-primary">
                    {iniciais(perfil.nome ?? perfil.email ?? "?")}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                      <span className="truncate">{perfil.nome ?? "Sem nome"}</span>
                      {ehVoce && <Badge variant="brand">você</Badge>}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {perfil.email ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {ids.length > 0 ? (
                    ids.map(
                      (entidade) =>
                        entidade && (
                          <EtiquetaEntidade
                            key={entidade.id}
                            cor={entidade.cor}
                            nome={entidade.nome}
                          />
                        ),
                    )
                  ) : (
                    <Badge variant="neutro">Sem entidade</Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Label
                    htmlFor={`admin-${perfil.id}`}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground"
                  >
                    <ShieldCheck className={ehAdmin ? "size-4 text-primary" : "size-4"} />
                    Admin
                  </Label>
                  <Switch
                    id={`admin-${perfil.id}`}
                    checked={ehAdmin}
                    disabled={ehVoce || promover.isPending || rebaixar.isPending}
                    onCheckedChange={(valor) =>
                      valor ? promover.mutate(perfil.id) : rebaixar.mutate(perfil.id)
                    }
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
