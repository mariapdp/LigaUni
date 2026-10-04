import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { LayoutAutenticacao } from "@/components/auth/layout-autenticacao";
import { RedirecionarPorPapel } from "@/components/auth/rota-protegida";
import { Campo } from "@/components/shared/campo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAutenticacao } from "@/hooks/use-auth";
import { useEntidades } from "@/hooks/use-dados";
import { supabase } from "@/integrations/supabase/client";

interface Erros {
  nome?: string;
  email?: string;
  senha?: string;
  confirmacao?: string;
  entidade?: string;
}

export default function Cadastro() {
  const navigate = useNavigate();
  const { usuario, carregando } = useAutenticacao();
  const { data: entidades } = useEntidades();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [entidadeId, setEntidadeId] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);

  if (!carregando && usuario) return <RedirecionarPorPapel />;

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();

    const novosErros: Erros = {};
    if (!nome.trim()) novosErros.nome = "Informe seu nome completo.";
    if (!email.trim()) novosErros.email = "Informe um e-mail válido.";
    if (senha.length < 6) novosErros.senha = "A senha precisa de pelo menos 6 caracteres.";
    if (senha !== confirmacao) novosErros.confirmacao = "As senhas não coincidem.";
    if (!entidadeId) novosErros.entidade = "Escolha a entidade que você representa.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setEnviando(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { nome: nome.trim(), entidade_id: entidadeId },
      },
    });
    setEnviando(false);

    if (error) {
      toast.error(
        error.message.includes("already registered")
          ? "Este e-mail já possui cadastro. Tente entrar."
          : "Não foi possível concluir o cadastro.",
      );
      return;
    }

    if (!data.session) {
      toast.success("Cadastro criado. Confirme o e-mail para entrar.");
      navigate("/login", { replace: true });
      return;
    }

    toast.success("Bem-vindo(a) à Liga UNI!");
    navigate("/lider", { replace: true });
  };

  return (
    <LayoutAutenticacao
      titulo="Cadastrar líder"
      subtitulo="Novas contas entram como líder da entidade escolhida. A promoção a administrador é feita por um admin."
      rodape={
        <>
          Já tem conta?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={enviar}>
        <Campo rotulo="Nome completo" htmlFor="cad-nome" erro={erros.nome} obrigatorio>
          <Input
            id="cad-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Como você quer ser chamado(a)"
          />
        </Campo>

        <Campo rotulo="E-mail" htmlFor="cad-email" erro={erros.email} obrigatorio>
          <Input
            id="cad-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@universidade.br"
          />
        </Campo>

        <Campo
          rotulo="Sua entidade"
          erro={erros.entidade}
          dica="Você poderá editar as informações dessa entidade no painel."
          obrigatorio
        >
          <Select value={entidadeId} onValueChange={setEntidadeId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a entidade" />
            </SelectTrigger>
            <SelectContent>
              {(entidades ?? []).map((entidade) => (
                <SelectItem key={entidade.id} value={entidade.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: entidade.cor }}
                      aria-hidden="true"
                    />
                    {entidade.nome}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Senha" htmlFor="cad-senha" erro={erros.senha} obrigatorio>
            <Input
              id="cad-senha"
              type="password"
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </Campo>
          <Campo rotulo="Confirmar senha" htmlFor="cad-confirmacao" erro={erros.confirmacao} obrigatorio>
            <Input
              id="cad-confirmacao"
              type="password"
              autoComplete="new-password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder="Repita a senha"
            />
          </Campo>
        </div>

        <Button type="submit" size="lg" disabled={enviando} className="w-full">
          {enviando ? <Loader2 className="size-4 animate-spin" /> : <UserPlus />}
          Criar conta
        </Button>
      </form>
    </LayoutAutenticacao>
  );
}
