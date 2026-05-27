# Gestão Financeira — API

API REST construída com **Node.js + Express + Prisma + MySQL** para o app de gestão financeira da disciplina de PDM.

---

## Funcionalidades

- Autenticação com JWT (cadastro, login, sessão persistente)
- CRUD completo de **categorias** (padrão + personalizadas)
- CRUD completo de **transações** com filtro por mês/ano
- Endpoint de **resumo financeiro** (receitas, despesas, saldo, breakdown por categoria)
- Validação de dados com **Zod**
- Proteção de exclusão de categorias padrão

---

## Pré-requisitos

Antes de começar, instale:

| Ferramenta | Versão mínima | Download |
|---|---|---|
| Node.js | 18 LTS ou superior | https://nodejs.org |
| MySQL Server | 8.0 | https://dev.mysql.com/downloads/mysql/ |
| MySQL Workbench *(opcional, para visualizar o banco)* | 8.0 | https://dev.mysql.com/downloads/workbench/ |
| Postman *(para testar os endpoints)* | qualquer | https://www.postman.com/downloads/ |

> **Windows:** durante a instalação do MySQL, anote bem a senha que você definir para o usuário `root`. Você vai precisar dela no passo 3.

---

## Passo a passo — configuração inicial

### 1. Instalar dependências do projeto

Abra um terminal **dentro da pasta `gestao-financeira-api/`** e execute:

```bash
npm install
```

---

### 2. Iniciar o MySQL

O banco de dados precisa estar rodando antes de qualquer coisa.

**Windows (como Administrador):**
```bash
net start MySQL80
```

**macOS / Linux:**
```bash
sudo service mysql start
# ou
brew services start mysql   # se instalou com Homebrew
```

Para confirmar que está rodando, abra o **MySQL Workbench** e tente conectar. Se conectar, está ok.

---

### 3. Criar o banco de dados

No **MySQL Workbench** (ou em qualquer cliente MySQL), execute:

```sql
CREATE DATABASE gestao_financeira
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Só precisa fazer isso uma vez.

---

### 4. Criar o arquivo `.env`

Na raiz de `gestao-financeira-api/`, crie um arquivo chamado `.env` com o conteúdo abaixo. **Troque `SUA_SENHA` pela senha do seu MySQL root:**

```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/gestao_financeira"
PORT=3000
JWT_SECRET="minha-chave-secreta-aqui"
JWT_EXPIRES_IN="7d"
```

Exemplo com senha `root123`:
```env
DATABASE_URL="mysql://root:root123@localhost:3306/gestao_financeira"
PORT=3000
JWT_SECRET="minha-chave-secreta-aqui"
JWT_EXPIRES_IN="7d"
```

> O arquivo `.env` nunca deve ser enviado para o GitHub (já está no `.gitignore`).

---

### 5. Rodar as migrations

As migrations criam as tabelas no banco automaticamente:

```bash
npx prisma migrate dev --name init
```

Se aparecer a pergunta `Are you sure you want to create and apply this migration?`, digite **y** e pressione Enter.

Após rodar, as tabelas `User`, `Category` e `Transaction` estarão criadas no banco.

---

### 6. Popular o banco com dados iniciais (seed)

O seed cria as **5 categorias padrão** e o **usuário demo** para testes:

```bash
npm run prisma:seed
```

Saída esperada:
```
Usuário demo criado: demo@financas.com / demo123
Seed concluído.
```

> Pode rodar o seed quantas vezes quiser — ele usa `upsert` e não duplica dados.

---

### 7. Iniciar o servidor

```bash
npm run dev
```

Saída esperada:
```
API rodando em http://localhost:3000
```

Deixe esse terminal aberto. Para testar se está funcionando, abra o navegador em `http://localhost:3000` e deve aparecer:

```json
{ "ok": true, "name": "gestao-financeira-api" }
```

---

## Testando os endpoints com Postman

A collection do Postman já está pronta no repositório. Para importar:

1. Abra o Postman
2. Clique em **Import**
3. Selecione o arquivo `postman/collection.json`
4. A collection **"Projeto backend"** vai aparecer no menu lateral

### Ordem recomendada de testes

