# Referência Rápida - Cheat Sheet

## 🚀 Quick Start (Primeiros 10 minutos)

```bash
# 1. Clonar
git clone https://github.com/Erasmo-Veloso/fundo-mutualista.git
cd fundo-mutualista

# 2. Instalar
npm install

# 3. Configurar .env.local
cp .env.example .env.local
# Editar: DATABASE_URL, NEXTAUTH_SECRET

# 4. Setup BD
npx prisma generate
npx prisma migrate deploy

# 5. Iniciar
npm run dev

# Aceder a http://localhost:3000
```

---

## 🔐 Comandos NextAuth

| Ação              | Comando                                                      |
| ----------------- | ------------------------------------------------------------ |
| Gerar secret      | `openssl rand -base64 32`                                    |
| Adicionar admin   | `UPDATE "Utilizador" SET papel='ADMIN' WHERE email='...';`   |
| Resetar passwords | `UPDATE "Utilizador" SET passwordHash='...' WHERE id='...';` |

---

## 🗄️ Comandos Prisma

| Ação           | Comando                                      |
| -------------- | -------------------------------------------- |
| Gerar cliente  | `npx prisma generate`                        |
| Criar migração | `npx prisma migrate dev --name nome_mudanca` |
| Ver status     | `npx prisma migrate status`                  |
| Abrir UI       | `npx prisma studio`                          |
| Reset total    | `npx prisma migrate reset` (⚠️ apaga dados)  |

---

## 📍 Rotas Principais

| Rota                   | Papel     | Descrição                  |
| ---------------------- | --------- | -------------------------- |
| `/login`               | Público   | Página de login            |
| `/register`            | Público   | Registar novo utilizador   |
| `/admin`               | ADMIN     | Dashboard administrativo   |
| `/admin/estudantes`    | ADMIN     | Gestão de estudantes       |
| `/estudante`           | ESTUDANTE | Área pessoal               |
| `/estudante/historico` | ESTUDANTE | Histórico de contribuições |

---

## 🔌 API Endpoints Essenciais

```bash
# Autenticação
POST /api/auth/signin          # Login
POST /api/auth/register        # Registar
POST /api/auth/signout         # Logout
GET  /api/auth/session         # Sessão atual

# Admin - Estudantes
GET  /api/admin/estudantes                  # Listar
GET  /api/admin/estudantes/[id]            # Detalhe
PATCH /api/admin/estudantes/[id]           # Atualizar
DELETE /api/admin/estudantes/[id]          # Remover
```

---

## 💾 Variáveis de Ambiente

```env
# Obrigatórias
DATABASE_URL="postgresql://user:pass@host:5432/db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="chave_secura_gerada"

# Opcionais
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_FROM="noreply@exemplo.com"
```

---

## 🎨 Estrutura de Componentes

```
components/
├── admin/
│   ├── AdminLayout.tsx        # Layout principal
│   ├── EstudantesTable.tsx    # Tabela de dados
│   └── EstudanteDetailModal.tsx # Modal de detalhes
├── estudante/
│   ├── StudentLayout.tsx
│   ├── HistoricoTable.tsx
│   └── PatentesList.tsx
└── ui/
    ├── badge.tsx              # Status indicators
    ├── button.tsx
    ├── dialog.tsx
    └── table.tsx
```

---

## 📊 Modelos Principais

### Utilizador

```
id, nome, email, passwordHash, papel (ESTUDANTE/ADMIN/PARCEIRO), status, universidade, curso
```

### Contribuicao

```
id, estudanteId, valor, data, status (CONFIRMADO/PENDENTE/FALHADO), tipo
```

### Patente

```
id, nome, descricao, requisitos, icone
```

---

## 🔑 Papéis e Permissões

```
ADMIN         ✅ Acesso completo
ESTUDANTE     ✅ Área pessoal
PARCEIRO      ✅ Dashboard parceiro
```

Verificar papel:

```sql
SELECT papel FROM "Utilizador" WHERE email = '...';
```

---

## 🛠️ Desenvolvimento

```bash
# Dev server
npm run dev              # http://localhost:3000

# Build e Deploy
npm run build
npm start

# Qualidade
npm run lint            # ESLint
npm run type-check      # TypeScript

# Banco de dados
npx prisma studio      # UI visual (http://localhost:5555)
```

---

## ❌ Erros Comuns & Soluções

