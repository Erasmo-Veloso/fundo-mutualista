# Sistema de Autenticação e Autorização

## 🔐 Overview

O sistema usa **NextAuth.js 5.0.0-beta.31** com estratégia de credenciais e JWT para sessões.

```
┌──────────────┐
│ User Login   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ POST /api/auth/signin    │
│ (Credenciais)            │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Validate Email           │
│ Hash Password (bcrypt)   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Create JWT Session       │
│ Store in HTTP-Only Cookie│
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Redirect to Dashboard    │
│ (/estudante or /admin)   │
└──────────────────────────┘
```

---

## 📁 Arquivo de Configuração

### `lib/auth.ts` - Configuração NextAuth

```typescript
import { auth } from "@/lib/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Provider de credenciais
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Validar email e password
        // Comparar com bcrypt.compare()
        // Retornar user object
      },
    }),
  ],

  // Callbacks para customização
  callbacks: {
    authorized({ auth, request }) {
      // Verificar se utilizador está autenticado
      // Redirecionar se necessário
    },
    jwt({ token, user }) {
      // Adicionar dados ao JWT token
      if (user) {
        token.papel = user.papel;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      // Adicionar dados à sessão
      session.user.papel = token.papel;
      session.user.id = token.id;
      return session;
    },
  },

  // Páginas customizadas
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
```

---

## 🔑 Tipos de Autenticação

### 1. Credenciais (Email + Password)

**Arquivo**: `app/api/auth/register/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { nome, email, password, confirmPassword } = await request.json();

  // 1. Validar inputs
  if (password !== confirmPassword) {
    return NextResponse.json(
      { erro: "Passwords não coincidem" },
      { status: 400 },
    );
  }

  // 2. Hash da password
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Criar utilizador
  const usuario = await prisma.utilizador.create({
    data: {
      nome,
      email,
      passwordHash,
      papel: "ESTUDANTE",
    },
  });

  return NextResponse.json(usuario, { status: 201 });
}
```

### 2. NextAuth Callbacks

**Arquivo**: `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const handler = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.utilizador.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          nome: user.nome,
          papel: user.papel,
        };
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.papel = user.papel;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.papel = token.papel;
        session.user.id = token.id;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
```

---

## 👥 Papéis (Roles)

### Hierarquia de Permissões

```
┌──────────────┐
│    ADMIN     │ ← Acesso completo
└──────┬───────┘
       │
       ├─→ Gestão de Estudantes
       ├─→ Gestão de Contribuições
       ├─→ Relatórios
       └─→ Configurações

┌──────────────┐
│   ESTUDANTE  │ ← Acesso pessoal
└──────┬───────┘
       │
       ├─→ Perfil
       ├─→ Histórico
       └─→ Patentes

┌──────────────┐
│   PARCEIRO   │ ← Acesso limitado
└──────┬───────┘
       │
       ├─→ Dashboard
       └─→ Ofertas
```

### Atribuir Papel

```sql
-- SQL direto no banco
UPDATE "Utilizador"
SET papel = 'ADMIN'
WHERE email = 'admin@example.com';

-- Via Prisma Studio
npx prisma studio
# Editar papel do utilizador
```

---

## 🛡️ Proteção de Rotas

### Middleware (Next.js)

```typescript
// middleware.ts
import { auth } from "@/lib/auth";

export default auth((req) => {
  // Permitir rotas públicas
  if (
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register")
  ) {
    return;
  }

  // Verificar autenticação
  if (!req.auth) {
    return Response.redirect(new URL("/login", req.url));
  }

  // Verificar papel para rotas protegidas
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (req.auth.user.papel !== "ADMIN") {
      return Response.redirect(new URL("/estudante", req.url));
    }
  }
});
```

### Server Component

```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.papel !== "ADMIN") {
    redirect("/estudante");
  }

  // ... rest of component
}
```

### Client Component

```typescript
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function MyComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div>Carregando...</div>;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  if (session.user.papel !== "ADMIN") {
    router.push("/estudante");
    return null;
  }

  return <div>Conteúdo admin</div>;
}
```

---

## 📝 JWT Token

### Estrutura do Token

