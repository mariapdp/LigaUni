import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";

import { LayoutAutenticacao } from "@/components/auth/layout-autenticacao";
import { RedirecionarPorPapel } from "@/components/auth/rota-protegida";
import { Campo } from "@/components/shared/campo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAutenticacao } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const navigate = useNavigate();
  const { usuario, carregando } = useAutenticacao();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!carregando && usuario) return <RedirecionarPorPapel />;

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setErro(null);

    if (!email.trim() || !senha) {
      setErro("Informe e-mail e senha para entrar.");
      return;
    }

    setEnviando(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error || !data.user) {
      setEnviando(false);
      setErro("Não foi possível entrar. Confira o e-mail e a senha informados.");
      return;
    }

    const { data: papeis } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    const ehAdmin = (papeis ?? []).some((linha) => linha.role === "admin");
    setEnviando(false);
    navigate(ehAdmin ? "/admin" : "/lider", { replace: true });
  };

  return (
    <LayoutAutenticacao
      titulo="Entrar na Liga UNI"
      subtitulo="Acesse o painel da sua entidade ou a administração geral."
      rodape={
        <>
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="font-semibold text-primary hover:underline">
            Cadastre sua entidade
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={enviar}>
        <Campo rotulo="E-mail" htmlFor="login-email" obrigatorio>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@universidade.br"
          />
        </Campo>

        <Campo rotulo="Senha" htmlFor="login-senha" obrigatorio>
          <Input
            id="login-senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
          />
        </Campo>

        {erro && (
          <p className="rounded-md border border-destructive/40 bg-destructive/12 px-3 py-2 text-[13px] text-[hsl(0_84%_72%)]">
            {erro}
          </p>
        )}

        <Button type="submit" size="lg" disabled={enviando} className="w-full">
          {enviando ? <Loader2 className="size-4 animate-spin" /> : <LogIn />}
          Entrar
        </Button>
      </form>
    </LayoutAutenticacao>
  );
}
