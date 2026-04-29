# Guia de Deploy para Produção

## 🚀 Passo-a-Passo Completo de Deployment

### Fase 1: Preparação Pré-Deploy ✅

#### 1.1 Verificar Build Local

```bash
# Limpar arquivos anteriores
rm -rf .next node_modules

# Reinstalar dependências
npm install

# Gerar cliente Prisma
npx prisma generate

# Build de teste local
npm run build

# Se sucesso → Continuar
# Se erro → Corrigir antes de deploar
```

#### 1.2 Verificar Type Checking

```bash
npm run type-check
npm run lint
```

#### 1.3 Validar Variáveis de Ambiente

```bash
# Certificar que .env.local tem:
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000 (será atualizado)
NEXTAUTH_SECRET=chave_aleatória_32+_caracteres

# Gerar novo NEXTAUTH_SECRET se necessário
openssl rand -base64 32
```

#### 1.4 Fazer Commit e Push

```bash
git add .
git commit -m "Prepara deploy para produção"
git push origin main
```

---

### Fase 2: Escolher Plataforma de Hosting 🏠

#### Opção A: Vercel (Recomendado para Next.js)

**Vantagens:**
- ✅ Integração perfeita com Next.js
- ✅ Zero-config deployment
- ✅ CDN global automático
- ✅ Preview deployments
- ✅ Monitoramento incluído

**Passo-a-passo Vercel:**

