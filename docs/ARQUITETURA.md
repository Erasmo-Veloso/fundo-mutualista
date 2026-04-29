# Arquitetura do Projeto

## 🏗️ Visão Geral da Arquitetura

O Fundo Mutualista é uma aplicação **full-stack** monolítica construída com Next.js, utilizando o App Router para organização de rotas e componentes.

```
┌─────────────────────────────────────────────────────┐
│          Frontend (React/Next.js)                   │
│  ├── Estudantes (Histórico, Patentes)              │
│  ├── Parceiros (Anúncios, Ofertas)                 │
│  ├── Admin (Dashboard, Gestão)                     │
│  └── Público (Login, Registo)                      │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────────┐  ┌──────────▼────────┐
│  Next.js Server  │  │  Next.js Client   │
│  (API Routes)    │  │  (SPA)            │
└───────┬──────────┘  └──────────────────┘
        │
┌───────▼──────────────────────────────────┐
│  NextAuth (Autenticação)                 │
│  - JWT Sessions                          │
│  - Credentials Provider                  │
└───────┬──────────────────────────────────┘
        │
┌───────▼──────────────────────────────────┐
│  Prisma ORM                              │
│  - Query Builder                         │
│  - Migrations                            │
└───────┬──────────────────────────────────┘
        │
┌───────▼──────────────────────────────────┐
│  PostgreSQL Database                     │
│  - Utilizadores                          │
│  - Contribuições                         │
│  - Patentes                              │
│  - Benefícios                            │
└──────────────────────────────────────────┘
```

## 📁 Estrutura de Diretórios

### `/app` - Rotas e Páginas

```
app/
├── layout.tsx                 # Layout raiz (todos os pages)
├── auth.ts                    # Configuração NextAuth
├── (admin)/
│   ├── layout.tsx            # (LayoutRootSegment)
│   └── admin/
│       ├── page.tsx          # /admin - Dashboard
│       ├── estudantes/
│       │   └── page.tsx      # /admin/estudantes
│       ├── relatorios/
│       │   └── page.tsx      # /admin/relatorios
│       └── configuracoes/
│           └── page.tsx      # /admin/configuracoes
├── (estudante)/
│   └── estudante/
│       ├── page.tsx          # /estudante - Home
│       ├── historico/
│       │   └── page.tsx      # /estudante/historico
│       └── patentes/
│           └── page.tsx      # /estudante/patentes
├── (parceiro)/
│   ├── dashboard/
│   │   └── page.tsx          # /dashboard (parceiro)
│   └── parceiro/
│       └── page.tsx          # /parceiro
├── (public)/
│   ├── login/
│   │   └── page.tsx          # /login
│   ├── register/
│   │   └── page.tsx          # /register
│   └── apoio-especial/
│       └── page.tsx          # /apoio-especial
└── api/
    ├── auth/
    │   ├── [...nextauth]/
    │   │   └── route.ts      # Endpoints NextAuth
    │   └── register/
    │       └── route.ts      # POST /api/auth/register
    └── admin/
        └── estudantes/
            ├── route.ts      # GET/POST /api/admin/estudantes
            └── [id]/
                └── route.ts  # GET/PATCH/DELETE /api/admin/estudantes/[id]
```

### `/components` - Componentes React

```
components/
├── admin/
│   ├── AdminLayout.tsx       # Layout administrativo com sidebar
│   ├── EstudantesTable.tsx   # Tabela de estudantes (READ)
│   └── EstudanteDetailModal.tsx # Modal de detalhes e UPDATE/DELETE
├── estudante/
│   ├── StudentLayout.tsx     # Layout estudante com sidebar
│   ├── HistoricoTable.tsx    # Tabela de contribuições
│   └── PatentesList.tsx      # Lista de patentes conquistadas
├── parceiro/
│   └── ParceiroLayout.tsx    # Layout parceiro
├── shared/
│   ├── Header.tsx            # Cabeçalho comum
│   ├── Navigation.tsx        # Menu de navegação
│   └── Footer.tsx            # Rodapé
└── ui/
    ├── badge.tsx             # Component de badges/tags
    ├── button.tsx            # Component de botões
    ├── dialog.tsx            # Component de modal/dialog
    ├── table.tsx             # Component de tabela
    ├── input.tsx             # Component de input
    └── select.tsx            # Component de select
```

### `/lib` - Utilitários e Configuração

```
lib/
├── auth.ts                   # Configuração NextAuth
├── prisma.ts                 # Cliente Prisma singleton
├── validators.ts             # Schemas de validação Zod
├── constants.ts              # Constantes globais
└── utils.ts                  # Funções auxiliares
```

### `/prisma` - Banco de Dados

```
prisma/
├── schema.prisma             # Schema do BD (modelos)
└── migrations/
    ├── 202604221900_init/
    └── 20260423233817_apply_init_migration/
```

