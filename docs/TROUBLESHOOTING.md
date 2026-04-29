# Guia de Resolução de Problemas (Troubleshooting)

## ❌ Erros Comuns e Soluções

---

## 🚀 Problemas de Início

### "npm: command not found"

**Solução**:

- Instalar Node.js de [nodejs.org](https://nodejs.org/)
- Verificar: `node --version` e `npm --version`
- Reiniciar terminal após instalação

---

### "Cannot find module 'next'"

**Solução**:

```bash
# Limpar cache e reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

### "Failed to load ENV variables"

**Solução**:

```bash
# Verificar se .env.local existe
ls -la .env.local

# Criar se não existir
cp .env.example .env.local

# Verificar conteúdo
cat .env.local
```

---

### "Port 3000 is already in use"

**Solução**:

**Windows (PowerShell)**:

```bash
# Encontrar processo
netstat -ano | findstr :3000

# Matar processo (substituir PID)
Stop-Process -Id <PID> -Force
```

**Mac/Linux**:

```bash
lsof -i :3000
kill -9 <PID>
```

---

## 🔐 Problemas de Autenticação

### "Cannot read properties of undefined (reading 'custom')"

**Erro anterior**: Zod validation issue  
**Solução**: ✅ Já corrigido (use string literal `"custom"` no código)

```typescript
// ✅ CORRETO
code: "custom";

// ❌ INCORRETO
code: z.ZodIssueCode.custom;
```

---

### "NEXTAUTH_SECRET is not set"

**Solução**:

```bash
# Gerar secret
openssl rand -base64 32

# Adicionar a .env.local
NEXTAUTH_SECRET=valor_gerado_aqui

# Reiniciar servidor
npm run dev
```

---

### "Session is null after login"

**Causas possíveis**:

- SessionProvider não está no layout
- JWT token expirou
- Cookie foi deletado

**Solução**:

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

---

### "Email or password invalid"

**Verificar**:

```sql
-- Verificar se utilizador existe
SELECT id, nome, email, papel FROM "Utilizador" WHERE email = 'seu_email@example.com';

-- Se não existir, criar
-- Ou usar /register para criar novo
```

---

### "Papel não atualiza após change"

**Causa**: JWT é cacheado por 30 minutos  
**Solução**:

```bash
# Fazer logout completo
# Limpar cookies
# Fazer login novamente

# Ou customizar expiração em lib/auth.ts
callbacks: {
  jwt({ token }) {
    return token; // maxAge padrão é 24h
  }
}
```

---

## 🗄️ Problemas de Banco de Dados

### "Cannot find database"

**Verificar conexão**:

```bash
# Testar CONNECTION STRING
psql postgresql://user:password@localhost:5432/dbname

# Se falhar, verificar:
# 1. PostgreSQL está running?
# 2. User/password corretos?
# 3. Database existe?

# Criar database
createdb fundo_mutualista
```

---

### "Error: connect ECONNREFUSED 127.0.0.1:5432"

**Soluções**:

**Windows (PostgreSQL local)**:

```bash
# Verificar se serviço está ativo
# Services > PostgreSQL > Start

# Ou via PowerShell
Get-Service postgres | Start-Service
```

**Via Neon (PostgreSQL remoto)**:

```bash
# Verificar DATABASE_URL em .env.local
# Formato correto:
# postgresql://user:password@host:5432/dbname

# Testar conexão
npx prisma db execute --stdin << "EOF"
SELECT 1;
EOF
```

---

### "Prisma client not initialized"

**Solução**:

```bash
# Gerar cliente Prisma
npx prisma generate

# Com DATABASE_URL:
$env:DATABASE_URL="postgresql://..."; npx prisma generate
```

---

### "Cannot access database - Migrations conflict"

**Solução**:

```bash
# Ver status das migrações
npx prisma migrate status

# Reset completo (⚠️ APAGA DADOS)
npx prisma migrate reset

# Depois recriar:
npx prisma migrate dev --name init
```

---

### "Estudantes não aparecem na tabela"

**Verificar**:

```bash
# 1. Verificar se existem estudantes
npx prisma studio
# Ir a Utilizador > Filtrar papel = ESTUDANTE

# 2. Testar API manualmente
curl http://localhost:3000/api/admin/estudantes

# 3. Verificar console do navegador (F12)
# Procurar por erros de rede
```

---

## 🎨 Problemas de Frontend

### "Module not found" - Import errors

**Solução**:

```typescript
// ❌ ERRADO
import Badge from "./badge";

// ✅ CORRETO
import Badge from "@/components/ui/badge";
```

---

### "Cannot read properties of undefined (reading 'custom')"

**Já corrigido** ✅  
Procure em: [API-ENDPOINTS.md - Zod Custom Errors](./API-ENDPOINTS.md)

---

### "next dev não funciona"

**Verificar**:

```bash
# 1. Verificar se há outro processo
lsof -i :3000

# 2. Limpar .next
rm -rf .next

# 3. Reconstruir
npm run build

# 4. Reiniciar
npm run dev
```

---

### "Componente não renderiza"

**Verificar**:

```tsx
// Se é "use client"?
"use client";

// Se import está correto?
import Component from "@/components/path";

// Se props estão corretas?
<Component prop={value} />;

// Se não há erro no console?
F12 > Console;
```

---

## 🔌 Problemas de API

### "404 Not Found" para endpoint

**Verificar**:

```bash
# 1. Ficheiro route.ts existe?
ls app/api/seu-endpoint/route.ts

# 2. Função exportada? (GET, POST, PATCH, DELETE)
export async function GET(request) { ... }

# 3. Caminho da URL correto?
/api/admin/estudantes ✅
/api/admin/students ❌
```

---

### "405 Method Not Allowed"

**Causa**: Tentando usar HTTP method não implementado  
**Solução**:

```typescript
// route.ts
export async function GET(request) { ... }   // GET funciona
export async function POST(request) { ... }  // POST funciona
// export async function PUT = 405 Not Allowed
```

---

### "500 Internal Server Error"

**Verificar logs**:

```bash
# 1. Terminal (npm run dev)
# Procurar por stack trace

# 2. Browser Console
F12 > Console

# 3. Logs da aplicação
.next/dev/logs/next-development.log

# 4. Adicionar try/catch mais verboso
try {
  // código
} catch (error) {
  console.error("Erro detalhado:", error);
  return NextResponse.json(
    { erro: error.message },
    { status: 500 }
  );
}
```

---

### "CORS Error"

**Nota**: NextAuth maneja CORS automaticamente  
**Se ainda houver erro**:

```typescript
// app/api/seu-endpoint/route.ts
export async function GET(request) {
  return NextResponse.json(data, {
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE",
    },
  });
}
```

---

## 🛠️ Problemas de Build

### "Build fails"

**Verificar**:

```bash
# 1. TypeScript errors
npm run type-check

