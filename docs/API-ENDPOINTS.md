# Documentação de API Endpoints

## 🔐 Autenticação

Todos os endpoints de autenticação usam NextAuth com estratégia de credenciais (email + password).

### POST /api/auth/callback/credentials

Login com credenciais

**Request**:

```json
{
  "email": "user@example.com",
  "password": "senha123456"
}
```

**Response (200)**:

```json
{
  "ok": true,
  "status": 200,
  "user": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@example.com",
    "papel": "ESTUDANTE"
  }
}
```

**Errors**:

- `401` - Email ou password inválido
- `500` - Erro do servidor

### POST /api/auth/register

Registar novo utilizador

**Request**:

```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "password": "senha123456",
  "confirmPassword": "senha123456"
}
```

**Response (201)**:

```json
{
  "mensagem": "Utilizador registado com sucesso",
  "usuario": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@example.com",
    "papel": "ESTUDANTE",
    "status": "PENDENTE"
  }
}
```

**Errors**:

- `400` - Validação falhou (email duplicado, password fraca, etc.)
- `500` - Erro do servidor

### GET /api/auth/session

Obter sessão atual do utilizador logado

**Response (200)**:

```json
{
  "user": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@example.com",
    "papel": "ESTUDANTE"
  },
  "expires": "2026-04-30T12:00:00Z"
}
```

**Errors**:

- `401` - Não autenticado

### GET /api/auth/signin

Redirect para página de login

### POST /api/auth/signout

Logout da sessão atual

---

## 👨‍💼 Admin - Gestão de Estudantes

### GET /api/admin/estudantes

Obter lista de todos os estudantes com estatísticas

**Query Parameters**: Nenhum

**Response (200)**:

```json
[
  {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@example.com",
    "universidade": "UCAN",
    "curso": "Engenharia Informática",
    "status": "ACTIVO",
    "createdAt": "2026-04-01T10:00:00Z",
    "avatarUrl": null,
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

**Errors**:

- `401` - Não autenticado
- `403` - Permissão negada (requer papel ADMIN)
- `500` - Erro do servidor

**Exemplo cURL**:

```bash
curl -X GET http://localhost:3000/api/admin/estudantes \
  -H "Cookie: next-auth.session-token=seu_token"
```

---

### GET /api/admin/estudantes/[id]

Obter detalhes completos de um estudante específico

**URL Parameters**:

- `id` (string) - UUID do estudante

**Response (200)**:

```json
{
  "id": "uuid",
  "nome": "João Silva",
  "email": "joao@example.com",
  "universidade": "UCAN",
  "curso": "Engenharia Informática",
  "status": "ACTIVO",
  "createdAt": "2026-04-01T10:00:00Z",
  "contribuicoes": [
    {
      "id": "uuid",
      "valor": 10000,
      "data": "2026-04-01",
      "status": "CONFIRMADO",
      "tipo": "ESTUDANTE"
    }
  ],
  "patentesAtingidas": [
    {
      "patenteId": "uuid",
      "atingidaEm": "2026-04-15",
      "patente": {
        "nome": "Ouro"
      }
    }
  ]
}
```

**Errors**:

- `404` - Estudante não encontrado
- `401` - Não autenticado
- `403` - Permissão negada

**Exemplo cURL**:

```bash
curl -X GET http://localhost:3000/api/admin/estudantes/12345 \
  -H "Cookie: next-auth.session-token=seu_token"
```

---

### PATCH /api/admin/estudantes/[id]

Atualizar informações do estudante (ex: status)

**URL Parameters**:

- `id` (string) - UUID do estudante

**Request Body**:

```json
{
  "status": "ACTIVO"
}
```

**Valores válidos para status**:

- `ACTIVO` - Conta ativa
- `SUSPENSO` - Conta suspensa
- `PENDENTE` - Aguardando ativação
- `TEMPORARIO` - Acesso temporário

**Response (200)**:

```json
{
  "id": "uuid",
  "nome": "João Silva",
  "email": "joao@example.com",
  "status": "ACTIVO",
  "universidade": "UCAN",
  "curso": "Engenharia Informática"
}
```

**Errors**:

- `400` - Status inválido ou ausente
- `404` - Estudante não encontrado
- `401` - Não autenticado
- `403` - Permissão negada
- `500` - Erro do servidor

**Exemplo cURL**:

```bash
curl -X PATCH http://localhost:3000/api/admin/estudantes/12345 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=seu_token" \
  -d '{"status":"SUSPENSO"}'
