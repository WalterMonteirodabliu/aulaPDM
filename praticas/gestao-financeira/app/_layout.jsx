import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../constants/colors";
import { AuthProvider } from "../contexts/AuthContext";
import GlobalState from "../contexts/GlobalState";

export default function RootLayout() {
  return (
    <AuthProvider>
      <GlobalState>
        <StatusBar backgroundColor={colors.primary} style="light" />
        <Stack>
          <Stack.Screen name="(tabs)"   options={{ headerShown: false }} />
          <Stack.Screen name="login"    options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </GlobalState>
    </AuthProvider>
  );
}
