# Gestão Financeira — App

Aplicativo mobile de gestão financeira pessoal construído com **React Native + Expo**. Consome a API REST do projeto `gestao-financeira-api`.

---

## Funcionalidades

- Login e cadastro de conta com autenticação JWT
- Listagem de transações com filtro por **mês e ano**
- Adição de transações (receitas e despesas)
- **Edição e exclusão** de transações via long press
- Gerenciamento de categorias (criar e excluir categorias personalizadas)
- Tela de **resumo financeiro** com gráfico de pizza por categoria
- Sessão persistente (fica logado mesmo fechando o app)

---

## Pré-requisitos

| Ferramenta | Descrição | Download |
|---|---|---|
| Node.js 18+ | Runtime do JavaScript | https://nodejs.org |
| Expo Go | App no celular para rodar o projeto | App Store / Google Play |
| **API rodando** | O backend precisa estar no ar | Ver `gestao-financeira-api/README.md` |

> O app **não funciona sem a API**. Siga o README do backend antes de continuar.

---

## Passo a passo — configuração inicial

### 1. Instalar dependências

Abra um terminal **dentro da pasta `gestao-financeira/`** e execute:

```bash
npm install
```

---

### 2. Descobrir o IP do seu computador

O app no celular precisa saber o endereço da API rodando no seu PC.

**Windows:**
```
Abra o CMD e execute:  ipconfig
```
Procure **"Endereço IPv4"** dentro do adaptador Wi-Fi. Será algo como `192.168.x.x`.

**macOS / Linux:**
```bash
ifconfig | grep "inet "
```

> O celular e o computador precisam estar na **mesma rede Wi-Fi**.

---

### 3. Criar o arquivo `.env`

Na raiz de `gestao-financeira/`, crie um arquivo chamado `.env` com o IP encontrado no passo anterior:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_AQUI:3000
```

Exemplo com IP `192.168.1.77`:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.77:3000
```

> Após criar ou alterar o `.env`, **sempre reinicie o Expo** para as variáveis serem recarregadas.

---

### 4. Iniciar o app

```bash
npx expo start
```

Um QR Code vai aparecer no terminal. Abra o **Expo Go** no celular e escaneie o QR Code.

> **iOS:** use a câmera nativa para escanear. Ela abre automaticamente no Expo Go.  
> **Android:** abra o Expo Go, toque em "Scan QR code" e escaneie.

---

## Usando o app

### Login
Na primeira tela, você pode:
- Entrar com o **usuário demo**: `demo@financas.com` / `demo123`
- Criar uma conta nova tocando em "Não tem conta? Cadastre-se"

### Tela Transações
- Lista todas as transações do mês/ano selecionado
- Use os **chips de mês e ano** no topo para filtrar
- **Long press** em uma transação abre o menu de Editar ou Excluir
- Puxe a lista para baixo (**pull to refresh**) para recarregar do servidor

### Tela Categorias
- Lista todas as categorias (5 padrão + suas personalizadas)
- Preencha o formulário no topo para criar uma nova categoria
- Categorias padrão (Renda, Alimentação, Casa, Educação, Viagens) **não podem ser excluídas**

### Tela Adicionar Transação (botão central ➕)
- Preencha descrição, valor, data e escolha a categoria
- Toque em "Adicionar" para salvar

### Tela Resumo
- Mostra receitas totais, despesas totais e saldo do período filtrado
- Gráfico de pizza com a distribuição de despesas por categoria

---

## Estrutura de pastas

```
gestao-financeira/
├─ app/
│  ├─ _layout.jsx            ← layout raiz (providers de auth e estado global)
│  ├─ login.jsx              ← tela de login
│  ├─ register.jsx           ← tela de cadastro
│  └─ (tabs)/
│     ├─ _layout.jsx         ← layout das abas (guarda de autenticação + header)
│     ├─ index.jsx           ← aba Transações
│     ├─ categories.jsx      ← aba Categorias
│     ├─ add-transactions.jsx← aba Adicionar Transação
│     └─ summary.jsx         ← aba Resumo
├─ components/
│  ├─ MonthYearFilter.jsx    ← filtro de mês/ano por chips
│  ├─ EditTransactionModal.jsx← modal de edição de transação
│  ├─ TransactionItem.jsx    ← item da lista de transações
│  ├─ CategoryItem.jsx       ← bolinha colorida da categoria
│  └─ SummaryItem.jsx        ← linha do resumo por categoria
├─ contexts/
│  ├─ AuthContext.jsx        ← gerencia login/logout/sessão persistente
│  └─ GlobalState.jsx        ← gerencia dados (transações, categorias, resumo, filtro)
├─ services/
│  └─ api.js                 ← cliente HTTP (todas as chamadas à API)
├─ constants/
│  └─ colors.js              ← paleta de cores do app
├─ styles/
│  └─ globalStyles.js        ← estilos compartilhados
├─ .env                      ← URL da API (NÃO versionar)
└─ package.json
```

---

## Problemas comuns

### "Tempo esgotado" / "Network request failed"

O app não conseguiu falar com a API. Verifique:
1. A API está rodando? (`npm run dev` na pasta `gestao-financeira-api/`)
2. O IP no `.env` está correto? (use `ipconfig` para confirmar)
3. O celular e o PC estão na mesma rede Wi-Fi?
4. Após corrigir o `.env`, rode `npx expo start --clear` para limpar o cache

### "Tempo esgotado" no emulador Android

No emulador, o `localhost` do app aponta para o próprio emulador. Troque o IP para:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

### App não atualiza após mudar o `.env`

Pare o Expo com `Ctrl+C` e reinicie com:
```bash
npx expo start --clear
```

### Tela de login em branco / erro ao entrar

A API pode não ter o usuário demo criado. Na pasta da API, execute:
```bash
npm run prisma:seed
```

---

## Rodando os dois projetos em paralelo

Para o fluxo completo funcionar, você precisa de **dois terminais abertos**:

| Terminal | Pasta | Comando |
|---|---|---|
| 1 | `gestao-financeira-api/` | `npm run dev` |
| 2 | `gestao-financeira/` | `npx expo start` |

Sempre suba a **API primeiro**, depois o Expo.