```json
{
  "iss": "http://localhost:3000",
  "sub": "user-id",
  "aud": "nextauth.js",
  "email": "user@example.com",
  "nome": "João Silva",
  "papel": "ESTUDANTE",
  "iat": 1619000000,
  "exp": 1619086400
}
```

### Decodificar Token (Debug)

```bash
# Usar jwt.io ou similar
# 1. Copiar token do cookie "next-auth.session-token"
# 2. Colar em https://jwt.io
# 3. Verificar conteúdo
```

---

## 🔄 Fluxo de Login/Logout

### Login

```typescript
// app/(public)/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (result?.error) {
      setError(result.error);
    } else {
      // Redirect baseado no papel
      if (result?.ok) {
        // Obter sessão para saber o papel
        const session = await getSession();
        if (session?.user?.papel === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/estudante";
        }
      }
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

### Logout

```typescript
// Components/Header.tsx
"use client";

import { signOut } from "next-auth/react";

export default function Header() {
  return (
    <button onClick={() => signOut({ redirectTo: "/login" })}>
      Sair
    </button>
  );
}
```

---

## 🔒 Boas Práticas de Segurança

### 1. Hash de Passwords

```typescript
// CORRETO
import bcrypt from "bcryptjs";

const hash = await bcrypt.hash(password, 10);
const match = await bcrypt.compare(password, hash);

// INCORRETO - Nunca fazer
const hash = password; // ❌
```

### 2. Environment Variables

```env
# .env.local
NEXTAUTH_SECRET=sua_chave_segura_aqui
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...

# Gerar NEXTAUTH_SECRET
openssl rand -base64 32
```

### 3. HTTP-Only Cookies

- NextAuth automaticamente armazena JWT em cookies HTTP-Only
- Inacessível via JavaScript (proteção CSRF)
- Enviado automaticamente em requisições

### 4. Validação de Input

```typescript
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Password muito curta"),
});

const result = loginSchema.safeParse({
  email: userEmail,
  password: userPassword,
});

if (!result.success) {
  return NextResponse.json({ erro: result.error.issues }, { status: 400 });
}
```

### 5. Rate Limiting

```typescript
// Recomendado adicionar em produção
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
});

app.post("/api/auth/signin", limiter, handler);
```

---

## 🧪 Testar Autenticação

### Postman

1. **Login**
   - POST: `http://localhost:3000/api/auth/callback/credentials`
   - Body: `{ "email": "user@example.com", "password": "password" }`

2. **Copiar Cookie**
   - Cookies tab → Copiar `next-auth.session-token`

3. **Usar em Requisições**
   - Cookies tab → Adicionar cookie

### Browser DevTools

```javascript
// Console
// Verificar sessão
fetch("/api/auth/session")
  .then((r) => r.json())
  .then(console.log);

// Verificar se está autenticado
const session = await fetch("/api/auth/session").then((r) => r.json());
console.log(session?.user?.papel);
```

---

## 📊 SessionProvider Setup

### Root Layout

```typescript
// app/layout.tsx
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

### useSession Hook (Client)

```typescript
"use client";

import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Carregando...</p>;
  if (!session) return <p>Não autenticado</p>;

  return <p>Bem-vindo, {session.user.nome}!</p>;
}
```

---

## 🛠️ Troubleshooting

### "NEXTAUTH_SECRET is not set"

```bash
# Adicionar a .env.local
NEXTAUTH_SECRET=openssl_rand_base64_32
```

### "session is null"

- Verificar se SessionProvider está no root layout
- Verificar se JWT token é válido
- Limpar cookies do navegador

### "Papel não atualiza após update"

- JWT cache de 30 minutos por padrão
- Fazer logout e login novamente
- Ou customizar a expiração

### "Cannot read properties of undefined (reading 'email')"

- Verificar se `session?.user` existe
- Usar `session?.user?.email` (optional chaining)

---

## 📞 Recursos

- [NextAuth Docs](https://next-auth.js.org/)
- [JWT Info](https://jwt.io)
- [bcryptjs Docs](https://github.com/dcodeIO/bcrypt.js)

---

**Última atualização**: Abril 2026