### `/types` - Tipos TypeScript

```
types/
├── next-auth.d.ts           # Extensão de tipos NextAuth
└── index.ts                 # Tipos customizados
```

## 🔄 Fluxos de Dados

### 1. Autenticação (Login)

```
User Login Form
    ↓
POST /api/auth/callback/credentials
    ↓
NextAuth validateCredentials
    ↓
Prisma: findUnique(email)
    ↓
bcrypt.compare(password)
    ↓
Create JWT Session
    ↓
Redirect to /estudante or /admin
```

### 2. Gestão de Estudantes (Admin)

```
Admin View Table
    ↓
useEffect → GET /api/admin/estudantes
    ↓
Prisma: findMany with relations
    ↓
Return array of students
    ↓
Render EstudantesTable
    ↓
[Ver] Button → Open EstudanteDetailModal
    ↓
[Update Status] → PATCH /api/admin/estudantes/[id]
    ↓
Prisma: update status
    ↓
Return updated student
    ↓
Update table data
```

### 3. Visualização de Histórico (Estudante)

```
Estudante Access /estudante/historico
    ↓
Server-side: Fetch session + db queries
    ↓
Prisma: findUnique with contribuicoes
    ↓
Render HistoricoTable
    ↓
Display contributions with status badges
```

## 🎯 Padrões de Projeto

### Server Components vs Client Components

```typescript
// Server Component (page.tsx)
export default async function Page() {
  const data = await prisma.model.findMany();
  return <Component data={data} />;
}

// Client Component (table.tsx)
"use client";
import { useState } from "react";
export default function Table({ data }) {
  const [items, setItems] = useState(data);
  return <table>...</table>;
}
```

### API Routes Pattern

```typescript
// app/api/resource/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  try {
    const data = await prisma.model.findMany();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ erro: "Erro do servidor" }, { status: 500 });
  }
}
```

### Validação com Zod

```typescript
import { z } from "zod";

const schemas = {
  createUser: z.object({
    nome: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
  }),
  updateStatus: z.object({
    status: z.enum(["ACTIVO", "SUSPENSO", "PENDENTE"]),
  }),
};

export type CreateUserInput = z.infer<typeof schemas.createUser>;
```

## 🔐 Fluxo de Segurança

```
Request
    ↓
Middleware Check [/api/...] (optional)
    ↓
Auth Middleware (NextAuth)
    ↓
Session Validation (JWT)
    ↓
Role Check (ADMIN, ESTUDANTE, etc)
    ↓
Input Validation (Zod)
    ↓
Database Operation (Prisma)
    ↓
Response Serialization
    ↓
Return to Client
```

## 📊 Modelo de Dados (Principais Tabelas)

```
┌─────────────┐
│  Utilizador │
├─────────────┤
│ id (PK)     │
│ nome        │
│ email       │
│ password    │
│ papel       │ ──→ ESTUDANTE, PARCEIRO, ADMIN
│ status      │ ──→ ACTIVO, SUSPENSO, PENDENTE
└─────────────┘
       │
       ├─→ Contribuicao
       ├─→ BeneficioEstudante
       └─→ Patente

┌──────────────────┐
│  Contribuicao    │
├──────────────────┤
│ id (PK)          │
│ estudanteId (FK) │
│ valor            │
│ data             │
│ status           │ ──→ CONFIRMADO, PENDENTE, FALHADO
│ tipo             │
└──────────────────┘

┌─────────────────────┐
│ PatenteEstudante    │
├─────────────────────┤
│ id (PK)             │
│ estudanteId (FK)    │
│ patenteId (FK)      │
│ atingidaEm          │
└─────────────────────┘
```

## 🚀 Performance Considerations

1. **Database Queries**: Use `select` para trazer apenas campos necessários
2. **Caching**: NextAuth sessions são cached em memory
3. **Images**: Utilize Next.js Image component para otimização
4. **Code Splitting**: App Router automaticamente faz code splitting
5. **ISR/Revalidation**: Use `revalidatePath()` para cache invalidation

## 🔌 Extensibilidade

### Adicionar Nova Rota

```
1. Criar pasta em app/(grupo)/novo/
2. Criar page.tsx com componente
3. Usar AdminLayout/StudentLayout se necessário
```

### Adicionar Novo Endpoint

```
1. Criar app/api/novo/route.ts
2. Implementar GET/POST/PATCH/DELETE
3. Adicionar validação Zod
4. Chamar via fetch() do cliente
```

### Adicionar Nova Tabela no BD

```
1. Editar prisma/schema.prisma
2. Executar: npx prisma migrate dev --name descricao
3. Usar `prisma.novaTabela` na aplicação
```

---

**Última atualização**: Abril 2026
