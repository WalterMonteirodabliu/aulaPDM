import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const CHAVE_TOKEN = "@gestao:token";
const CHAVE_USER  = "@gestao:user";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,       setUser]       = useState(null);
  const [token,      setToken]      = useState(null);
  const [iniciando,  setIniciando]  = useState(true);

  // Restaura sessão salva
  useEffect(() => {
    (async () => {
      try {
        const [tkn, usr] = await Promise.all([
          AsyncStorage.getItem(CHAVE_TOKEN),
          AsyncStorage.getItem(CHAVE_USER),
        ]);
        if (tkn && usr) {
          api.setToken(tkn);
          setToken(tkn);
          setUser(JSON.parse(usr));
        }
      } catch (e) {
        console.warn("Falha ao restaurar sessão:", e);
      } finally {
        setIniciando(false);
      }
    })();
  }, []);

  const salvar = useCallback(async (novoUser, novoToken) => {
    api.setToken(novoToken);
    setToken(novoToken);
    setUser(novoUser);
    await AsyncStorage.multiSet([
      [CHAVE_TOKEN, novoToken],
      [CHAVE_USER,  JSON.stringify(novoUser)],
    ]);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { user: u, token: t } = await api.login({ email, password });
    await salvar(u, t);
    return u;
  }, [salvar]);

  const cadastrar = useCallback(async ({ name, email, password }) => {
    const { user: u, token: t } = await api.register({ name, email, password });
    await salvar(u, t);
    return u;
  }, [salvar]);

  const sair = useCallback(async () => {
    api.setToken(null);
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove([CHAVE_TOKEN, CHAVE_USER]);
  }, []);

  const valor = useMemo(
    () => ({ user, token, iniciando, logado: !!user, login, cadastrar, sair }),
    [user, token, iniciando, login, cadastrar, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
