import { useContext } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { MoneyContext } from "../../contexts/GlobalState";
import MonthYearFilter from "../../components/MonthYearFilter";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";

const LARGURA = Dimensions.get("window").width;

function brl(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Summary() {
  const { summary, filtro, alterarFiltro, loading } = useContext(MoneyContext);
  const { income = 0, expense = 0, balance = 0, byCategory = [] } = summary;

  // Apenas categorias de despesa com valor > 0 entram no gráfico
  const despesas = byCategory.filter((c) => !c.isIncome && c.total > 0);

  const dadosPizza = despesas.map((c) => ({
    name: c.displayName,
    population: Number(c.total),
    color: c.background,
    legendFontColor: "#555",
    legendFontSize: 11,
  }));

  if (loading) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={globalStyles.screenContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Filtro de mês/ano */}
        <MonthYearFilter
          month={filtro.month}
          year={filtro.year}
          onChange={alterarFiltro}
        />

        {/* Cards receita / despesa */}
        <View style={styles.cards}>
          <View style={[styles.card, styles.cardReceita]}>
            <Text style={styles.cardRotulo}>Receitas</Text>
            <Text style={[styles.cardValor, { color: colors.positiveText }]}>
              {brl(income)}
            </Text>
          </View>
          <View style={[styles.card, styles.cardDespesa]}>
            <Text style={styles.cardRotulo}>Despesas</Text>
            <Text style={[styles.cardValor, { color: colors.negativeText }]}>
              {brl(expense)}
            </Text>
          </View>
        </View>

        {/* Saldo */}
        <View style={styles.saldoRow}>
          <Text style={styles.saldoLabel}>Saldo do período</Text>
          <Text
            style={[
              styles.saldoValor,
              { color: balance >= 0 ? colors.positiveText : colors.negativeText },
            ]}
          >
            {brl(balance)}
          </Text>
        </View>

        {/* Gráfico de pizza — despesas por categoria */}
        <View style={styles.graficoBox}>
          <Text style={styles.graficoTitulo}>Despesas por categoria</Text>
          {dadosPizza.length > 0 ? (
            <PieChart
              data={dadosPizza}
              width={LARGURA - 32}
              height={210}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              absolute={false}
            />
          ) : (
            <Text style={[globalStyles.secondaryText, styles.semDados]}>
              Sem despesas registradas neste período.
            </Text>
          )}
        </View>

        {/* Detalhamento por categoria */}
        {byCategory.length > 0 && (
          <View style={styles.listaBox}>
            <Text style={styles.graficoTitulo}>Detalhamento</Text>
            {byCategory.map((c) => (
              <View key={c.categoryId} style={styles.linha}>
                <View style={[styles.bolinha, { backgroundColor: c.background }]} />
                <Text style={styles.linhaLabel}>{c.displayName}</Text>
                <Text
                  style={[
                    styles.linhaValor,
                    { color: c.isIncome ? colors.positiveText : colors.negativeText },
                  ]}
                >
                  {brl(c.total)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cards: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  cardReceita: { borderLeftColor: colors.positiveText },
  cardDespesa: { borderLeftColor: colors.negativeText },
  cardRotulo: { color: "#888", fontSize: 12, fontWeight: "600" },
  cardValor:  { fontSize: 16, fontWeight: "800", marginTop: 4 },
  saldoRow: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  saldoLabel: { color: "#555", fontSize: 14, fontWeight: "700" },
  saldoValor: { fontSize: 18, fontWeight: "800" },
  graficoBox: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  graficoTitulo: {
    fontSize: 15,
    fontWeight: "800",
    color: "#333",
    marginBottom: 10,
  },
  semDados: {
    textAlign: "center",
    paddingVertical: 20,
  },
  listaBox: {
    marginTop: 14,
    marginHorizontal: 16,
    marginBottom: 32,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  bolinha: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  linhaLabel: { flex: 1, color: "#333", fontSize: 14 },
  linhaValor: { fontSize: 14, fontWeight: "700" },
});
