# Guia de Instalação e Configuração

## 🛠️ Pré-requisitos

Antes de começar, certifique-se que tem instalado:

- **Node.js** 18.17+ ([download](https://nodejs.org/))
- **npm** 9+ (vem com Node.js) ou **yarn**
- **Git** ([download](https://git-scm.com/))
- **PostgreSQL** 12+ (se usar localmente) OU acesso a um servidor PostgreSQL remoto (ex: Neon)

### Verificar versões instaladas

```bash
node --version      # v18.17+
npm --version       # 9+
git --version       # 2.40+
```

## 📥 1. Clonar e Instalar

```bash
# 1. Clonar o repositório
git clone https://github.com/Erasmo-Veloso/fundo-mutualista.git
cd fundo-mutualista

# 2. Instalar dependências
npm install

# Se tiver problemas, tente limpar a cache
npm cache clean --force
npm install
```

## ⚙️ 2. Configurar Banco de Dados

### Opção A: PostgreSQL Local

```bash
# Windows (se PostgreSQL estiver instalado)
# Criar um novo banco de dados
createdb fundo_mutualista

# Criar utilizador (opcional)
createuser fundo_user -P
```

### Opção B: Neon PostgreSQL (Recomendado para Produção)

1. Aceda a [https://neon.tech](https://neon.tech)
2. Crie uma conta e um novo projeto
3. Copie a connection string (DATABASE_URL)
4. Formato: `postgresql://user:password@host:5432/dbname`

## 🔑 3. Configurar Variáveis de Ambiente

### Criar arquivo `.env.local`

Copie o arquivo `.env.example`:

```bash
cp .env.example .env.local
```

### Editar `.env.local`

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/fundo_mutualista"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere_uma_chave_segura_aqui"

# Email (opcional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="seu_email@gmail.com"
EMAIL_SERVER_PASSWORD="sua_senha_app"
EMAIL_FROM="noreply@fundo-mutualista.com"
```

### Gerar NEXTAUTH_SECRET

```bash
# Via OpenSSL
openssl rand -base64 32

# Ou use um gerador online: https://generate-secret.vercel.app/
```

## 🗄️ 4. Configurar Banco de Dados com Prisma

```bash
# 1. Gerar cliente Prisma
npx prisma generate

# 2. Executar migrações
npx prisma migrate deploy

# 3. (Opcional) Seed do banco de dados
npx prisma db seed
```

### Se houver erro de conexão

```bash
# Verificar a connection string
echo $env:DATABASE_URL

# Testar conexão
npx prisma db execute --stdin << "EOF"
SELECT 1;
EOF
```

## 🚀 5. Iniciar o Servidor

### Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

### Produção

```bash
# Build
npm run build

# Start
npm start
```

## 👤 6. Criar Utilizador Administrador

Após iniciar o servidor:

1. Aceda a `http://localhost:3000/register`
2. Crie uma conta com email e password
3. **No banco de dados**, altere o papel para `ADMIN`:

```bash
npx prisma studio

# Na interface, edite o utilizador criado e altere:
# papel: "ESTUDANTE" → "ADMIN"
```

Ou via SQL:

```sql
UPDATE "Utilizador" SET papel = 'ADMIN' WHERE email = 'seu_email@example.com';
```

## 🧪 7. Testar Instalação

```bash
# Testes unitários (se existirem)
npm run test

# Linting
npm run lint

# Type checking
npm run type-check
```

## 📊 8. Abrir Prisma Studio (Gerenciador Visual do BD)

```bash
npx prisma studio
```

Abre em `http://localhost:5555` - interface visual para visualizar e editar dados.

## 🔄 9. Estrutura de Pastas Importante

Após instalação, você deve ter:

```
node_modules/          # Dependências (criado após npm install)
.next/                 # Build do Next.js (criado após build)
.env.local             # Variáveis de ambiente (criar)
prisma/
├── schema.prisma      # Schema do BD
└── migrations/        # Histórico de migrações
```

## ⚡ Comandos Importantes

```bash
# Desenvolvimento
npm run dev           # Iniciar servidor dev

# Build e Deploy
npm run build         # Build otimizado
npm start            # Iniciar versão produção

# Qualidade de código
npm run lint         # Executar ESLint
npm run type-check   # Verificar tipos TypeScript

# Banco de dados
npx prisma generate      # Gerar cliente
npx prisma migrate dev   # Criar nova migração
npx prisma studio       # Abrir gerenciador visual
npx prisma db push      # Sincronizar schema

# Limpeza
rm -rf .next node_modules  # Remover arquivos gerados
npm install                # Reinstalar dependências
```

## 🆘 Troubleshooting

### "Cannot find module 'next'"

```bash
npm install
npx prisma generate
```

### "Error: connect ECONNREFUSED 127.0.0.1:5432"

- Verifique se PostgreSQL está em execução
- Verifique se DATABASE_URL está correto
- Verifique se pode conectar: `psql -U user -h localhost -d dbname`

### "NEXTAUTH_SECRET is not set"

- Certifique-se que .env.local tem NEXTAUTH_SECRET
- Reinicie o servidor: `npm run dev`

### "Prisma Migration Conflict"

```bash
# Reset completo do BD (⚠️ APAGA TODOS OS DADOS)
npx prisma migrate reset
```

### Port 3000 already in use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

## 📝 Próximos Passos

1. ✅ Completar setup acima
2. 📖 Ler [ARQUITETURA.md](./ARQUITETURA.md)
3. 🔐 Consultar [AUTENTICACAO.md](./AUTENTICACAO.md)
4. 📊 Explorar [ADMIN-DASHBOARD.md](./ADMIN-DASHBOARD.md)
5. 🔌 Revisar [API-ENDPOINTS.md](./API-ENDPOINTS.md)

---

**Última atualização**: Abril 2026
