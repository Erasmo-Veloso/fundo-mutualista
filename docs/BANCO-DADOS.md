# Estrutura do Banco de Dados

## 🗄️ Visão Geral

O banco de dados PostgreSQL utiliza Prisma como ORM. Todos os modelos estão definidos em `prisma/schema.prisma`.

## 📊 Tabelas Principais

### 1. Utilizador

Armazena todos os utilizadores do sistema (estudantes, parceiros, admins).

```prisma
model Utilizador {
  id                  String                   @id @default(cuid())
  nome                String
  email               String                   @unique
  passwordHash        String
  papel               Papel                    @default(ESTUDANTE)
  universidade        String?
  curso               String?
  status              StatusUtilizador         @default(PENDENTE)
  avatarUrl           String?
  createdAt           DateTime                 @default(now())
  updatedAt           DateTime                 @updatedAt

  // Relações
  parceiroPerfil      Parceiro?
  contribuicoes       Contribuicao[]
  beneficios          BeneficioEstudante[]
  solicitacoes        SolicitacaoApoioEspecial[]
  notificacoes        Notificacao[]
  candidaturasBolsa   CandidaturaBolsa[]
  candidaturasAdmin   CandidaturaBolsa[]       @relation("admin")
  apoiosEmergenciais  ApoioEmergencial[]
  apoiosAdmin         ApoioEmergencial[]       @relation("admin")
  solicitacoesAdmin   SolicitacaoApoioEspecial[] @relation("admin")
  certificacoes       Certificacao[]
  comunicados         Comunicado[]
  patentesAtingidas   PatenteEstudante[]
}
```

**Campos principais**:

- `id` - Identificador único (CUID)
- `nome` - Nome completo
- `email` - Email único
- `passwordHash` - Senha hasheada com bcrypt
- `papel` - ESTUDANTE, PARCEIRO, ADMIN
- `status` - ACTIVO, SUSPENSO, PENDENTE, TEMPORARIO
- `universidade` - Instituição (para estudantes)
- `curso` - Curso (para estudantes)

---

### 2. Contribuicao

Registos de contribuições monetárias dos estudantes.

```prisma
model Contribuicao {
  id            String               @id @default(cuid())
  estudanteId   String
  valor         Decimal              @db.Decimal(12, 2)
  data          DateTime             @default(now())
  status        StatusContribuicao   @default(PENDENTE)
  tipo          TipoContribuicao     @default(ESTUDANTE)
  descricao     String?
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt

  estudante     Utilizador           @relation(fields: [estudanteId], references: [id], onDelete: Cascade)

  @@index([estudanteId])
}
```

**Enum StatusContribuicao**:

- `CONFIRMADO` - Confirmada e processada
- `PENDENTE` - Aguardando confirmação
- `FALHADO` - Contribuição falhada

**Enum TipoContribuicao**:

- `ESTUDANTE` - Contribuição do estudante
- `PARCEIRO` - Contribuição de parceiro
- `DOACAO` - Doação

---

### 3. Patente

Sistema de reconhecimento/níveis para os estudantes.

```prisma
model Patente {
  id          String              @id @default(cuid())
  nome        String              @unique
  descricao   String?
  requisitos  String?
  icone       String?
  cor         String?
  ordem       Int                 @default(0)

  estudantes  PatenteEstudante[]
}
```

**Exemplo de patentes**:

- Ouro (contribuição > 100.000 AOA)
- Prata (contribuição > 50.000 AOA)
- Bronze (contribuição > 10.000 AOA)

---

### 4. PatenteEstudante

Relação entre estudantes e patentes conquistadas.

```prisma
model PatenteEstudante {
  id          String      @id @default(cuid())
  patenteId   String
  estudanteId String
  atingidaEm  DateTime    @default(now())

  patente     Patente     @relation(fields: [patenteId], references: [id], onDelete: Cascade)
  estudante   Utilizador  @relation(fields: [estudanteId], references: [id], onDelete: Cascade)

  @@unique([patenteId, estudanteId])
  @@index([estudanteId])
}
```

---

### 5. BeneficioEstudante

Benefícios disponibilizados aos estudantes.

