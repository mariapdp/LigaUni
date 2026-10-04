import { Building2, ShieldCheck, UsersRound } from "lucide-react";

import { PainelEntidades } from "@/components/admin/painel-entidades";
import { PainelMembros } from "@/components/admin/painel-membros";
import { PainelUsuarios } from "@/components/admin/painel-usuarios";
import { CabecalhoPagina } from "@/components/shared/cabecalho-pagina";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminEntidades() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <CabecalhoPagina
        titulo="Entidades e membros"
        descricao="Cadastre entidades, acompanhe todos os membros e cursos e gerencie o acesso de administração."
      />

      <Tabs defaultValue="entidades" className="flex flex-col gap-5">
        <TabsList className="w-full justify-start border border-border bg-card p-1 sm:w-auto">
          <TabsTrigger value="entidades" className="gap-2">
            <Building2 className="size-4" />
            Entidades
          </TabsTrigger>
          <TabsTrigger value="membros" className="gap-2">
            <UsersRound className="size-4" />
            Membros
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-2">
            <ShieldCheck className="size-4" />
            Usuários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entidades" className="mt-0">
          <PainelEntidades />
        </TabsContent>
        <TabsContent value="membros" className="mt-0">
          <PainelMembros />
        </TabsContent>
        <TabsContent value="usuarios" className="mt-0">
          <PainelUsuarios />
        </TabsContent>
      </Tabs>
    </div>
  );
}
