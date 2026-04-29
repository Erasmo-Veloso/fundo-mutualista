# Fundo Mutualista - Documentação Completa

Bem-vindo à documentação do **Fundo Mutualista**, uma plataforma de gestão de contribuições e benefícios para estudantes, parceiros e administradores.

## 📋 Índice de Documentação

1. **[SETUP.md](./SETUP.md)** - Instruções de instalação e configuração inicial
2. **[ARQUITETURA.md](./ARQUITETURA.md)** - Visão geral da arquitetura do projeto
3. **[ADMIN-DASHBOARD.md](./ADMIN-DASHBOARD.md)** - Guia completo do dashboard administrativo
4. **[API-ENDPOINTS.md](./API-ENDPOINTS.md)** - Documentação de todos os endpoints da API
5. **[BANCO-DADOS.md](./BANCO-DADOS.md)** - Estrutura do banco de dados
6. **[AUTENTICACAO.md](./AUTENTICACAO.md)** - Sistema de autenticação e autorização
7. **[DEPLOY.md](./DEPLOY.md)** - Guia passo-a-passo de deployment para produção
8. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Resolução de problemas comuns
9. **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)** - Referência rápida e cheat sheet

## 🎯 Visão Geral Rápida

**Fundo Mutualista** é uma plataforma web construída com:

- **Frontend**: Next.js 16.2.4 com TypeScript e Tailwind CSS
- **Backend**: API REST integrada no Next.js
- **Banco de Dados**: PostgreSQL (via Neon)
- **Autenticação**: NextAuth 5.0.0-beta.31
- **ORM**: Prisma 6.19.3

### Papéis de Utilizadores

- **Estudante**: Acesso à área pessoal, histórico de contribuições, patentes conquistadas
- **Parceiro**: Gestão de anúncios e ofertas
- **Administrador**: Gestão completa de estudantes, contribuições, relatórios

### Funcionalidades Principais

✅ Autenticação segura com JWT  
✅ Gestão de contribuições dos estudantes  
✅ Sistema de patentes/níveis  
✅ Dashboard administrativo completo  
✅ API RESTful bem documentada  
✅ Interface responsiva e profissional

## 🚀 Quick Start

```bash
# 1. Clonar o projeto
git clone <repo-url>
cd fundo-mutualista

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente (ver SETUP.md)
cp .env.example .env.local

# 4. Executar migrações do banco de dados
npx prisma migrate dev

# 5. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` e faça login com as credenciais do seu utilizador.

## 📂 Estrutura do Projeto

```
fundo-mutualista/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Rotas administrativas
│   ├── (estudante)/       # Rotas de estudantes
│   ├── (parceiro)/        # Rotas de parceiros
│   ├── (public)/          # Rotas públicas (login, register)
│   ├── api/               # Endpoints da API
│   └── layout.tsx         # Layout raiz
├── components/
│   ├── admin/             # Componentes administrativos
│   ├── estudante/         # Componentes de estudantes
│   ├── parceiro/          # Componentes de parceiros
│   ├── shared/            # Componentes compartilhados
│   └── ui/                # Componentes reutilizáveis
├── lib/
│   ├── auth.ts            # Configuração NextAuth
│   ├── prisma.ts          # Cliente Prisma
│   └── validators.ts      # Schemas de validação Zod
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   └── migrations/        # Histórico de migrações
├── types/                 # Tipos TypeScript
├── emails/                # Templates de emails
├── docs/                  # Documentação (este arquivo)
└── public/                # Assets estáticos
```

## 🔐 Variáveis de Ambiente

As seguintes variáveis são **obrigatórias** para funcionamento:

```env
DATABASE_URL=postgresql://user:password@host:5432/db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua_chave_secreta_aqui
```

Veja [SETUP.md](./SETUP.md) para mais detalhes.

## 👨‍💼 Suporte ao Cliente

### Para Modificações

Se precisar adicionar novas funcionalidades ou fazer modificações:

1. Consulte [ARQUITETURA.md](./ARQUITETURA.md) para entender a estrutura
2. Veja [API-ENDPOINTS.md](./API-ENDPOINTS.md) para entender as APIs existentes
3. Consulte [BANCO-DADOS.md](./BANCO-DADOS.md) se precisar adicionar campos

### Para Troubleshooting

Consulte [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para resolver problemas comuns.

## 📞 Contactos Importantes

- **Desenvolvedor**: [Seu nome/contacto]
- **Hosting**: [Informações de hosting]
- **Banco de Dados**: Neon PostgreSQL
- **Domínio**: [URL da aplicação]

## 📝 Notas Importantes

- **Backup do Banco de Dados**: Faça backups regulares (recomendado diariamente)
- **Segurança**: Nunca exponha `NEXTAUTH_SECRET` ou `DATABASE_URL` em repositórios públicos
- **Atualizações**: Consulte o arquivo `package.json` para versões das dependências
- **Logs**: Verifique `.next/dev/logs/` para debugging em desenvolvimento

---

**Última atualização**: Abril 2026  
**Versão do Projeto**: 1.0.0