| Requisição | Método | URL |
|---|---|---|
| Health-check | GET | `http://localhost:3000/` |
| Listar categorias | GET | `http://localhost:3000/categories` |
| Criar categoria | POST | `http://localhost:3000/categories` |
| Atualizar categoria | PUT | `http://localhost:3000/categories/:id` |
| Excluir categoria (custom) | DELETE | `http://localhost:3000/categories/:id` |
| Excluir categoria padrão ❌ | DELETE | `http://localhost:3000/categories/:id` |
| Criar transação | POST | `http://localhost:3000/transactions` |
| Listar transações | GET | `http://localhost:3000/transactions` |
| Listar com filtro | GET | `http://localhost:3000/transactions?month=4&year=2026` |
| Resumo financeiro | GET | `http://localhost:3000/transactions/summary?month=4&year=2026` |
| Excluir transação | DELETE | `http://localhost:3000/transactions/:id` |
| Validação Zod ❌ | POST | `http://localhost:3000/transactions` (body inválido) |

> **Dica:** ao criar uma categoria ou transação, copie o `id` retornado — você vai precisar dele para os testes de atualizar/excluir.

### Exemplo — criar transação

No Postman, com `POST http://localhost:3000/transactions`, body **raw → JSON**:

```json
{
  "description": "Salário de outubro",
  "value": 3500.50,
  "date": "2026-04-29",
  "categoryId": "ID_DA_CATEGORIA_INCOME_AQUI"
}
```

### Resposta de erro esperada — body inválido

Ao enviar `{ "description": "" }` para `POST /transactions`:

```json
{
  "error": "Dados inválidos",
  "details": [
    { "message": "String must contain at least 1 character(s)", "path": ["description"] },
    { "message": "Required", "path": ["value"] },
    ...
  ]
}
```

---

## Endpoints da API

### Auth

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Cadastra novo usuário |
| POST | `/auth/login` | Faz login, retorna token JWT |
| GET | `/auth/me` | Retorna dados do usuário autenticado |

### Categorias

| Método | Rota | Descrição |
|---|---|---|
| GET | `/categories` | Lista todas as categorias |
| POST | `/categories` | Cria nova categoria |
| PUT | `/categories/:id` | Atualiza categoria |
| DELETE | `/categories/:id` | Remove categoria (bloqueia se for padrão) |

### Transações

| Método | Rota | Descrição |
|---|---|---|
| GET | `/transactions` | Lista transações (aceita `?month=&year=`) |
| GET | `/transactions/summary` | Resumo financeiro (aceita `?month=&year=`) |
| POST | `/transactions` | Cria transação |
| PUT | `/transactions/:id` | Atualiza transação |
| DELETE | `/transactions/:id` | Remove transação |

---

## Estrutura de pastas

```
gestao-financeira-api/
├─ postman/
│  └─ collection.json        ← collection do Postman pronta para importar
├─ prisma/
│  ├─ schema.prisma          ← modelos do banco (User, Category, Transaction)
│  ├─ seed.js                ← cria categorias padrão + usuário demo
│  └─ migrations/            ← histórico das migrations (gerado automaticamente)
├─ src/
│  ├─ server.js              ← ponto de entrada da API
│  ├─ lib/
│  │  └─ prisma.js           ← instância única do PrismaClient
│  ├─ middlewares/
│  │  ├─ auth.js             ← middleware de autenticação JWT
│  │  └─ errorHandler.js     ← tratamento central de erros
│  ├─ routes/
│  │  ├─ auth.js             ← rotas de autenticação
│  │  ├─ categories.js       ← rotas de categorias
│  │  └─ transactions.js     ← rotas de transações
│  └─ schemas/
│     ├─ authSchema.js       ← validação Zod para auth
│     ├─ categorySchema.js   ← validação Zod para categorias
│     └─ transactionSchema.js← validação Zod para transações
├─ .env                      ← variáveis de ambiente (NÃO versionar)
├─ .env.example              ← modelo do .env (pode versionar)
└─ package.json
```

---

## Scripts disponíveis

```bash
npm run dev           # inicia em modo desenvolvimento (hot reload com nodemon)
npm run start         # inicia em modo produção
npm run prisma:seed   # popula o banco com dados iniciais
npm run prisma:migrate# roda as migrations pendentes
npm run prisma:studio # abre interface visual do banco no navegador (localhost:5555)
```

---

## Usuário demo (para testes no app)

| Campo | Valor |
|---|---|
| E-mail | demo@financas.com |
| Senha | demo123 |

Criado automaticamente pelo `npm run prisma:seed`.
