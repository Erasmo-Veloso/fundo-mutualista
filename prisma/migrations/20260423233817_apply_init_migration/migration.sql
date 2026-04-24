/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('ESTUDANTE', 'PARCEIRO', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatusUtilizador" AS ENUM ('ACTIVO', 'TEMPORARIO', 'SUSPENSO', 'PENDENTE');

-- CreateEnum
CREATE TYPE "TipoParceiro" AS ENUM ('EMPRESA', 'ONG', 'UNIVERSIDADE', 'DOADOR_PRIVADO');

-- CreateEnum
CREATE TYPE "NivelParceiro" AS ENUM ('BRONZE', 'PRATA', 'OURO', 'PLATINA');

-- CreateEnum
CREATE TYPE "StatusParceiro" AS ENUM ('ACTIVO', 'INACTIVO', 'SUSPENSO', 'PENDENTE');

-- CreateEnum
CREATE TYPE "TipoContribuicao" AS ENUM ('ESTUDANTE', 'PARCEIRO');

-- CreateEnum
CREATE TYPE "StatusContribuicao" AS ENUM ('CONFIRMADO', 'PENDENTE', 'FALHADO');

-- CreateEnum
CREATE TYPE "TipoBeneficio" AS ENUM ('BOLSA', 'DESCONTO', 'CURSO', 'MENTORIA', 'PRIORIDADE');

-- CreateEnum
CREATE TYPE "StatusBeneficioEstudante" AS ENUM ('ACTIVO', 'PENDENTE', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "StatusSolicitacaoApoio" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO', 'INFO_SOLICITADA');

-- CreateEnum
CREATE TYPE "EventoMatching" AS ENUM ('CONTRIBUICAO', 'BOLSA', 'EMERGENCIA');

-- CreateEnum
CREATE TYPE "TipoBolsa" AS ENUM ('INTEGRAL', 'PARCIAL');

-- CreateEnum
CREATE TYPE "StatusBolsa" AS ENUM ('ACTIVA', 'ENCERRADA', 'SUSPENSA');

-- CreateEnum
CREATE TYPE "StatusCandidaturaBolsa" AS ENUM ('SUBMETIDA', 'EM_ANALISE', 'ENTREVISTA', 'APROVADA', 'REJEITADA');

-- CreateEnum
CREATE TYPE "StatusApoioEmergencial" AS ENUM ('PENDENTE', 'APROVADO', 'PARCIAL', 'REJEITADO');

-- CreateEnum
CREATE TYPE "AudienciaComunicado" AS ENUM ('TODOS', 'ESTUDANTES', 'PARCEIROS');

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "VerificationToken";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Utilizador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "papel" "Papel" NOT NULL,
    "universidade" TEXT,
    "curso" TEXT,
    "status" "StatusUtilizador" NOT NULL DEFAULT 'PENDENTE',
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utilizador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parceiro" (
    "id" TEXT NOT NULL,
    "utilizadorId" TEXT NOT NULL,
    "tipo" "TipoParceiro" NOT NULL,
    "nif" TEXT,
    "website" TEXT,
    "sector" TEXT,
    "nivel" "NivelParceiro" NOT NULL DEFAULT 'BRONZE',
    "aporteTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "StatusParceiro" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parceiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribuicao" (
    "id" TEXT NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" "TipoContribuicao" NOT NULL,
    "estudanteId" TEXT,
    "parceiroId" TEXT,
    "status" "StatusContribuicao" NOT NULL DEFAULT 'PENDENTE',
    "metodoPagamento" TEXT,
    "referencia" TEXT,
    "recibo" TEXT,
    "fundoId" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Contribuicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fundo" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "totalContribuicoes" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "totalCofinanciamento" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "saldoDisponivel" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fundo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficio" (
    "id" TEXT NOT NULL,
    "tipo" "TipoBeneficio" NOT NULL,
    "descricao" TEXT NOT NULL,
    "requisitos" TEXT,
    "valor" DECIMAL(14,2),
    "parceiroId" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Beneficio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeneficioEstudante" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "beneficioId" TEXT NOT NULL,
    "status" "StatusBeneficioEstudante" NOT NULL DEFAULT 'PENDENTE',
    "dataAtribuicao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataExpiracao" TIMESTAMP(3),

    CONSTRAINT "BeneficioEstudante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoApoioEspecial" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "documentos" TEXT[],
    "status" "StatusSolicitacaoApoio" NOT NULL DEFAULT 'PENDENTE',
    "adminId" TEXT,
    "resolvidoEm" TIMESTAMP(3),
    "observacoes" TEXT,

    CONSTRAINT "SolicitacaoApoioEspecial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchingRule" (
    "id" TEXT NOT NULL,
    "parceiroId" TEXT NOT NULL,
    "evento" "EventoMatching" NOT NULL,
    "multiplicador" INTEGER NOT NULL DEFAULT 1,
    "capMensal" DECIMAL(14,2),
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MatchingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bolsa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoBolsa" NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "prazo" TIMESTAMP(3) NOT NULL,
    "requisitos" TEXT,
    "vagasTotal" INTEGER NOT NULL,
    "vagasDisponiveis" INTEGER NOT NULL,
    "status" "StatusBolsa" NOT NULL DEFAULT 'ACTIVA',

    CONSTRAINT "Bolsa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidaturaBolsa" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "bolsaId" TEXT NOT NULL,
    "cartaMotivacao" TEXT NOT NULL,
    "documentos" TEXT[],
    "media" DECIMAL(4,2),
    "status" "StatusCandidaturaBolsa" NOT NULL DEFAULT 'SUBMETIDA',
    "adminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidaturaBolsa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApoioEmergencial" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valorSolicitado" DECIMAL(14,2) NOT NULL,
    "valorAprovado" DECIMAL(14,2),
    "justificacao" TEXT NOT NULL,
    "documentos" TEXT[],
    "status" "StatusApoioEmergencial" NOT NULL DEFAULT 'PENDENTE',
    "adminId" TEXT NOT NULL,
    "resolvidoEm" TIMESTAMP(3),

    CONSTRAINT "ApoioEmergencial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificacao" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT,
    "parceiroId" TEXT,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "emitidoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL,
    "utilizadorId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comunicado" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "audiencia" "AudienciaComunicado" NOT NULL,
    "fixado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comunicado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilizador_email_key" ON "Utilizador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Parceiro_utilizadorId_key" ON "Parceiro"("utilizadorId");

-- CreateIndex
CREATE UNIQUE INDEX "Parceiro_nif_key" ON "Parceiro"("nif");

-- CreateIndex
CREATE INDEX "Contribuicao_estudanteId_idx" ON "Contribuicao"("estudanteId");

-- CreateIndex
CREATE INDEX "Contribuicao_parceiroId_idx" ON "Contribuicao"("parceiroId");

-- CreateIndex
CREATE INDEX "Contribuicao_data_idx" ON "Contribuicao"("data");

-- CreateIndex
CREATE INDEX "BeneficioEstudante_status_idx" ON "BeneficioEstudante"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BeneficioEstudante_estudanteId_beneficioId_key" ON "BeneficioEstudante"("estudanteId", "beneficioId");

-- CreateIndex
CREATE INDEX "SolicitacaoApoioEspecial_estudanteId_idx" ON "SolicitacaoApoioEspecial"("estudanteId");

-- CreateIndex
CREATE INDEX "SolicitacaoApoioEspecial_adminId_idx" ON "SolicitacaoApoioEspecial"("adminId");

-- CreateIndex
CREATE INDEX "SolicitacaoApoioEspecial_status_idx" ON "SolicitacaoApoioEspecial"("status");

-- CreateIndex
CREATE INDEX "MatchingRule_parceiroId_idx" ON "MatchingRule"("parceiroId");

-- CreateIndex
CREATE INDEX "CandidaturaBolsa_estudanteId_idx" ON "CandidaturaBolsa"("estudanteId");

-- CreateIndex
CREATE INDEX "CandidaturaBolsa_bolsaId_idx" ON "CandidaturaBolsa"("bolsaId");

-- CreateIndex
CREATE INDEX "CandidaturaBolsa_adminId_idx" ON "CandidaturaBolsa"("adminId");

-- CreateIndex
CREATE INDEX "CandidaturaBolsa_status_idx" ON "CandidaturaBolsa"("status");

-- CreateIndex
CREATE INDEX "ApoioEmergencial_estudanteId_idx" ON "ApoioEmergencial"("estudanteId");

-- CreateIndex
CREATE INDEX "ApoioEmergencial_adminId_idx" ON "ApoioEmergencial"("adminId");

-- CreateIndex
CREATE INDEX "ApoioEmergencial_status_idx" ON "ApoioEmergencial"("status");

-- CreateIndex
CREATE INDEX "Certificacao_estudanteId_idx" ON "Certificacao"("estudanteId");

-- CreateIndex
CREATE INDEX "Certificacao_parceiroId_idx" ON "Certificacao"("parceiroId");

-- CreateIndex
CREATE INDEX "Notificacao_utilizadorId_idx" ON "Notificacao"("utilizadorId");

-- CreateIndex
CREATE INDEX "Notificacao_lida_idx" ON "Notificacao"("lida");

-- CreateIndex
CREATE INDEX "Comunicado_autorId_idx" ON "Comunicado"("autorId");

-- CreateIndex
CREATE INDEX "Comunicado_audiencia_idx" ON "Comunicado"("audiencia");

-- AddForeignKey
ALTER TABLE "Parceiro" ADD CONSTRAINT "Parceiro_utilizadorId_fkey" FOREIGN KEY ("utilizadorId") REFERENCES "Utilizador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribuicao" ADD CONSTRAINT "Contribuicao_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Utilizador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribuicao" ADD CONSTRAINT "Contribuicao_parceiroId_fkey" FOREIGN KEY ("parceiroId") REFERENCES "Parceiro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribuicao" ADD CONSTRAINT "Contribuicao_fundoId_fkey" FOREIGN KEY ("fundoId") REFERENCES "Fundo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficio" ADD CONSTRAINT "Beneficio_parceiroId_fkey" FOREIGN KEY ("parceiroId") REFERENCES "Parceiro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficioEstudante" ADD CONSTRAINT "BeneficioEstudante_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Utilizador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficioEstudante" ADD CONSTRAINT "BeneficioEstudante_beneficioId_fkey" FOREIGN KEY ("beneficioId") REFERENCES "Beneficio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoApoioEspecial" ADD CONSTRAINT "SolicitacaoApoioEspecial_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Utilizador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoApoioEspecial" ADD CONSTRAINT "SolicitacaoApoioEspecial_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Utilizador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchingRule" ADD CONSTRAINT "MatchingRule_parceiroId_fkey" FOREIGN KEY ("parceiroId") REFERENCES "Parceiro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidaturaBolsa" ADD CONSTRAINT "CandidaturaBolsa_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Utilizador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidaturaBolsa" ADD CONSTRAINT "CandidaturaBolsa_bolsaId_fkey" FOREIGN KEY ("bolsaId") REFERENCES "Bolsa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidaturaBolsa" ADD CONSTRAINT "CandidaturaBolsa_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Utilizador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApoioEmergencial" ADD CONSTRAINT "ApoioEmergencial_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Utilizador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApoioEmergencial" ADD CONSTRAINT "ApoioEmergencial_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificacao" ADD CONSTRAINT "Certificacao_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Utilizador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificacao" ADD CONSTRAINT "Certificacao_parceiroId_fkey" FOREIGN KEY ("parceiroId") REFERENCES "Parceiro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_utilizadorId_fkey" FOREIGN KEY ("utilizadorId") REFERENCES "Utilizador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comunicado" ADD CONSTRAINT "Comunicado_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
