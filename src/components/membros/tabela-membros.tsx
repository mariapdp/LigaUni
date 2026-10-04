import { useMemo, useState } from "react";
import { Filter, Pencil, Plus, Search, Trash2, UserRound } from "lucide-react";

import { EstadoVazio } from "@/components/shared/estado-vazio";
import { EtiquetaEntidade } from "@/components/shared/ponto-entidade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { iniciais, type Entidade, type Equipe, type Membro } from "@/lib/domain";

const TODOS = "todos";

interface PropsTabelaMembros {
  membros: Membro[];
  equipes: Equipe[];
  entidades?: Entidade[];
  podeGerenciar?: boolean;
  aoEditar: (membro: Membro) => void;
  aoExcluir: (membro: Membro) => void;
  aoCriar?: () => void;
}

export function TabelaMembros({
  membros,
  equipes,
  entidades,
  podeGerenciar = true,
  aoEditar,
  aoExcluir,
  aoCriar,
}: PropsTabelaMembros) {
  const [busca, setBusca] = useState("");
  const [filtroEquipe, setFiltroEquipe] = useState(TODOS);
  const [filtroCurso, setFiltroCurso] = useState(TODOS);
  const [filtroUniversidade, setFiltroUniversidade] = useState(TODOS);

  const mostrarEntidade = Boolean(entidades && entidades.length > 0);

  const cursos = useMemo(
    () => Array.from(new Set(membros.map((m) => m.curso).filter(Boolean) as string[])).sort(),
    [membros],
  );
  const universidades = useMemo(
    () =>
      Array.from(new Set(membros.map((m) => m.universidade).filter(Boolean) as string[])).sort(),
    [membros],
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return membros.filter((membro) => {
      if (filtroEquipe !== TODOS) {
        if (filtroEquipe === "sem" ? membro.equipe_id !== null : membro.equipe_id !== filtroEquipe) {
          return false;
        }
      }
      if (filtroCurso !== TODOS && membro.curso !== filtroCurso) return false;
      if (filtroUniversidade !== TODOS && membro.universidade !== filtroUniversidade) return false;
      if (!termo) return true;
      return [membro.nome, membro.curso, membro.universidade, membro.funcao]
        .filter(Boolean)
        .some((campo) => campo!.toLowerCase().includes(termo));
    });
  }, [membros, busca, filtroEquipe, filtroCurso, filtroUniversidade]);

  const nomeEquipe = (id: string | null) =>
    id ? (equipes.find((equipe) => equipe.id === id)?.nome ?? "—") : "Sem equipe";

  const entidadeDoMembro = (id: string) => entidades?.find((entidade) => entidade.id === id) ?? null;

  const limparFiltros = () => {
    setBusca("");
    setFiltroEquipe(TODOS);
    setFiltroCurso(TODOS);
    setFiltroUniversidade(TODOS);
  };

  const temFiltroAtivo =
    Boolean(busca) ||
    filtroEquipe !== TODOS ||
    filtroCurso !== TODOS ||
    filtroUniversidade !== TODOS;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, curso, universidade ou função"
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 lg:flex lg:w-auto">
          <Select value={filtroEquipe} onValueChange={setFiltroEquipe}>
            <SelectTrigger className="lg:w-44">
              <SelectValue placeholder="Equipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas as equipes</SelectItem>
              <SelectItem value="sem">Sem equipe</SelectItem>
              {equipes.map((equipe) => (
                <SelectItem key={equipe.id} value={equipe.id}>
                  {equipe.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtroCurso} onValueChange={setFiltroCurso}>
            <SelectTrigger className="lg:w-44">
              <SelectValue placeholder="Curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos os cursos</SelectItem>
              {cursos.map((curso) => (
                <SelectItem key={curso} value={curso}>
                  {curso}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtroUniversidade} onValueChange={setFiltroUniversidade}>
            <SelectTrigger className="lg:w-40">
              <SelectValue placeholder="Universidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas</SelectItem>
              {universidades.map((universidade) => (
                <SelectItem key={universidade} value={universidade}>
                  {universidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {temFiltroAtivo && (
            <Button variant="ghost" size="sm" onClick={limparFiltros}>
              <Filter />
              Limpar
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtrados.length} de {membros.length} membros exibidos.
      </p>

      {filtrados.length === 0 ? (
        <EstadoVazio
          icone={UserRound}
          titulo={membros.length === 0 ? "Nenhum membro cadastrado" : "Nada encontrado"}
          descricao={
            membros.length === 0
              ? "Cadastre os membros com nome, curso, universidade e função."
              : "Ajuste a busca ou limpe os filtros para ver mais resultados."
          }
          acao={
            membros.length === 0 && aoCriar ? (
              <Button size="sm" onClick={aoCriar}>
                <Plus />
                Adicionar membro
              </Button>
            ) : (
              temFiltroAtivo && (
                <Button variant="outline" size="sm" onClick={limparFiltros}>
                  Limpar filtros
                </Button>
              )
            )
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="min-w-[200px]">Membro</TableHead>
                {mostrarEntidade && <TableHead>Entidade</TableHead>}
                <TableHead>Curso</TableHead>
                <TableHead>Universidade</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead>Função</TableHead>
                {podeGerenciar && <TableHead className="w-[90px] text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((membro) => {
                const entidade = mostrarEntidade ? entidadeDoMembro(membro.entidade_id) : null;
                return (
                  <TableRow key={membro.id} className="border-border/70">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-secondary font-display text-[11px] font-bold text-primary">
                          {iniciais(membro.nome)}
                        </span>
                        <span className="font-medium text-foreground">{membro.nome}</span>
                      </div>
                    </TableCell>
                    {mostrarEntidade && (
                      <TableCell>
                        {entidade ? (
                          <EtiquetaEntidade cor={entidade.cor} nome={entidade.nome} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-muted-foreground">{membro.curso ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {membro.universidade ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutro">{nomeEquipe(membro.equipe_id)}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{membro.funcao ?? "—"}</TableCell>
                    {podeGerenciar && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Editar ${membro.nome}`}
                            onClick={() => aoEditar(membro)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Remover ${membro.nome}`}
                            className="hover:text-destructive"
                            onClick={() => aoExcluir(membro)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
