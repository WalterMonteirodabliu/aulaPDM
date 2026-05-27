import { useState, useContext } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MoneyContext } from "../../contexts/GlobalState";
import TransactionItem from "../../components/TransactionItem";
import MonthYearFilter from "../../components/MonthYearFilter";
import EditTransactionModal from "../../components/EditTransactionModal";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";

export default function Transactions() {
  const {
    transactions,
    categories,
    loading,
    error,
    refresh,
    filtro,
    alterarFiltro,
    removeTransaction,
    updateTransaction,
  } = useContext(MoneyContext);

  const [transacaoEditando, setTransacaoEditando] = useState(null);

  function confirmarExclusao(item) {
    Alert.alert(
      "Excluir transação",
      `Deseja excluir "${item.description}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await removeTransaction(item.id);
            } catch (e) {
              Alert.alert("Erro ao excluir", e.message ?? "Tente novamente.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  }

  function handleLongPress(item) {
    Alert.alert(
      item.description,
      "O que deseja fazer?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "✏️  Editar",
          onPress: () => setTransacaoEditando(item),
        },
        {
          text: "🗑️  Excluir",
          style: "destructive",
          onPress: () => confirmarExclusao(item),
        },
      ],
      { cancelable: true }
    );
  }

  if (loading && transactions.length === 0) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={globalStyles.secondaryText}>Carregando transações...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <Text style={globalStyles.primaryText}>Não foi possível carregar.</Text>
        <Text style={globalStyles.secondaryText}>{error}</Text>
        <TouchableOpacity onPress={refresh} style={styles.retry}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={globalStyles.screenContainer}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <MonthYearFilter
            month={filtro.month}
            year={filtro.year}
            onChange={alterarFiltro}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => handleLongPress(item)}
            activeOpacity={0.75}
            style={styles.itemWrapper}
          >
            <TransactionItem {...item} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[globalStyles.secondaryText, styles.vazio]}>
            Nenhuma transação neste período.{"\n"}Adicione na aba do meio! ➕
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        contentContainerStyle={styles.listContent}
      />

      {transacaoEditando !== null && (
        <EditTransactionModal
          visivel
          transacao={transacaoEditando}
          categorias={categories ?? []}
          aoFechar={() => setTransacaoEditando(null)}
          aoSalvar={async (dados) => {
            await updateTransaction(transacaoEditando.id, dados);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  itemWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
  },
  vazio: {
    textAlign: "center",
    marginTop: 48,
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  retry: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: colors.primaryContrast,
    fontWeight: "600",
  },
});
