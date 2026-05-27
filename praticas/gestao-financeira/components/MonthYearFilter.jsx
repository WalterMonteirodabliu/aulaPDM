import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export default function MonthYearFilter({ month, year, onChange }) {
  const anoAtual = new Date().getFullYear();
  const anos = [anoAtual - 1, anoAtual, anoAtual + 1];

  return (
    <View style={s.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.fileira}>
        {MESES.map((label, i) => {
          const num = i + 1;
          const ativo = num === month;
          return (
            <Pressable key={num} style={[s.chip, ativo && s.chipAtivo]} onPress={() => onChange({ month: num, year })}>
              <Text style={[s.texto, ativo && s.textoAtivo]}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.fileira}>
        {anos.map((a) => {
          const ativo = a === year;
          return (
            <Pressable key={a} style={[s.chip, ativo && s.chipAtivo]} onPress={() => onChange({ month, year: a })}>
              <Text style={[s.texto, ativo && s.textoAtivo]}>{a}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:  { paddingHorizontal: 16, paddingTop: 10, gap: 6 },
  fileira:    { gap: 6, paddingBottom: 2 },
  chip:       { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: "#ccc", backgroundColor: "#fff" },
  chipAtivo:  { backgroundColor: colors.primary, borderColor: colors.primary },
  texto:      { color: "#666", fontSize: 12 },
  textoAtivo: { color: "#fff", fontWeight: "700", fontSize: 12 },
});
