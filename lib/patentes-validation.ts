import { TipoBeneficio } from "@prisma/client";
import { z } from "zod";

const isoDateString = z
  .string()
  .datetime()
  .or(z.string().date());

const optionalIsoDateString = isoDateString.nullish();

const nonEmptyString = z.string().trim().min(1, "Campo obrigatório.");

const nullableString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  });

const nullablePositiveInt = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null || value === "") return null;
    const parsed = typeof value === "string" ? Number(value) : value;
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  })
  .refine(
    (value) => value === null || (Number.isInteger(value) && value >= 0),
    "Deve ser um número inteiro maior ou igual a 0.",
  );

const patenteColorSchema = z
  .string()
  .trim()
  .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, "Cor hexadecimal inválida.");

const patenteIconSchema = z
  .string()
  .trim()
  .min(1, "Ícone é obrigatório.")
  .max(100, "Ícone inválido.");

const configuracaoSchemas = {
  [TipoBeneficio.DESCONTO_UNIVERSIDADE]: z.object({
    universidade: nonEmptyString,
    percentagem: z.number().min(0).max(100),
    condicoes: nonEmptyString,
    validadeMeses: z.number().int().min(1),
  }),
  [TipoBeneficio.CURSO_ONLINE]: z.object({
    curso: nonEmptyString,
    plataforma: nonEmptyString,
    duracao: nonEmptyString,
    area: nonEmptyString,
    linkAcesso: z.string().trim().url("Link de acesso inválido."),
  }),
  [TipoBeneficio.CERTIFICACAO_PROFISSIONAL]: z.object({
    nome: nonEmptyString,
    entidade: nonEmptyString,
    validadeMeses: z.number().int().min(1),
    requisitos: nonEmptyString,
  }),
  [TipoBeneficio.MENTORIA_INDIVIDUAL]: z.object({
    sessoesIncluidas: z.number().int().min(1),
    duracaoMinutos: z.number().int().min(1),
    area: nonEmptyString,
    formato: nonEmptyString,
  }),
  [TipoBeneficio.BOLSA_PARCIAL]: z.object({
    percentagemCobertura: z.number().min(0).max(100),
    universidades: z.array(nonEmptyString).min(1),
    mediaMinima: z.number().min(0).max(20),
  }),
  [TipoBeneficio.BOLSA_INTEGRAL]: z.object({
    universidades: z.array(nonEmptyString).min(1),
    mediaMinima: z.number().min(0).max(20),
    duracaoMaxAnos: z.number().int().min(1),
  }),
  [TipoBeneficio.PRIORIDADE_CANDIDATURA]: z.object({
    tipoPrioridade: nonEmptyString,
    multiplicadorPontuacao: z.number().positive(),
  }),
  [TipoBeneficio.APOIO_EMERGENCIAL_ALARGADO]: z.object({
    valorMaximo: z.number().positive(),
    pedidosPorAno: z.number().int().min(1),
  }),
  [TipoBeneficio.DESCONTO_MATERIAL]: z.object({
    parceiro: nonEmptyString,
    tipoDesconto: nonEmptyString,
    valor: z.number().positive(),
    limiteUsos: z.number().int().min(1),
  }),
  [TipoBeneficio.REDE_APOIO_PRIORITARIO]: z.object({
    recursos: z.array(nonEmptyString).min(1),
    duracaoMeses: z.number().int().min(1),
  }),
} satisfies Record<TipoBeneficio, z.ZodTypeAny>;

export const patenteBaseSchema = z.object({
  nome: nonEmptyString.max(100, "Nome demasiado longo."),
  descricao: nonEmptyString.max(500, "Descrição demasiado longa."),
  limiarKz: z.coerce.number().min(0, "O limiar deve ser maior ou igual a 0."),
  cor: patenteColorSchema,
  icone: patenteIconSchema,
  ordem: z.coerce.number().int().min(1, "A ordem deve ser maior que 0."),
  ativo: z.coerce.boolean().optional().default(true),
});

export const patenteCreateSchema = patenteBaseSchema;

export const patenteUpdateSchema = patenteBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "Pelo menos um campo deve ser enviado para actualizar a patente.",
);

export const beneficioBaseSchema = z.object({
  nome: nonEmptyString.max(140, "Nome demasiado longo."),
  descricao: nonEmptyString.max(2000, "Descrição demasiado longa."),
  comoUtilizar: nonEmptyString.max(4000, "Instruções demasiado longas."),
  tipo: z.nativeEnum(TipoBeneficio),
  configuracao: z.record(z.string(), z.unknown()),
  parceiro: nullableString,
  logoUrl: z
    .union([z.string().trim().url("Logo URL inválido."), z.null(), z.undefined()])
    .transform((value) => value ?? null),
  validade: optionalIsoDateString,
  limitUsos: nullablePositiveInt,
  ativo: z.coerce.boolean().optional().default(true),
});

export const beneficioCreateSchema = beneficioBaseSchema.superRefine(
  (data, ctx) => {
    const configSchema = configuracaoSchemas[data.tipo];
    const parsed = configSchema.safeParse(data.configuracao);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: issue.message,
          path: ["configuracao", ...issue.path],
        });
      }
    }
  },
);

export const beneficioUpdateSchema = beneficioBaseSchema
  .partial()
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Pelo menos um campo deve ser enviado para actualizar o benefício.",
      });
      return;
    }

    if (data.tipo && data.configuracao) {
      const configSchema = configuracaoSchemas[data.tipo];
      const parsed = configSchema.safeParse(data.configuracao);

      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: issue.message,
            path: ["configuracao", ...issue.path],
          });
        }
      }
    }
  });

export const associarBeneficioPatenteSchema = z.object({
  beneficioId: z.string().trim().min(1, "beneficioId é obrigatório."),
});

export const patenteIdParamSchema = z.object({
  id: z.string().trim().min(1, "id é obrigatório."),
});

export const beneficioIdParamSchema = z.object({
  beneficioId: z.string().trim().min(1, "beneficioId é obrigatório."),
});

export function parseBeneficioConfigByTipo(
  tipo: TipoBeneficio,
  configuracao: unknown,
) {
  return configuracaoSchemas[tipo].parse(configuracao);
}

export function safeParseBeneficioConfigByTipo(
  tipo: TipoBeneficio,
  configuracao: unknown,
) {
  return configuracaoSchemas[tipo].safeParse(configuracao);
}

export type PatenteCreateInput = z.infer<typeof patenteCreateSchema>;
export type PatenteUpdateInput = z.infer<typeof patenteUpdateSchema>;
export type BeneficioCreateInput = z.infer<typeof beneficioCreateSchema>;
export type BeneficioUpdateInput = z.infer<typeof beneficioUpdateSchema>;
export type AssociarBeneficioPatenteInput = z.infer<
  typeof associarBeneficioPatenteSchema
>;
