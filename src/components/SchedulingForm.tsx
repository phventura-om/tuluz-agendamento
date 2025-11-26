import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Gira = {
  id: string;
  data: string;
  titulo: string;
  capacidade: number;
};

export function SchedulingForm() {
  const [gira, setGira] = useState<Gira | null>(null);
  const [vagasUsadas, setVagasUsadas] = useState<number | null>(null);

  const [loadingGira, setLoadingGira] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [primeiraVez, setPrimeiraVez] = useState<"sim" | "nao">("sim");
  const [observacoes, setObservacoes] = useState("");

  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // carrega gira ativa + vagas
  useEffect(() => {
    const carregarDados = async () => {
      setLoadingGira(true);
      setErro(null);

      // gira ativa
      const { data: giras, error } = await supabase
        .from("giras")
        .select("*")
        .eq("ativa", true)
        .order("data", { ascending: true })
        .limit(1);

      if (error) {
        console.error(error);
        setErro("Não foi possível carregar as informações de agendamento.");
        setLoadingGira(false);
        return;
      }

      if (!giras || giras.length === 0) {
        setGira(null);
        setLoadingGira(false);
        return;
      }

      const giraAtiva = giras[0] as Gira;
      setGira(giraAtiva);

      // conta quantos já agendaram
      const { count, error: countError } = await supabase
        .from("agendamentos")
        .select("id", { count: "exact", head: true })
        .eq("gira_id", giraAtiva.id);

      if (countError) {
        console.error(countError);
        setErro("Não foi possível carregar as vagas restantes.");
        setLoadingGira(false);
        return;
      }

      setVagasUsadas(count ?? 0);
      setLoadingGira(false);
    };

    carregarDados();
  }, []);

  const capacidade = gira?.capacidade ?? 0;
  const vagasRestantes =
    vagasUsadas !== null && gira ? Math.max(capacidade - vagasUsadas, 0) : null;
  const lotado = vagasRestantes !== null && vagasRestantes <= 0;

  function normalizarNome(nomeBruto: string): string {
    return nomeBruto
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // formata "2025-12-07" ou "2025-12-07T00:00:00Z" para "07/12/2025"
  function formatarDataBr(isoDate: string) {
    const onlyDate = isoDate.split("T")[0]; // garante só a parte da data
    const [year, month, day] = onlyDate.split("-");
    return `${day}/${month}/${year}`;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setMensagem(null);

    if (!gira) {
      setErro("No momento não há gira aberta para agendamento.");
      return;
    }

    if (!nome.trim()) {
      setErro("Por favor, preencha o campo de nome completo.");
      return;
    }

    if (lotado) {
      setErro("As vagas para esta gira já foram preenchidas.");
      return;
    }

    setSubmitting(true);

    const nomeNormalizado = normalizarNome(nome);

    // verifica duplicidade por nome na mesma gira
    const { data: duplicados, error: dupError } = await supabase
      .from("agendamentos")
      .select("id")
      .eq("gira_id", gira.id)
      .eq("nome_normalizado", nomeNormalizado)
      .limit(1);

    if (dupError) {
      console.error(dupError);
      setErro("Não foi possível verificar seu nome. Tente novamente em instantes.");
      setSubmitting(false);
      return;
    }

    if (duplicados && duplicados.length > 0) {
      setErro(
        "Já encontramos um agendamento em seu nome para esta gira. Caso precise ajustar algo, por favor fale com a organização."
      );
      setSubmitting(false);
      return;
    }

    // insere agendamento
    const { error: insertError } = await supabase.from("agendamentos").insert({
      gira_id: gira.id,
      nome: nome.trim(),
      nome_normalizado: nomeNormalizado,
      primeira_visita: primeiraVez === "sim",
      observacoes: observacoes.trim() || null,
      telefone: telefone.trim() || null,
      email: email.trim() || null,
    });

    if (insertError) {
      console.error(insertError);
      setErro(
        "Não foi possível concluir seu agendamento. Verifique se já não existe um agendamento em seu nome para esta gira."
      );
      setSubmitting(false);
      return;
    }

    setMensagem("Seu agendamento foi registrado com sucesso para esta gira.");
    setNome("");
    setTelefone("");
    setEmail("");
    setPrimeiraVez("sim");
    setObservacoes("");

    // atualiza contador de vagas
    const { count, error: countError } = await supabase
      .from("agendamentos")
      .select("id", { count: "exact", head: true })
      .eq("gira_id", gira.id);

    if (!countError) {
      setVagasUsadas(count ?? 0);
    }

    setSubmitting(false);
  };

  return (
    <section className="relative">
      <div className="bg-card rounded-xl shadow-md border border-border/60 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

        <h3 className="text-xl sm:text-2xl font-semibold text-primary text-center mb-1 font-playfair">
          Realizar Agendamento
        </h3>

        {/* Infos da gira */}
        <div className="text-center mb-6 text-sm text-muted-foreground">
          {loadingGira && <p>Carregando informações da próxima gira...</p>}

          {!loadingGira && !gira && (
            <p>No momento não há gira aberta para agendamento.</p>
          )}

          {gira && (
            <div className="space-y-1">
              <p className="font-medium text-foreground">{gira.titulo}</p>
              <p>
                Data:{" "}
                <span className="font-medium">
                  {formatarDataBr(gira.data)}
                </span>
              </p>
              {vagasRestantes !== null && (
                <p>
                  Vagas restantes:{" "}
                  <span className={lotado ? "text-red-600 font-semibold" : "font-semibold"}>
                    {vagasRestantes}
                  </span>
                </p>
              )}
              {lotado && (
                <p className="text-xs text-red-600 mt-1">
                  As vagas para esta gira estão esgotadas. Acompanhe os próximos avisos
                  nos canais oficiais do terreiro.
                </p>
              )}
            </div>
          )}
        </div>

        {erro && (
          <p className="mb-4 text-sm text-red-600 text-center whitespace-pre-line">
            {erro}
          </p>
        )}

        {mensagem && (
          <p className="mb-4 text-sm text-emerald-700 text-center whitespace-pre-line">
            {mensagem}
          </p>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="nome">
              Nome completo
            </label>
            <input
              id="nome"
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Digite seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loadingGira || lotado || submitting}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="telefone">
              Telefone / WhatsApp (opcional)
            </label>
            <input
              id="telefone"
              type="tel"
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              disabled={loadingGira || lotado || submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              E-mail (opcional)
            </label>
            <input
              id="email"
              type="email"
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loadingGira || lotado || submitting}
            />
          </div>

          <div>
            <p className="block text-sm font-medium mb-1">
              É a sua primeira vez no Terreiro de Umbanda Luzeiro Santo?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <button
                type="button"
                onClick={() => setPrimeiraVez("sim")}
                className={`w-full rounded-md px-3 py-2 border ${
                  primeiraVez === "sim"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border"
                }`}
                disabled={loadingGira || lotado || submitting}
              >
                Sim, é minha primeira vez
              </button>
              <button
                type="button"
                onClick={() => setPrimeiraVez("nao")}
                className={`w-full rounded-md px-3 py-2 border ${
                  primeiraVez === "nao"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border"
                }`}
                disabled={loadingGira || lotado || submitting}
              >
                Não, já frequento o terreiro
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="observacoes">
              Observações
            </label>
            <p className="text-xs text-muted-foreground mb-1">
              Nos informe se houver necessidades especiais ou se você é pessoa com
              deficiência (PCD), ou qualquer informação importante para o seu
              atendimento.
            </p>
            <textarea
              id="observacoes"
              className="w-full border rounded-md px-3 py-2 text-sm min-h-[96px]"
              placeholder="Escreva aqui suas observações..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={loadingGira || lotado || submitting}
            />
          </div>

          <button
            type="submit"
            disabled={loadingGira || lotado || submitting}
            className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {submitting ? "Enviando..." : "Confirmar agendamento"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default SchedulingForm;