```prisma
model BeneficioEstudante {
  id           String      @id @default(cuid())
  estudanteId  String
  descricao    String
  valor        Decimal     @db.Decimal(12, 2)
  dataInicio   DateTime
  dataFim      DateTime?
  ativo        Boolean     @default(true)
  createdAt    DateTime    @default(now())

  estudante    Utilizador  @relation(fields: [estudanteId], references: [id], onDelete: Cascade)

  @@index([estudanteId])
}
```

---

### 6. Parceiro

Perfil de parceiros da plataforma.

```prisma
model Parceiro {
  id          String      @id @default(cuid())
  utilizadorId String    @unique
  empresa     String
  descricao   String?
  logo        String?
  website     String?
  createdAt   DateTime    @default(now())

  utilizador  Utilizador  @relation(fields: [utilizadorId], references: [id], onDelete: Cascade)
}
```

---

### 7. Notificacao

Sistema de notificações para utilizadores.

```prisma
model Notificacao {
  id         String      @id @default(cuid())
  usuarioId  String
  titulo     String
  mensagem   String
  tipo       String      // EMAIL, SMS, IN_APP
  lida       Boolean     @default(false)
  criadoEm   DateTime    @default(now())

  usuario    Utilizador  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)

  @@index([usuarioId])
}
```

---

### 8. Comunicado

Comunicados gerais da plataforma.

```prisma
model Comunicado {
  id         String      @id @default(cuid())
  titulo     String
  conteudo   String
  autorId    String
  data       DateTime    @default(now())

  autor      Utilizador  @relation(fields: [autorId], references: [id])

  @@index([autorId])
}
```

---

### 9. SolicitacaoApoioEspecial

Requisições de apoio especial dos estudantes.

```prisma
model SolicitacaoApoioEspecial {
  id           String      @id @default(cuid())
  estudanteId  String
  tipo         String      // Tipo de apoio
  descricao    String
  status       String      @default("PENDENTE")
  respostaPor  String?     // ID do admin que respondeu
  resposta     String?
  respondidoEm DateTime?
  criadoEm     DateTime    @default(now())

  estudante    Utilizador  @relation(fields: [estudanteId], references: [id], onDelete: Cascade)
  adminResposta Utilizador? @relation("admin", fields: [respostaPor], references: [id])

  @@index([estudanteId])
}
```

---

### 10. CandidaturaBolsa

Candidaturas a bolsas de estudo.

```prisma
model CandidaturaBolsa {
  id            String      @id @default(cuid())
  candidatoId   String
  administradorId String
  status        String      @default("PENDENTE")
  motivo        String?
  avaliadaEm    DateTime?
  criadaEm      DateTime    @default(now())

  candidato     Utilizador  @relation(fields: [candidatoId], references: [id], onDelete: Cascade)
  administrador Utilizador  @relation("admin", fields: [administradorId], references: [id])

  @@index([candidatoId])
}
```

---

### 11. ApoioEmergencial

Apoios emergenciais (bolsas de emergência).

```prisma
model ApoioEmergencial {
  id            String      @id @default(cuid())
  beneficiarioId String
  administradorId String
  valor         Decimal     @db.Decimal(12, 2)
  motivo        String
  status        String      @default("PENDENTE")
  dataAprovaçao DateTime?
  criadoEm      DateTime    @default(now())

  beneficiario  Utilizador  @relation(fields: [beneficiarioId], references: [id], onDelete: Cascade)
  administrador Utilizador  @relation("admin", fields: [administradorId], references: [id])

  @@index([beneficiarioId])
}
```

---

### 12. Certificacao

Certificações/diplomas emitidos.

```prisma
model Certificacao {
  id          String      @id @default(cuid())
  estudanteId String
  titulo      String
  emitidoEm   DateTime    @default(now())

  estudante   Utilizador  @relation(fields: [estudanteId], references: [id], onDelete: Cascade)

  @@index([estudanteId])
}
```

---

## 🔑 Enumerações

### Papel

```prisma
enum Papel {
  ESTUDANTE
  PARCEIRO
  ADMIN
}
```

### StatusUtilizador

```prisma
enum StatusUtilizador {
  ACTIVO
  SUSPENSO
  PENDENTE
  TEMPORARIO
}
```

### StatusContribuicao

```prisma
enum StatusContribuicao {
  CONFIRMADO
  PENDENTE
  FALHADO
}
```

