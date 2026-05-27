import { Redirect, Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";

export default function TabsLayout() {
  const { user, logado, iniciando, sair } = useAuth();

  if (iniciando) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!logado) return <Redirect href="/login" />;

  const primeiroNome = user?.name?.split(" ")[0] ?? "usuário";

  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.primaryContrast,
        headerTitleAlign: "center",
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: { height: 60, paddingTop: 5, backgroundColor: colors.background },
        tabBarButton: (props) => <TouchableOpacity {...props} activeOpacity={0.8} />,
        headerRight: () => (
          <TouchableOpacity onPress={sair} style={st.btnSair}>
            <Text style={st.btnSairTexto}>Sair</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Transações",
          headerTitle: () => (
            <View style={st.headerTitulo}>
              <Text style={st.headerNomeApp}>Gestão Financeira</Text>
              <Text style={st.headerSaudacao}>Olá, {primeiroNome}! 👋</Text>
            </View>
          ),
          tabBarIcon: ({ color }) => <MaterialIcons name="attach-money" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categorias",
          tabBarIcon: ({ color }) => <MaterialIcons name="category" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-transactions"
        options={{
          title: "Adicionar Transação",
          tabBarLabel: "",
          tabBarIcon: () => (
            <View style={st.addBtn}>
              <MaterialIcons name="add" size={40} color={colors.primaryContrast} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: "Resumo",
          tabBarIcon: ({ color }) => <MaterialIcons name="pie-chart" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}

const st = StyleSheet.create({
  addBtn:          { alignItems: "center", justifyContent: "center", height: 64, width: 64, borderRadius: 32, backgroundColor: colors.primary },
  headerTitulo:    { alignItems: "center" },
  headerNomeApp:   { color: colors.primaryContrast, fontWeight: "800", fontSize: 16 },
  headerSaudacao:  { color: "rgba(255,255,255,0.85)", fontSize: 11 },
  btnSair:         { marginRight: 14, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 6 },
  btnSairTexto:    { color: "#fff", fontWeight: "700", fontSize: 12 },
});
