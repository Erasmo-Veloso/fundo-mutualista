# Guia do Dashboard Administrativo

## 🎯 Acesso e Permissões

### Autenticação

- URL: `http://localhost:3000/admin`
- Requer login com utilizador `papel: "ADMIN"`
- Redirecionamento automático se não autorizado

### Verificar Permissões

No banco de dados:

```sql
SELECT id, nome, email, papel FROM "Utilizador" WHERE papel = 'ADMIN';
```

## 📊 Dashboard Principal (/admin)

### 📈 Cartões de Estatísticas

**1. Total de Estudantes**

- Conta todos os utilizadores com `papel = "ESTUDANTE"`
- Exibe emoji: 👥

**2. Total Arrecadado**

- Soma todas as contribuições com `tipo = "ESTUDANTE"`
- Formatado em AOA (moeda angolana)
- Exibe emoji: 💰

**3. Contribuições Confirmadas**

- Conta contribuições com `status = "CONFIRMADO"`
- Exibe emoji: ✓

### 📋 Tabela de Estudantes

A tabela principal exibe todos os estudantes registados com as seguintes colunas:

| Coluna            | Descrição               | Exemplo            |
| ----------------- | ----------------------- | ------------------ |
| **Nome**          | Nome completo           | João Silva         |
| **Email**         | Email do estudante      | joao@example.com   |
| **Universidade**  | Instituição             | UCAN               |
| **Total**         | Valor total contribuído | 50,000.00 AOA      |
| **Contribuições** | Badges de status        | ✓ 5 \| ⏳ 2 \| ✗ 1 |
| **Patentes**      | Quantidade conquistada  | 3 patentes         |
| **Status**        | Estado da conta         | ACTIVO / SUSPENSO  |
| **Ações**         | Botões de operações     | Ver \| Del         |

### 🎨 Status Badges

```
ACTIVO      → Verde (success)
SUSPENSO    → Vermelho (destructive)
PENDENTE    → Amarelo (warning)
TEMPORARIO  → Cinza (outline)
```

## 🔧 Gestão de Estudantes (/admin/estudantes)

### Operações CRUD

#### 1. CREATE (Adicionar Estudante)

- ❌ Não implementado atualmente
- Estudantes registam-se via `/register` público

#### 2. READ (Ver Detalhes)

Clique em **"Ver"** para abrir modal com:

- **Informações Pessoais** (2x2 grid)
  - Nome
  - Email
  - Universidade
  - Curso
- **Status Atual**
  - Botões de ação conforme estado:
    - PENDENTE → "Ativar" (muda para ACTIVO)
    - ACTIVO → "Suspender" (muda para SUSPENSO)
- **Contribuições**
  - 4 boxes coloridos:
    - Confirmadas (verde)
    - Pendentes (âmbar)
    - Falhadas (vermelho)
    - Total de contribuições
- **Patentes Conquistadas**
  - Lista de patentes e data de conquista

#### 3. UPDATE (Atualizar Status)

```typescript
// Modal > Clique em "Ativar" ou "Suspender"
// POST para: PATCH /api/admin/estudantes/[id]
// Body: { status: "ACTIVO" | "SUSPENSO" }
```

Valores válidos de status:

- `ACTIVO` - Conta ativa
- `SUSPENSO` - Conta suspensa
- `PENDENTE` - Aguardando ativação
- `TEMPORARIO` - Acesso temporário

#### 4. DELETE (Remover Estudante)

```
Clique em "Del" → Confirmação → Remover do sistema
```

⚠️ **Aviso**: Operação irreversível. Remove:

- Utilizador
- Contribuições associadas
- Benefícios
- Patentes conquistadas
- Todos os dados relacionados

## 📱 Interface da Modal de Detalhes

### Estrutura da Modal

```
┌─────────────────────────────────────┐
│  Detalhes do Estudante              │ [X]
├─────────────────────────────────────┤
│                                     │
│  INFORMAÇÕES PESSOAIS               │
│  ┌─────────────────┬──────────────┐ │
│  │ Nome            │ João Silva   │ │
│  ├─────────────────┼──────────────┤ │
│  │ Email           │ joao@...     │ │
│  ├─────────────────┼──────────────┤ │
│  │ Universidade    │ UCAN         │ │
│  ├─────────────────┼──────────────┤ │
│  │ Curso           │ Eng. Inf.    │ │
│  └─────────────────┴──────────────┘ │
│                                     │
│  STATUS                             │
│  Atual: [Badge ACTIVO]              │
│  [Suspender Estudante] (or Ativar)  │
│                                     │
│  CONTRIBUIÇÕES                      │
│  ┌──────┬──────┬───────┬─────────┐  │
│  │ Conf │Pend  │Falha │ Total   │  │
│  │  5   │  2   │  1   │  10,000 │  │
│  └──────┴──────┴───────┴─────────┘  │
│                                     │
│  PATENTES CONQUISTADAS              │
│  • Ouro (01/01/2026)                │
│  • Prata (02/01/2026)               │
│  • Bronze (03/01/2026)              │
│                                     │
├─────────────────────────────────────┤
│            [Fechar]                 │
└─────────────────────────────────────┘
```

