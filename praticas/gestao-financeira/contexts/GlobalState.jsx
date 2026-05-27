import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

export const MoneyContext = createContext();

const hoje = new Date();
const FILTRO_INICIAL = { month: hoje.getMonth() + 1, year: hoje.getFullYear() };

export default function GlobalState({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [summary,      setSummary]      = useState({ income: 0, expense: 0, balance: 0, byCategory: [] });
  const [filtro,       setFiltro]       = useState(FILTRO_INICIAL);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const refresh = useCallback(async (f = filtro) => {
    setLoading(true);
    setError(null);
    try {
      const [cats, txs, sum] = await Promise.all([
        api.listCategories(),
        api.listTransactions(f),
        api.getSummary(f),
      ]);
      setCategories(cats);
      setTransactions(txs);
      setSummary(sum);
    } catch (e) {
      setError(e.message ?? "Falha ao carregar dados do servidor");
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => {
    refresh(filtro);
  }, [filtro.month, filtro.year]); // eslint-disable-line react-hooks/exhaustive-deps

  const alterarFiltro = useCallback((parcial) => {
    setFiltro((ant) => ({ ...ant, ...parcial }));
  }, []);

  const addTransaction = useCallback(async (data) => {
    const created = await api.createTransaction(data);
    setTransactions((prev) => [created, ...prev]);
    const sum = await api.getSummary(filtro);
    setSummary(sum);
    return created;
  }, [filtro]);

  const updateTransaction = useCallback(async (id, data) => {
    const updated = await api.updateTransaction(id, data);
    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
    const sum = await api.getSummary(filtro);
    setSummary(sum);
    return updated;
  }, [filtro]);

  const removeTransaction = useCallback(async (id) => {
    await api.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    const sum = await api.getSummary(filtro);
    setSummary(sum);
  }, [filtro]);

  const addCategory = useCallback(async (data) => {
    const created = await api.createCategory(data);
    setCategories((prev) =>
      [...prev, created].sort((a, b) => a.displayName.localeCompare(b.displayName))
    );
    return created;
  }, []);

  const removeCategory = useCallback(async (id) => {
    await api.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <MoneyContext.Provider value={{
      transactions, categories, summary, filtro, loading, error,
      refresh, alterarFiltro,
      addTransaction, updateTransaction, removeTransaction,
      addCategory, removeCategory,
    }}>
      {children}
    </MoneyContext.Provider>
  );
}

export function useMoney() {
  return useContext(MoneyContext);
}
