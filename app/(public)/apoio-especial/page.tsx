export default function ApoioEspecialPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-accent-50 to-white px-6 py-20">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-accent-50 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-accent-800">
          S-04 | Apoio Especial
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-800">
          Pedido de apoio especial
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Use este formulario para situacoes urgentes academicas, financeiras ou
          de bem-estar.
        </p>

        <form className="mt-8 space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">
              Nome completo
            </span>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-accent-600"
              placeholder="Seu nome"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-accent-600"
              placeholder="seu@email.com"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">
              Tipo de apoio
            </span>
            <select className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-accent-600">
              <option>Apoio financeiro emergencial</option>
              <option>Acompanhamento psicossocial</option>
              <option>Apoio academico urgente</option>
              <option>Outro</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">
              Descreva a situacao
            </span>
            <textarea
              rows={5}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-accent-600"
              placeholder="Explique o contexto, urgencia e o apoio que necessita"
            />
          </label>

          <button
            type="button"
            className="w-full rounded-lg bg-accent-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-800"
          >
            Enviar pedido
          </button>
        </form>
      </section>
    </main>
  );
}