```

---

### DELETE /api/admin/estudantes/[id]

Remover um estudante do sistema

**URL Parameters**:

- `id` (string) - UUID do estudante

**Response (200)**:

```json
{
  "mensagem": "Estudante deletado com sucesso"
}
```

**⚠️ Comportamento**: Remove em cascata:

- Utilizador
- Todas as contribuições
- Benefícios associados
- Patentes conquistadas
- Todos os dados relacionados

**Errors**:

- `404` - Estudante não encontrado
- `401` - Não autenticado
- `403` - Permissão negada
- `500` - Erro do servidor

**Exemplo cURL**:

```bash
curl -X DELETE http://localhost:3000/api/admin/estudantes/12345 \
  -H "Cookie: next-auth.session-token=seu_token"
```

---

## 📊 Estudante - Dados Pessoais

### GET /api/estudante/profile

Obter perfil do estudante logado

**Response (200)**:

```json
{
  "id": "uuid",
  "nome": "João Silva",
  "email": "joao@example.com",
  "universidade": "UCAN",
  "curso": "Engenharia Informática",
  "status": "ACTIVO",
  "avatarUrl": "https://...",
  "createdAt": "2026-04-01T10:00:00Z"
}
```

**Errors**:

- `401` - Não autenticado
- `500` - Erro do servidor

---

### GET /api/estudante/contribuicoes

Obter histórico de contribuições do estudante logado

**Query Parameters**:

- `status` (optional) - Filtrar por status: CONFIRMADO, PENDENTE, FALHADO
- `limite` (optional) - Número máximo de resultados (padrão: 50)

**Response (200)**:

```json
[
  {
    "id": "uuid",
    "valor": 10000,
    "data": "2026-04-01",
    "status": "CONFIRMADO",
    "tipo": "ESTUDANTE"
  }
]
```

**Exemplo cURL**:

```bash
curl -X GET "http://localhost:3000/api/estudante/contribuicoes?status=CONFIRMADO&limite=10" \
  -H "Cookie: next-auth.session-token=seu_token"
```

---

### GET /api/estudante/patentes

Obter patentes conquistadas do estudante logado

**Response (200)**:

```json
[
  {
    "id": "uuid",
    "nome": "Ouro",
    "descricao": "Contribuiu com 50.000 AOA",
    "atingidaEm": "2026-04-15"
  }
]
```

---

## 🌍 Públicos - Sem Autenticação

### GET /api/public/info

Informações públicas sobre a plataforma

**Response (200)**:

```json
{
  "nome": "Fundo Mutualista",
  "versao": "1.0.0",
  "descricao": "Plataforma de gestão de contribuições e benefícios"
}
```

---

## 📝 Padrão de Resposta de Erro

Todos os erros seguem este padrão:

```json
{
  "erro": "Descrição do erro",
  "codigo": "ERROR_CODE",
  "timestamp": "2026-04-29T12:00:00Z"
}
```

---

## 🔑 Autenticação nas Requisições

### Cookie-based (NextAuth)

```bash
curl -X GET http://localhost:3000/api/admin/estudantes \
  -H "Cookie: next-auth.session-token=seu_token_jwt"
```

### Via JavaScript/Fetch

```javascript
const response = await fetch("/api/admin/estudantes", {
  method: "GET",
  credentials: "include", // Incluir cookies automaticamente
  headers: {
    "Content-Type": "application/json",
  },
});
```

---

## 🧪 Testar Endpoints

### Postman

1. Faça login em `/login` para obter cookie
2. Copie o cookie `next-auth.session-token`
3. No Postman, vá a Cookies e adicione
4. Faça requests para os endpoints

### cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -d "email=user@example.com&password=senha123" \
  -c cookies.txt

# Usar cookies em requisições seguintes
curl -X GET http://localhost:3000/api/admin/estudantes \
  -b cookies.txt
```

### Browser Console

```javascript
// Fazer fetch com credenciais automáticas
fetch("/api/admin/estudantes", {
  credentials: "include",
})
  .then((r) => r.json())
  .then(console.log);
```

---

## 📊 Rate Limiting

- Sem limite implementado atualmente
- Recomendado adicionar em produção (ex: using `express-rate-limit`)

---

## 🔒 Segurança

### Headers Recomendados

```
Content-Type: application/json
CSRF-Token: (se implementado)
Accept: application/json
```

### Tokens JWT

- Expiram automaticamente (configurável em NextAuth)
- Armazenados em cookies httpOnly (seguro)
- Validados em cada requisição

---

## 📞 Exemplos Completos

### Exemplo 1: Login e Acesso a Admin

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha123"}' \
  -c cookies.txt

# 2. Aceder a estudantes
curl -X GET http://localhost:3000/api/admin/estudantes \
  -b cookies.txt
```

### Exemplo 2: Update Status em JS

```javascript
async function updateStatus(id, novoStatus) {
  const response = await fetch(`/api/admin/estudantes/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: novoStatus }),
  });
  return response.json();
}

updateStatus("uuid-123", "SUSPENSO").then(console.log);
```

---

**Última atualização**: Abril 2026
