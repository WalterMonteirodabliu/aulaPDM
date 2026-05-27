import { useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  Pressable, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../constants/colors";

export default function RegisterScreen() {
  const { cadastrar } = useAuth();
  const router = useRouter();

  const [nome,     setNome]     = useState("");
  const [email,    setEmail]    = useState("");
  const [senha,    setSenha]    = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro,     setErro]     = useState(null);

  async function handleCadastro() {
    setErro(null);
    if (!nome.trim() || !email.trim() || !senha) { setErro("Preencha todos os campos."); return; }
    if (senha.length < 6) { setErro("Senha deve ter pelo menos 6 caracteres."); return; }
    try {
      setEnviando(true);
      await cadastrar({ name: nome.trim(), email: email.trim(), password: senha });
      router.replace("/(tabs)");
    } catch (e) {
      setErro(e.message ?? "Erro ao criar conta.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.tela}>
      <View style={s.cartao}>
        <Text style={s.titulo}>Criar conta</Text>
        <Text style={s.subtitulo}>Preencha seus dados para começar</Text>

        <Text style={s.rotulo}>Nome</Text>
        <TextInput style={s.campo} value={nome} onChangeText={setNome} placeholder="Seu nome completo" />

        <Text style={s.rotulo}>E-mail</Text>
        <TextInput style={s.campo} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="seu@email.com" />

        <Text style={s.rotulo}>Senha</Text>
        <TextInput style={s.campo} value={senha} onChangeText={setSenha} secureTextEntry placeholder="Mínimo 6 caracteres" />

        {erro ? <Text style={s.erro}>{erro}</Text> : null}

        <Pressable style={[s.btn, enviando && { opacity: 0.7 }]} onPress={handleCadastro} disabled={enviando}>
          {enviando ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTexto}>Criar conta</Text>}
        </Pressable>

        <Pressable onPress={() => router.push("/login")} style={s.linkArea}>
          <Text style={s.link}>Já tenho conta — fazer login</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  tela:     { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f0f0f0" },
  cartao:   { backgroundColor: "#fff", borderRadius: 16, padding: 24, gap: 10, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8 },
  titulo:   { fontSize: 22, fontWeight: "800", color: "#333" },
  subtitulo:{ color: "#888", marginBottom: 8 },
  rotulo:   { color: "#555", fontSize: 13, fontWeight: "600", marginBottom: -4 },
  campo:    { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14 },
  erro:     { color: "#DA5567", fontSize: 13 },
  btn:      { backgroundColor: colors.primary, paddingVertical: 13, borderRadius: 8, alignItems: "center", marginTop: 4 },
  btnTexto: { color: "#fff", fontWeight: "700", fontSize: 15 },
  linkArea: { alignItems: "center" },
  link:     { color: colors.primary, fontWeight: "600" },
});
