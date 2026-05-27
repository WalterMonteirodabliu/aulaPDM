import { useEffect, useMemo, useState } from "react";
import {
  Alert, Modal, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from "react-native";
import { colors } from "../constants/colors";

function dataParaTexto(d) {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;
}

function textoParaData(texto) {
  const m = String(texto).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return isFinite(d.getTime()) ? d : null;
}

export default function EditTransactionModal({ visivel, transacao, categorias, aoFechar, aoSalvar }) {
  const [descricao,   setDescricao]   = useState("");
  const [valor,       setValor]       = useState("");
  const [textoData,   setTextoData]   = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [salvando,    setSalvando]    = useState(false);

  useEffect(() => {
    if (visivel && transacao) {
      setDescricao(transacao.description ?? "");
      setValor(transacao.value != null ? String(transacao.value).replace(".", ",") : "");
      setTextoData(dataParaTexto(transacao.date) || dataParaTexto(new Date()));
      setCategoriaId(transacao.categoryId ?? transacao.category?.id ?? "");
    }
  }, [visivel, transacao]);

  const categoriasFiltradas = useMemo(
    () => categorias.filter((c) => c.isIncome === transacao?.category?.isIncome),
    [categorias, transacao],
  );

  async function handleSalvar() {
    if (!descricao.trim() || !valor || !categoriaId) {
      Alert.alert("Preencha descrição, valor e categoria.");
      return;
    }
    const valorNum = Number(String(valor).replace(",", "."));
    if (!isFinite(valorNum) || valorNum <= 0) {
      Alert.alert("Informe um valor válido maior que zero.");
      return;
    }
    const dataParsed = textoParaData(textoData);
    if (textoData && !dataParsed) {
      Alert.alert("Data inválida. Use DD/MM/AAAA.");
      return;
    }
    try {
      setSalvando(true);
      await aoSalvar({
        description: descricao.trim(),
        value: valorNum,
        categoryId,
        date: dataParsed ? dataParsed.toISOString() : undefined,
      });
      aoFechar();
    } catch (e) {
      Alert.alert("Erro ao salvar", e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal visible={visivel} animationType="slide" transparent onRequestClose={aoFechar}>
      <View style={s.fundo}>
        <View style={s.painel}>
          <ScrollView contentContainerStyle={s.corpo} keyboardShouldPersistTaps="handled">
            <Text style={s.titulo}>Editar transação</Text>

            <Text style={s.rotulo}>Descrição</Text>
            <TextInput style={s.campo} value={descricao} onChangeText={setDescricao} placeholder="Descrição" />

            <Text style={s.rotulo}>Valor</Text>
            <TextInput style={s.campo} value={valor} onChangeText={setValor} placeholder="0,00" keyboardType="decimal-pad" />

            <Text style={s.rotulo}>Data (DD/MM/AAAA)</Text>
            <TextInput style={s.campo} value={textoData} onChangeText={setTextoData} keyboardType="numbers-and-punctuation" />

            <Text style={s.rotulo}>Categoria</Text>
            <View style={s.chips}>
              {categoriasFiltradas.map((c) => (
                <Pressable
                  key={c.id}
                  style={[s.chip, categoriaId === c.id && { backgroundColor: c.background, borderColor: "#444", borderWidth: 2 }]}
                  onPress={() => setCategoriaId(c.id)}
                >
                  <Text style={[s.chipTexto, categoriaId === c.id && s.chipTextoAtivo]}>{c.displayName}</Text>
                </Pressable>
              ))}
            </View>

            <View style={s.acoes}>
              <Pressable style={[s.btn, s.btnCancelar]} onPress={aoFechar} disabled={salvando}>
                <Text style={s.btnCancelarTexto}>Cancelar</Text>
              </Pressable>
              <Pressable style={[s.btn, s.btnSalvar, salvando && { opacity: 0.7 }]} onPress={handleSalvar} disabled={salvando}>
                <Text style={s.btnSalvarTexto}>{salvando ? "Salvando…" : "Salvar"}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  fundo:           { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  painel:          { backgroundColor: "#fff", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: "85%" },
  corpo:           { gap: 8 },
  titulo:          { fontSize: 18, fontWeight: "800", color: "#333", marginBottom: 4 },
  rotulo:          { fontSize: 13, color: "#666", marginTop: 4 },
  campo:           { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  chips:           { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip:            { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: "#ccc" },
  chipTexto:       { color: "#666", fontSize: 12 },
  chipTextoAtivo:  { color: "#222", fontWeight: "800", fontSize: 12 },
  acoes:           { flexDirection: "row", gap: 10, marginTop: 12 },
  btn:             { flex: 1, paddingVertical: 13, borderRadius: 8, alignItems: "center" },
  btnCancelar:     { backgroundColor: "#eee" },
  btnCancelarTexto:{ color: "#333", fontWeight: "700" },
  btnSalvar:       { backgroundColor: colors.primary },
  btnSalvarTexto:  { color: "#fff", fontWeight: "700" },
});
