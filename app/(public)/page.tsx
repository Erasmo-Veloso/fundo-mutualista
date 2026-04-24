import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f2ea] text-[#1c1e22]">
      <div className="pointer-events-none absolute inset-0">
        <div className="orb-left absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary-400/25 blur-3xl" />
        <div className="orb-right absolute -right-20 top-52 h-80 w-80 rounded-full bg-accent-400/25 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-6 sm:px-8">
        <header className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d6d1c4] px-5 py-4">
          <p className="text-xl font-black tracking-tight text-primary-800">
            FundoMutualista
          </p>
          <nav className="flex items-center gap-5 text-sm text-gray-600">
            <a href="#inicio" className="font-semibold text-primary-700">
              Início
            </a>
            <a href="#como-funciona" className="hover:text-gray-800">
              Como funciona
            </a>
            <a href="#impacto" className="hover:text-gray-800">
              Impacto
            </a>
            <a href="#faq" className="hover:text-gray-800">
              FAQ
            </a>
          </nav>
          <Link
            href="/register"
            className="rounded-md bg-primary-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-600"
          >
            Começar agora
          </Link>
        </header>

        <section
          id="inicio"
          className="scroll-mt-24 grid gap-8 pb-10 pt-10 lg:grid-cols-[1.08fr_1fr] lg:items-center"
        >
          <div>
            <p className="inline-flex rounded-full bg-accent-400 px-3 py-1 text-[11px] font-semibold text-accent-800">
              Co-financiamento activo
            </p>

            <h1 className="mt-5 max-w-xl text-4xl font-black leading-[1.02] sm:text-6xl">
              O teu investimento multiplica-se até 5x
            </h1>

            <p className="mt-4 max-w-xl text-[15px] leading-6 text-gray-600">
              FundoMutualista conecta estudantes, parceiros institucionais e
              mentores numa plataforma que converte poupança em oportunidade
              real.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-md bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-800"
              >
                Registar agora
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-[#c8c4b7] bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-[#f0ede5]"
              >
                Entrar
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="glass-panel rounded-xl border border-[#ddd7ca] px-4 py-3">
                <p className="text-xl font-bold">847</p>
                <p className="text-xs text-gray-500">membros activos</p>
              </div>
              <div className="glass-panel rounded-xl border border-[#ddd7ca] px-4 py-3">
                <p className="text-xl font-bold">1.2M Kz</p>
                <p className="text-xs text-gray-500">no fundo</p>
              </div>
              <div className="glass-panel rounded-xl border border-[#ddd7ca] px-4 py-3">
                <p className="text-xl font-bold">23</p>
                <p className="text-xs text-gray-500">bolsas atribuídas</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="hero-glow absolute -inset-2 rounded-2xl bg-gradient-to-br from-primary-400/35 to-accent-400/35 blur-xl" />
            <div className="relative rounded-2xl border border-[#d6d1c4] bg-[#0f3b39] p-3 shadow-2xl">
              <div className="relative h-[340px] overflow-hidden rounded-xl bg-gradient-to-br from-[#0f3b39] via-[#2e6f67] to-[#111d2a]">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
                  alt="Estudante a trabalhar no portátil"
                  className="h-full w-full object-cover opacity-85"
                />
                <div className="absolute bottom-4 left-4 rounded-lg bg-black/45 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                  FundoMutualista | Progresso académico em tempo real
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="scroll-mt-24 py-8">
          <h2 className="text-2xl font-black sm:text-3xl">Como funciona</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Uma jornada simples, transparente e poderosa para quem quer investir
            no futuro e para quem precisa de apoio imediato.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="glass-panel group rounded-2xl border border-[#ddd7ca] p-5 transition hover:-translate-y-1 hover:shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
                01
              </p>
              <h3 className="mt-2 text-lg font-bold">
                Contribui ou candidata-te
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Estudantes iniciam candidaturas com critérios claros e parceiros
                aprovados pela administracao fortalecem o fundo.
              </p>
            </article>

            <article className="glass-panel group rounded-2xl border border-[#ddd7ca] p-5 transition hover:-translate-y-1 hover:shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
                02
              </p>
              <h3 className="mt-2 text-lg font-bold">Matching automático</h3>
              <p className="mt-2 text-sm text-gray-600">
                Regras de matching multiplicam impacto financeiro e distribuem
                benefícios com base em mérito e urgência.
              </p>
            </article>

            <article className="glass-panel group rounded-2xl border border-[#ddd7ca] p-5 transition hover:-translate-y-1 hover:shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
                03
              </p>
              <h3 className="mt-2 text-lg font-bold">Acompanha o impacto</h3>
              <p className="mt-2 text-sm text-gray-600">
                Dashboards em tempo real mostram bolsas atribuídas, evolução dos
                estudantes e retorno social para os parceiros.
              </p>
            </article>
          </div>
        </section>

        <section id="impacto" className="scroll-mt-24 py-8">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="glass-panel rounded-2xl border border-[#ddd7ca] p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
                Para estudantes
              </p>
              <h3 className="mt-2 text-xl font-black">
                Apoio financeiro e mentoria
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Candidaturas a bolsas, apoio emergencial e acesso a benefícios
                académicos para manter o percurso activo.
              </p>
              <Link
                href="/apoio-especial"
                className="mt-4 inline-flex rounded-md border border-[#c8c4b7] bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-[#f0ede5]"
              >
                Pedir apoio especial
              </Link>
            </article>

            <article className="glass-panel rounded-2xl border border-[#ddd7ca] p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
                Para parceiros
              </p>
              <h3 className="mt-2 text-xl font-black">Parceria por convite</h3>
              <p className="mt-2 text-sm text-gray-600">
                Relatórios de impacto, certificações e visibilidade da marca com
                dados transparentes sobre cada contribuição.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-flex rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
              >
                Falar com administracao
              </Link>
            </article>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 py-8">
          <h2 className="text-2xl font-black sm:text-3xl">
            Perguntas frequentes
          </h2>
          <div className="mt-4 grid gap-3">
            <details className="glass-panel rounded-xl border border-[#ddd7ca] px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold">
                Quem pode candidatar-se a apoio?
              </summary>
              <p className="mt-2 text-sm text-gray-600">
                Estudantes com conta no FundoMutualista e documentação válida de
                contexto académico ou emergência financeira.
              </p>
            </details>
            <details className="glass-panel rounded-xl border border-[#ddd7ca] px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold">
                Como os parceiros acompanham resultados?
              </summary>
              <p className="mt-2 text-sm text-gray-600">
                Pelo dashboard dedicado, com métricas de contribuição, matching
                aplicado e bolsas efectivamente apoiadas.
              </p>
            </details>
          </div>
        </section>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#ddd7ca] py-6 text-xs text-gray-500">
          <p className="font-semibold text-primary-700">FundoMutualista</p>
          <div className="flex items-center gap-4">
            <a href="#">Termos de uso</a>
            <a href="#">Privacidade</a>
            <a href="#">Contacto</a>
          </div>
          <p>© 2026 FundoMutualista. Educação que gera mobilidade social.</p>
        </footer>
      </div>
    </main>
  );
}