## 🗂️ Estrutura de Componentes

### AdminLayout (`components/admin/AdminLayout.tsx`)

**Responsabilidades**:

- Sidebar com navegação
- Header com avatar
- Menu dropdown com logout
- Layout geral

**Funcionalidades**:

- Detecção de rota ativa
- Avatar com iniciais do utilizador
- Dropdown com informações do utilizador
- Botão "Sair da plataforma"

### EstudantesTable (`components/admin/EstudantesTable.tsx`)

**Responsabilidades**:

- Fetching de estudantes via API
- Renderização da tabela
- Ações (Ver, Deletar)
- Gestão de estado da modal

**Estados gerenciados**:

```typescript
const [estudantes, setEstudantes] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [selectedEstudante, setSelectedEstudante] = useState(null);
const [modalOpen, setModalOpen] = useState(false);
const [deleting, setDeleting] = useState(false);
```

**Métodos principais**:

- `fetchEstudantes()` - GET /api/admin/estudantes
- `handleDelete(id)` - DELETE /api/admin/estudantes/[id]
- `handleStatusChange(id, status)` - Callback da modal

### EstudanteDetailModal (`components/admin/EstudanteDetailModal.tsx`)

**Responsabilidades**:

- Exibir detalhes do estudante
- Atualizar status via API
- Feedback visual de operações
- Fechar modal

**Props esperadas**:

```typescript
{
  isOpen: boolean;
  onClose: () => void;
  estudante: {
    id: string;
    nome: string;
    email: string;
    universidade: string;
    curso: string;
    status: string;
    totalContribuido: number;
    statusContribuicoes: {
      confirmadas: number;
      pendentes: number;
      falhadas: number;
    };
    quantidadePatentes: number;
    contribuicoes: Array;
    patentesAtingidas: Array;
  };
  onStatusChange: (id: string, novoStatus: string) => void;
}
```

## 🔌 API Endpoints Administrativos

### GET /api/admin/estudantes

Fetch todos os estudantes com estatísticas

**Response**:

```json
[
  {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@example.com",
    "universidade": "UCAN",
    "curso": "Engenharia Informática",
    "status": "ACTIVO",
    "totalContribuido": 50000,
    "statusContribuicoes": {
      "confirmadas": 5,
      "pendentes": 2,
      "falhadas": 1
    },
    "quantidadePatentes": 3
  }
]
```

### GET /api/admin/estudantes/[id]

Fetch detalhes de um estudante específico

### PATCH /api/admin/estudantes/[id]

Atualizar status do estudante

**Body**:

```json
{
  "status": "ACTIVO"
}
```

### DELETE /api/admin/estudantes/[id]

Remover um estudante (cascata completa)

## 🔐 Autenticação e Autorização

### Verificação de Sessão

```typescript
const session = await auth();
if (session?.user?.papel !== "ADMIN") {
  redirect("/login");
}
```

### Proteção de Rotas

- `/admin/*` - Requer papel `ADMIN`
- Redirecionamento automático para `/login` se não autorizado

## 🎨 Personalização Visual

### Paleta de Cores

```css
Primary Dark:    #2a2f35  (texto principal)
Background:      #ece9df  (background geral)
Border:          #d5d8db  (linhas)
Secondary:       #66707a  (texto secundário)
Light Gray:      #95a0aa  (ícones inativos)
Light BG:        #f4f6f8  (backgrounds leves)
```

### Componentes Reutilizáveis

- `Badge` - Status indicators
- `Button` - Ações
- `Dialog` - Modals
- `Table` - Dados tabulares

## 📋 Relatórios e Configurações

### /admin/relatorios

- 🔄 **Status**: Em desenvolvimento
- **Funcionalidades planejadas**:
  - Relatórios de contribuições
  - Gráficos de arrecadação
  - Análise de patentes
  - Exportação em PDF

### /admin/configuracoes

- 🔄 **Status**: Em desenvolvimento
- **Funcionalidades planejadas**:
  - Configurações gerais
  - Gestão de permissões
  - Logs de atividade
  - Backup do banco de dados

## 🆘 Troubleshooting

### "Não consegue aceder a /admin"

- Verifique se está logado
- Verifique papel: `SELECT papel FROM "Utilizador" WHERE email = 'seu_email';`
- Se papel != 'ADMIN', atualize: `UPDATE "Utilizador" SET papel = 'ADMIN' WHERE email = 'seu_email';`

### "Tabela vazia"

- Verificar se existem estudantes: `SELECT COUNT(*) FROM "Utilizador" WHERE papel = 'ESTUDANTE';`
- Verificar logs do servidor

### "Modal não abre ao clicar 'Ver'"

- Verificar console do navegador (F12)
- Verificar se há erros na API

### "Não consegue deletar estudante"

- Verifique se não há foreign keys relacionadas
- Tente deletar via Prisma Studio

## 📞 Suporte

Para problemas específicos do admin:

- Consulte os logs: `.next/dev/logs/`
- Verifique a sessão: `await auth()`
- Teste a API diretamente em `http://localhost:3000/api/admin/estudantes`

---

**Última atualização**: Abril 2026