1. **Criar Conta**
   - Aceder a [https://vercel.com](https://vercel.com)
   - Sign up com GitHub
   - Autorizar Vercel

2. **Importar Projeto**
   - Dashboard → Add New → Project
   - Selecionar repositório: `fundo-mutualista`
   - Clicar "Import"

3. **Configurar Variáveis de Ambiente**
   - Environment Variables:
     ```
     DATABASE_URL = postgresql://...
     NEXTAUTH_URL = https://seu-dominio.vercel.app
     NEXTAUTH_SECRET = chave_aleatória_32+_caracteres
     ```
   - Clicar "Save"

4. **Deploy**
   - Clicar "Deploy"
   - Esperar ~3-5 minutos
   - URL gerada: `https://seu-projeto.vercel.app`

5. **Domínio Customizado** (opcional)
   - Settings → Domains
   - Add Domain
   - Seguir instruções de DNS

---

#### Opção B: Railway

**Vantagens:**
- ✅ Suporte PostgreSQL nativo
- ✅ Fácil configuração
- ✅ Preço acessível

**Passo-a-passo Railway:**

1. **Criar Conta**
   - Aceder a [https://railway.app](https://railway.app)
   - Sign up com GitHub

2. **Criar Novo Projeto**
   - Dashboard → New Project
   - Deploy from GitHub repo
   - Selecionar `fundo-mutualista`

3. **Adicionar Serviços**
   - PostgreSQL service (se não tiver)
   - Node.js service para app

4. **Configurar Variáveis**
   - Variables → Add Variable
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_URL=https://seu-dominio.up.railway.app
   NEXTAUTH_SECRET=chave_aleatória
   NODE_ENV=production
   ```

5. **Deploy**
   - Auto-deploy ativado
   - Logs em tempo real

---

#### Opção C: Azure App Service

**Passo-a-passo Azure:**

1. **Criar Conta Azure** (com créditos free se possível)

2. **Criar App Service**
   - Azure Portal → Create Resource
   - App Service
   - Runtime: Node.js 18 LTS
   - Region: Europe (Western)

3. **Configurar Deployment**
   - Deployment Center → GitHub
   - Autorizar e selecionar repositório
   - Branch: main

4. **Variáveis de Ambiente**
   - Application settings
   - Add Connection strings e App settings

5. **Deploy Automático**
   - GitHub Actions configurado automaticamente

---

### Fase 3: Configurar Banco de Dados 🗄️

#### Para Vercel/Railway (Recomendado: Neon)

1. **Criar Conta Neon**
   - Aceder a [https://neon.tech](https://neon.tech)
   - Sign up
   - Create Project

2. **Obter Connection String**
   - Project → Connection string
   - Copiar: `postgresql://user:password@host:5432/dbname`

3. **Salvar em Variáveis do Hosting**
   ```
   DATABASE_URL=postgresql://...
   ```

4. **Executar Migrações**
   ```bash
   # Via CLI do hosting ou local:
   npx prisma migrate deploy --skip-generate
   ```

---

### Fase 4: Configurar SSL/HTTPS 🔒

#### Vercel
- ✅ Automático com certificado Let's Encrypt

#### Railway
- ✅ Automático

#### Azure
- ✅ Automático para domínios .azurewebsites.net
- Custom domain: Adicionar certificado SSL

---

### Fase 5: Testes Pós-Deploy ✔️

#### 5.1 Verificar Página Inicial

```bash
# Testar URL
curl https://seu-dominio.vercel.app

# Verificar status code 200
```

#### 5.2 Testar Login

1. Aceder a `/login`
2. Entrar com credenciais
3. Verificar redirecionamento para `/estudante` ou `/admin`

#### 5.3 Testar APIs

```bash
# Listar estudantes
curl https://seu-dominio.vercel.app/api/admin/estudantes \
  -H "Cookie: next-auth.session-token=seu_token"

# Deve retornar 200 ou 401 (se não autenticado)
```

#### 5.4 Verificar Banco de Dados

```bash
# Conectar à BD de produção
psql postgresql://user:password@host:5432/dbname

# Verificar dados
SELECT COUNT(*) FROM "Utilizador";
```

#### 5.5 Monitorar Logs

**Vercel:**
- Dashboard → Deployments → Logs

**Railway:**
- Dashboard → Logs

**Azure:**
- App Service → Log Stream

---

### Fase 6: Setup de Domínio Customizado 🌐

#### Registrar Domínio

1. Escolher registar:
   - Namecheap.com
   - GoDaddy.com
   - AWS Route 53
   - Etc.

2. Copiar Name Servers do hosting

3. Atualizar Name Servers no registar

4. Esperar propagação (até 48h)

#### Configurar no Hosting

**Vercel:**
```
Settings → Domains → Add Domain
Nomear: seu-dominio.com
```

**Railway:**
```
Settings → Custom Domain
Adicionar: seu-dominio.com
Seguir instruções de CNAME
```

---

### Fase 7: Configurar Email (Opcional) 📧

#### Usando SendGrid

1. **Criar Conta**
   - [https://sendgrid.com](https://sendgrid.com)
   - Criar API Key

2. **Adicionar Variáveis**
   ```
   SENDGRID_API_KEY=SG...
   EMAIL_FROM=noreply@seu-dominio.com
   ```

3. **Implementar Envio**
   - Usar `@sendgrid/mail` em `/api/email/`

#### Usando Gmail (Não recomendado para produção)

```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=seu-email@gmail.com
EMAIL_SERVER_PASSWORD=app-password-gerado
```

---

### Fase 8: Backup e Monitoramento 🛡️

#### Configurar Backups (Neon)

1. Aceder a Neon Dashboard
2. Project Settings → Backups
3. Create Backup automático

#### Monitorar Aplicação

**Vercel Analytics:**
```
Dashboard → Analytics
- Performance
- Core Web Vitals
```

**Sentry (Error Tracking):**
```bash
npm install @sentry/nextjs
```

Configure em `next.config.js`:
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "seu-dsn-sentry",
  tracesSampleRate: 1.0,
});
```

---

### Fase 9: CI/CD com GitHub Actions 🔄

#### Criar `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📋 Checklist Final de Deploy

- [ ] Build local passa (`npm run build`)
- [ ] Type checking passa (`npm run type-check`)
- [ ] Linting passa (`npm run lint`)
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Banco de dados produção criado e testado
- [ ] Migrações aplicadas (`npx prisma migrate deploy`)
- [ ] Repositório com último código em main
- [ ] Plataforma de hosting escolhida e conta criada
- [ ] Variáveis adicionadas ao hosting
- [ ] Deploy realizado
- [ ] Login testado
- [ ] APIs testadas
- [ ] Domínio configurado (se customizado)
- [ ] SSL/HTTPS ativo
- [ ] Backups configurados
- [ ] Monitoring ativo

---

## 🆘 Problemas Comuns no Deploy

### "Build fails em produção"

**Solução:**
```bash
# Testar build localmente
npm run build

# Se falhar, corrigir errors
# Se passar, verificar variáveis no hosting
```

### "Database connection error"

**Verificar:**
```bash
# DATABASE_URL está correto?
# Pode estar com caracteres especiais escapados?

# Testar conexão
psql $DATABASE_URL -c "SELECT 1;"
```

### "NextAuth session not working"

**Verificar:**
```bash
# NEXTAUTH_URL está correto?
# NEXTAUTH_SECRET é válido?
# Cookies estão sendo enviados?
```

### "Build timeout"

**Solução:**
- Aumentar timeout no CI/CD
- Otimizar imports (lazy loading)
- Dividir chunks grandes

### "Static generation timeout"

**Solução:**
- Aumentar `maxDuration` em `next.config.js`:
```javascript
export const config = {
  maxDuration: 30, // 30 segundos
};
```

---

## 🚀 Commando Úteis Post-Deploy

```bash
# Ver logs em tempo real
vercel logs seu-projeto.vercel.app --follow

# Revert to previous deployment
vercel rollback

# Listar deployments
vercel ls

# Abrir projeto no browser
vercel open
```

---

## 📊 Monitoramento Contínuo

### Health Checks

```bash
# Cron job a verificar cada 5 min
curl -f https://seu-dominio.com/api/health || \
  send_alert "App is down"
```

### Logs

**Vercel:**
- Aceder a Dashboard → Deployments → Logs
- Filtrar por erro: `level:error`

**Railway:**
- Dashboard → Logs
- Real-time stream

---

## 🎯 Resumo - Próximos Passos

1. ✅ Testar build local
2. ✅ Escolher plataforma (recomendado: Vercel)
3. ✅ Criar conta e conectar repositório
4. ✅ Configurar variáveis de ambiente
5. ✅ Deploy automático
6. ✅ Testar aplicação
7. ✅ Configurar domínio (opcional)
8. ✅ Setup monitoramento
9. ✅ Backups configurados
10. ✅ Documentação atualizada

---

**Tempo estimado**: 30-45 minutos  
**Custo**: $0-20/mês (dependendo de plataforma)  
**Complexidade**: Média

**Última atualização**: Abril 2026
