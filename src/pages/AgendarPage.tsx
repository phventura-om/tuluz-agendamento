import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Gira = {
  id: string;
  data: string;
  titulo: string;
  capacidade: number;
  tipo?: string | null;
};

export function AgendarPage() {
  const [gira, setGira] = useState<Gira | null>(null);
  const [vagasUsadas, setVagasUsadas] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [primeiraVisita, setPrimeiraVisita] = useState<"sim" | "nao">("sim");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErro(null);

      const { data: giras, error: giraError } = await supabase
        .from("giras")
        .select("*")
        .eq("ativa", true)
        .order("data", { ascending: true })
        .limit(1);

      if (giraError) {
        console.error(giraError);
        setErro(
          "Não foi possível carregar a gira. Tente novamente em alguns instantes."
        );
        setLoading(false);
        return;
      }

      if (!giras || giras.length === 0) {
        setGira(null);
        setLoading(false);
        return;
      }

      const giraAtiva = giras[0] as Gira;
      setGira(giraAtiva);

      const { count, error: countError } = await supabase
        .from("agendamentos")
        .select("id", { count: "exact", head: true })
        .eq("gira_id", giraAtiva.id);

      if (countError) {
        console.error(countError);
        setErro("Não foi possível carregar as vagas. Tente novamente.");
        setLoading(false);
        return;
      }

      setVagasUsadas(count ?? 0);
      setLoading(false);
    };

    fetchData();
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setMensagem(null);

    if (!gira) {
      setErro("Nenhuma gira ativa no momento.");
      return;
    }

    if (!nome.trim()) {
      setErro("Por favor, preencha seu nome.");
      return;
    }

    // UX: se já está lotado pela contagem, nem tenta
    if (lotado) {
      setErro("As vagas para esta gira já estão esgotadas.");
      return;
    }

    setFormLoading(true);

    // Re-checa se a gira ainda está ativa no banco antes de prosseguir
    const { data: giraAtual, error: checkError } = await supabase
      .from("giras")
      .select("ativa")
      .eq("id", gira.id)
      .single();

    if (checkError || !giraAtual?.ativa) {
      setErro("Esta gira foi desativada no momento. Não é mais possível realizar agendamentos.");
      setFormLoading(false);
      return;
    }

    const nomeNormalizado = normalizarNome(nome);

    // verificação de duplicidade pelo nome_normalizado
    const { data: duplicados, error: dupError } = await supabase
      .from("agendamentos")
      .select("id")
      .eq("gira_id", gira.id)
      .eq("nome_normalizado", nomeNormalizado)
      .limit(1);

    if (dupError) {
      console.error(dupError);
      setErro("Não foi possível verificar seu agendamento. Tente novamente.");
      setFormLoading(false);
      return;
    }

    if (duplicados && duplicados.length > 0) {
      setErro(
        "Já encontramos um agendamento em seu nome para esta gira. Caso precise ajustar algo, fale com a organização ao chegar."
      );
      setFormLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("agendamentos").insert({
      gira_id: gira.id,
      nome: nome.trim(),
      nome_normalizado: nomeNormalizado,
      primeira_visita: primeiraVisita === "sim",
      observacoes: observacoes.trim() || null,
      telefone: telefone.trim() || null,
      email: email.trim() || null,
    });

    if (insertError) {
      console.error(insertError);

      const msg = (insertError as any).message || "";
      const details = (insertError as any).details || "";

      // trata especificamente o erro do trigger de capacidade
      if (
        msg.includes("Capacidade máxima atingida") ||
        details.includes("Capacidade máxima atingida")
      ) {
        setErro(
          "As vagas para esta gira já estão esgotadas. Escolha outra data ou aguarde a próxima abertura."
        );

        // recarrega a contagem real do banco (caso tenha lotado na disputa pela última vaga)
        const { count, error: countError2 } = await supabase
          .from("agendamentos")
          .select("id", { count: "exact", head: true })
          .eq("gira_id", gira.id);

        if (!countError2) {
          setVagasUsadas(count ?? 0);
        }

      } else {
        setErro(
          "Não foi possível concluir seu agendamento. Verifique se já não existe um agendamento em seu nome para esta gira ou tente novamente em alguns instantes."
        );
      }

      setFormLoading(false);
      return;
    }

    // sucesso
    setMensagem("Seu agendamento foi realizado com sucesso para a gira ativa.");
    setNome("");
    setTelefone("");
    setEmail("");
    setPrimeiraVisita("sim");
    setObservacoes("");

    // atualiza contagem após o insert
    const { count, error: countError } = await supabase
      .from("agendamentos")
      .select("id", { count: "exact", head: true })
      .eq("gira_id", gira.id);

    if (!countError) {
      setVagasUsadas(count ?? 0);
    }

    setFormLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando informações da gira...</p>
      </div>
    );
  }

  if (!gira) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No momento não há gira aberta para agendamento.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">{gira.titulo}</h1>
        <p className="text-center text-sm text-gray-600">
          Data: {new Date(gira.data).toLocaleDateString("pt-BR")}
        </p>

        {vagasRestantes !== null && (
          <p className="text-center text-sm">
            Vagas restantes:{" "}
            <span className={lotado ? "text-red-600 font-semibold" : "font-semibold"}>
              {vagasRestantes}
            </span>
          </p>
        )}

        {lotado && (
          <p className="text-center text-red-600 text-sm">
            As vagas para esta gira estão esgotadas.
          </p>
        )}

        {erro && <p className="text-red-600 text-sm text-center">{erro}</p>}
        {mensagem && <p className="text-green-600 text-sm text-center">{mensagem}</p>}

        {!lotado && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="nome">
                Nome completo
              </label>
              <input
                id="nome"
                type="text"
                className="w-full border rounded px-3 py-2 text-sm"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="telefone">
                Telefone para contato (opcional)
              </label>
              <input
                id="telefone"
                type="text"
                className="w-full border rounded px-3 py-2 text-sm"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Ex: (32) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                E-mail para contato (opcional)
              </label>
              <input
                id="email"
                type="email"
                className="w-full border rounded px-3 py-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: seuemail@exemplo.com"
              />
            </div>

            <div>
              <p className="block text-sm font-medium mb-1">
                É a sua primeira visita?
              </p>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="primeira_visita"
                    value="sim"
                    checked={primeiraVisita === "sim"}
                    onChange={() => setPrimeiraVisita("sim")}
                  />
                  <span>Sim</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="primeira_visita"
                    value="nao"
                    checked={primeiraVisita === "nao"}
                    onChange={() => setPrimeiraVisita("nao")}
                  />
                  <span>Não</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="observacoes">
                Observações ou necessidades especiais
              </label>
              <textarea
                id="observacoes"
                className="w-full border rounded px-3 py-2 text-sm"
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: dificuldade de locomoção, necessidade de cadeira, etc."
              />
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-2 rounded bg-slate-900 text-white text-sm font-medium disabled:opacity-60"
            >
              {formLoading ? "Enviando..." : "Garantir minha vaga"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