# 2. Lint errors
npm run lint

# 3. Build com verbose
npm run build -- --verbose

# 4. Limpar e reconstruir
rm -rf .next
npm run build
```

---

### "Type error: Cannot find type definition"

**Solução**:

```bash
# Instalar tipos faltantes
npm install --save-dev @types/node

# Regenerar
npx prisma generate
```

---

## 📱 Problemas de Layout/UI

### "AdminLayout não aparece"

**Verificar**:

```typescript
// app/(admin)/admin/page.tsx

// AdminLayout está sendo importado?
import AdminLayout from "@/components/admin/AdminLayout";

// Está envelopando o conteúdo?
return (
  <AdminLayout pageTitle="...">
    {/* conteúdo */}
  </AdminLayout>
);

// Se usar server component:
// 1. AdminLayout deve ser "use client"
// 2. Importar dentro de app layout
```

---

### "Modal não abre"

**Verificar**:

```typescript
// EstudantesTable.tsx
// Clique chama handleOpen?
const handleOpen = (estudante) => {
  setSelectedEstudante(estudante);
  setModalOpen(true);
};

// Modal renderiza quando open?
{modalOpen && <EstudanteDetailModal ... />}

// ou com Dialog component:
<Dialog open={modalOpen} onOpenChange={setModalOpen}>
  ...
</Dialog>
```

---

### "Botão não responde"

**Verificar**:

```typescript
// onClick chamado?
<button onClick={() => handleDelete(id)}>

// Função está definida?
const handleDelete = (id) => { ... }

// Não está desabilitado?
disabled={loading}

// Sem type="submit" fora de forms?
<button type="button" onClick={...}>
```

---

## 📊 Problemas de Dados

### "Tabela vazia (mas existem estudantes)"

**Debugging**:

```bash
# 1. Testar API diretamente
curl http://localhost:3000/api/admin/estudantes

# 2. Verificar se estudantes têm papel ESTUDANTE
psql -c "SELECT papel, COUNT(*) FROM \"Utilizador\" GROUP BY papel;"

# 3. Verificar sesão está logada como ADMIN
```

---

### "Números não formatam corretamente"

**Solução**:

```typescript
// Formatação de moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "AOA",
  }).format(value);
};

// Uso
<p>{formatCurrency(50000)}</p> // 50.000,00 AOA
```

---

### "Datas com formato estranho"

**Solução**:

```typescript
// Formatar data
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("pt-PT").format(new Date(date));
};

// Uso
<p>{formatDate(contribuicao.data)}</p> // 29/04/2026
```

---

## 🔄 Problemas de Atualizações

### "Mudanças não aparecem após PATCH"

**Causa**: Cache do cliente  
**Solução**:

```typescript
// Após PATCH, recarregar dados
const handleStatusChange = async (id, status) => {
  await updateStatus(id, status);

  // Recarregar tabela
  const updated = await fetchEstudantes();
  setEstudantes(updated);
};
```

---

### "Delete não funciona"

**Verificar**:

```bash
# 1. Confirmar modal aparece
# 2. Botão Confirmar é clicado
# 3. Erro em console (F12)?
# 4. API retorna 200?

# Testar DELETE manualmente
curl -X DELETE http://localhost:3000/api/admin/estudantes/uuid \
  -H "Cookie: next-auth.session-token=token"
```

---

## 🆘 Quando Tudo Falha

### Reset Completo

```bash
# 1. Parar servidor
Ctrl+C

# 2. Limpar tudo
rm -rf .next node_modules package-lock.json

# 3. Reinstalar
npm install

# 4. Regenerar Prisma
npx prisma generate

# 5. Migrations
npx prisma migrate deploy

# 6. Reconstruir
npm run build

# 7. Reiniciar
npm run dev
```

### Resetar Banco de Dados

```bash
# ⚠️ CUIDADO: APAGA TODOS OS DADOS
npx prisma migrate reset

# Confirmar com 'y'
# Recriar dados se necessário
```

---

## 📞 Como Reportar Problemas

Ao abrir um issue, incluir:

1. **Erro exato** (copiar do console)
2. **Passos para reproduzir**
3. **Ambiente**:
   ```bash
   node --version
   npm --version
   ```
4. **Logs relevantes**
5. **Screenshots** (se UI)

---

## 🔗 Recursos de Ajuda

- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth Docs](https://next-auth.js.org/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

---

**Última atualização**: Abril 2026