### TipoContribuicao

```prisma
enum TipoContribuicao {
  ESTUDANTE
  PARCEIRO
  DOACAO
}
```

---

## 📊 Relações Entre Tabelas

```
Utilizador
  ├─→ Contribuicao (1:N)
  ├─→ BeneficioEstudante (1:N)
  ├─→ PatenteEstudante (1:N)
  ├─→ SolicitacaoApoioEspecial (1:N)
  ├─→ Notificacao (1:N)
  ├─→ CandidaturaBolsa (1:N)
  ├─→ ApoioEmergencial (1:N)
  ├─→ Certificacao (1:N)
  ├─→ Comunicado (1:N)
  └─→ Parceiro (1:1)

Patente
  └─→ PatenteEstudante (1:N)

Contribuicao
  └─→ Utilizador (N:1)
```

---

## 🔄 Migrações

Localização: `prisma/migrations/`

Migrações existentes:

1. `202604221900_init` - Schema inicial
2. `20260423233817_apply_init_migration` - Aplicação das alterações

Para criar nova migração:

```bash
npx prisma migrate dev --name descricao_da_mudanca
```

---

## 🛠️ Operações Comuns com Prisma

### Crear registo

```typescript
const novoEstudante = await prisma.utilizador.create({
  data: {
    nome: "João Silva",
    email: "joao@example.com",
    passwordHash: await bcrypt.hash("senha", 10),
    papel: "ESTUDANTE",
    universidade: "UCAN",
    curso: "Eng. Informática",
  },
});
```

### Ler registos

```typescript
// Um registo
const estudante = await prisma.utilizador.findUnique({
  where: { email: "joao@example.com" },
});

// Múltiplos registos
const estudantes = await prisma.utilizador.findMany({
  where: { papel: "ESTUDANTE" },
  include: { contribuicoes: true },
});

// Com contagem
const count = await prisma.utilizador.count({
  where: { papel: "ESTUDANTE" },
});
```

### Atualizar registo

```typescript
const atualizado = await prisma.utilizador.update({
  where: { id: "uuid" },
  data: { status: "ACTIVO" },
});
```

### Deletar registo

```typescript
await prisma.utilizador.delete({
  where: { id: "uuid" },
});

// Em cascata (todos relacionados)
// Configurado automaticamente via onDelete: Cascade
```

---

## 📈 Queries Complexas

### Estudante com todas as contribuições

```typescript
const estudante = await prisma.utilizador.findUnique({
  where: { id: "uuid" },
  include: {
    contribuicoes: {
      orderBy: { data: "desc" },
    },
    patentesAtingidas: {
      include: { patente: true },
    },
    beneficios: true,
    certificacoes: true,
  },
});
```

### Estudantes agrupados por status

```typescript
const stats = await prisma.utilizador.groupBy({
  by: ["status"],
  where: { papel: "ESTUDANTE" },
  _count: true,
});
```

### Total arrecadado por estudante

```typescript
const totais = await prisma.contribuicao.groupBy({
  by: ["estudanteId"],
  _sum: { valor: true },
  where: { status: "CONFIRMADO" },
});
```

---

## 🔐 Índices para Performance

```prisma
// Índices criados automaticamente:
@@index([estudanteId])        // Em Contribuicao
@@index([usuarioId])          // Em Notificacao
@@index([estudanteId])        // Em PatenteEstudante
@@index([estudanteId])        // Em BeneficioEstudante
```

---

## 📋 Checklist de Backup

```bash
# Backup do PostgreSQL (via pg_dump)
pg_dump -U user -h host -d dbname > backup_2026_04_29.sql

# Backup via Neon (web interface)
# 1. Aceder a neon.tech
# 2. Project Settings → Backups
# 3. Create Backup

# Restaurar
psql -U user -h host -d dbname < backup_2026_04_29.sql
```

---

## 📞 Comandos Úteis

```bash
# Gerar cliente Prisma
npx prisma generate

# Sincronizar schema
npx prisma db push

# Reset (⚠️ deleta todos os dados)
npx prisma migrate reset

# Ver status de migrações
npx prisma migrate status

# Abrir gerenciador visual
npx prisma studio
```

---

**Última atualização**: Abril 2026