| Erro                       | Solução                                   |
| -------------------------- | ----------------------------------------- |
| `Cannot find module`       | `npm install && npx prisma generate`      |
| `ECONNREFUSED 5432`        | Verificar DATABASE_URL e PostgreSQL       |
| `NEXTAUTH_SECRET not set`  | `openssl rand -base64 32` → .env.local    |
| `Port 3000 already in use` | `Stop-Process -Id <PID> -Force` (Windows) |
| `Session is null`          | SessionProvider no layout                 |

---

## 📂 Ficheiros Importantes

| Ficheiro               | Propósito             |
| ---------------------- | --------------------- |
| `.env.local`           | Variáveis de ambiente |
| `prisma/schema.prisma` | Schema do BD          |
| `lib/auth.ts`          | Configuração NextAuth |
| `app/layout.tsx`       | Layout raiz           |
| `next.config.mjs`      | Configuração Next.js  |

---

## 🔐 Segurança Checklist

- [ ] NEXTAUTH_SECRET é aleatório e forte (32+ caracteres)
- [ ] DATABASE_URL não está em repositório público
- [ ] Passwords são hasheadas com bcrypt
- [ ] Cookies HTTP-only (automático com NextAuth)
- [ ] Rotas admin protegidas por papel

---

## 📱 Papéis de Utilizadores

### ADMIN

- Dashboard com estatísticas
- Gestão completa de estudantes
- CRUD: Create, Read, Update, Delete
- Relatórios (em desenvolvimento)

### ESTUDANTE

- Perfil pessoal
- Histórico de contribuições
- Patentes conquistadas
- Benefícios

### PARCEIRO

- Dashboard de parceiro
- Gestão de ofertas
- Comunicações

---

## 🆘 Debug Rápido

```bash
# Ver logs
tail -f .next/dev/logs/next-development.log

# Testar API
curl http://localhost:3000/api/admin/estudantes

# Verificar BD
npx prisma studio

# Console do navegador
F12 > Console

# Checar process
netstat -ano | findstr :3000
```

---

## 📊 Estatísticas Disponíveis

Dashboard mostra:

- 👥 Total de Estudantes
- 💰 Total Arrecadado (em AOA)
- ✓ Contribuições Confirmadas

Tabela lista:

- Nome, Email, Universidade
- Total contribuído
- Contribuições (confirmadas/pendentes/falhadas)
- Patentes conquistadas
- Status (ACTIVO/SUSPENSO/PENDENTE)

---

## 🔄 Fluxo de Update

```
User → Component → API (/api/...)
                    ↓
                  Prisma
                    ↓
                 Database
                    ↓
                  Response
                    ↓
              Update State
                    ↓
              Re-render UI
```

---

## 📞 Ficheiros de Documentação

Todos os ficheiros em `/docs/`:

- **README.md** - Índice principal
- **SETUP.md** - Instalação passo-a-passo
- **ARQUITETURA.md** - Estrutura técnica
- **ADMIN-DASHBOARD.md** - Guia do admin
- **API-ENDPOINTS.md** - Documentação de APIs
- **BANCO-DADOS.md** - Schema e modelos
- **AUTENTICACAO.md** - Sistema de login
- **TROUBLESHOOTING.md** - Resolução de problemas

---

## 🚀 Deploy (Production)

```bash
# Build otimizado
npm run build

# Testar build
npm start

# Variáveis em produção (IMPORTANTE)
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=chave_nova_gerada
```

---

## 💡 Dicas Úteis

1. **Usar Prisma Studio** para debug visual: `npx prisma studio`
2. **DevTools NextAuth**: Ver tokens e sessões
3. **TypeScript strict**: Ativa validação rigorosa
4. **Logs verbosos**: `console.log()` em dev, remover em prod
5. **Backup regular**: Database é crítico

---

## 🎯 Próximos Passos Recomendados

1. ✅ Setup completo e teste
2. 📖 Ler SETUP.md + ARQUITETURA.md
3. 🔐 Configurar autenticação em produção
4. 📊 Adicionar relatórios
5. 🎨 Personalizar UI conforme necessário
6. 🔄 Setup CI/CD
7. 📱 Testes de responsividade

---

**Versão**: 1.0.0  
**Última atualização**: Abril 2026  
**Tecnologias**: Next.js 16 | React 19 | TypeScript | Tailwind | Prisma | NextAuth
