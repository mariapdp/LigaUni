import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Papel, Perfil } from "@/lib/domain";

interface ValorAutenticacao {
  sessao: Session | null;
  usuario: User | null;
  perfil: Perfil | null;
  papeis: Papel[];
  entidadeId: string | null;
  carregando: boolean;
  isAdmin: boolean;
  isLider: boolean;
  sair: () => Promise<void>;
}

const ContextoAutenticacao = createContext<ValorAutenticacao | undefined>(undefined);

export function ProvedorAutenticacao({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [papeis, setPapeis] = useState<Papel[]>([]);
  const [entidadeId, setEntidadeId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const limpar = useCallback(() => {
    setPerfil(null);
    setPapeis([]);
    setEntidadeId(null);
    setCarregando(false);
  }, []);

  const carregarDados = useCallback(async (userId: string) => {
    const [respostaPerfil, respostaPapeis, respostaVinculo] = await Promise.all([
      supabase.from("liga_profiles").select("id,nome,email,criado_em").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("lideres_entidades").select("entidade_id").eq("user_id", userId).limit(1),
    ]);

    setPerfil(respostaPerfil.data ?? null);
    setPapeis((respostaPapeis.data ?? []).map((linha) => linha.role as Papel));
    setEntidadeId(respostaVinculo.data?.[0]?.entidade_id ?? null);
    setCarregando(false);
  }, []);

  useEffect(() => {
    // O listener é registrado antes de restaurar a sessão para não perder o evento inicial.
    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
      setUsuario(novaSessao?.user ?? null);

      if (novaSessao?.user) {
        setTimeout(() => {
          void carregarDados(novaSessao.user.id);
        }, 0);
      } else {
        limpar();
      }
    });

    void supabase.auth.getSession().then(({ data: resultado }) => {
      const sessaoAtual = resultado.session;
      setSessao(sessaoAtual);
      setUsuario(sessaoAtual?.user ?? null);

      if (sessaoAtual?.user) {
        void carregarDados(sessaoAtual.user.id);
      } else {
        setCarregando(false);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [carregarDados, limpar]);

  const sair = useCallback(async () => {
    await supabase.auth.signOut();
    limpar();
  }, [limpar]);

  const valor = useMemo<ValorAutenticacao>(
    () => ({
      sessao,
      usuario,
      perfil,
      papeis,
      entidadeId,
      carregando,
      isAdmin: papeis.includes("admin"),
      isLider: papeis.includes("lider"),
      sair,
    }),
    [sessao, usuario, perfil, papeis, entidadeId, carregando, sair],
  );

  return (
    <ContextoAutenticacao.Provider value={valor}>{children}</ContextoAutenticacao.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAutenticacao(): ValorAutenticacao {
  const contexto = useContext(ContextoAutenticacao);
  if (!contexto) {
    throw new Error("useAutenticacao precisa estar dentro de ProvedorAutenticacao.");
  }
  return contexto;
}
