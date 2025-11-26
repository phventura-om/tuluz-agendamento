import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SacredSymbol } from "@/components/SacredSymbol";

type Gira = {
  id: string;
  data: string;
  titulo: string;
  capacidade: number;
  tipo?: string | null;
};

type Agendamento = {
  id: string;
  nome: string;
  primeira_visita: boolean;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
  created_at: string;
};

export function AdminPage() {
  const [carregandoGiras, setCarregandoGiras] = useState(true);
  const [giras, setGiras] = useState<Gira[]>([]);
  const [giraSelecionadaId, setGiraSelecionadaId] = useState<string | null>(null);

  const [carregandoAgendados, setCarregandoAgendados] = useState(false);
  const [agendados, setAgendados] = useState<Agendamento[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const [autorizado, setAutorizado] = useState(false);
  const [codigoDigitado, setCodigoDigitado] = useState("");

  const CODIGO_ADMIN = "terreiro2025";

  function formatarDataBr(isoDate: string) {
    const onlyDate = isoDate.split("T")[0];
    const [year, month, day] = onlyDate.split("-");
    return `${day}/${month}/${year}`;
  }

  // carregar giras
  useEffect(() => {
    const fetchGiras = async () => {
      setCarregandoGiras(true);
      setErro(null);

      const { data, error } = await supabase
        .from("giras")
        .select("id, data, titulo, capacidade, tipo")
        .order("data", { ascending: false });

      if (error) {
        console.error(error);
        setErro("Não foi possível carregar as giras.");
        setCarregandoGiras(false);
        return;
      }

      const girasTipadas = (data ?? []) as Gira[];
      setGiras(girasTipadas);

      if (girasTipadas.length > 0) {
        setGiraSelecionadaId(girasTipadas[0].id);
      }

      setCarregandoGiras(false);
    };

    fetchGiras();
  }, []);

  // carregar agendados
  useEffect(() => {
    const fetchAgendados = async () => {
      if (!giraSelecionadaId) {
        setAgendados([]);
        return;
      }

      setCarregandoAgendados(true);
      setErro(null);

      const { data, error } = await supabase
        .from("agendamentos")
        .select("id, nome, primeira_visita, telefone, email, observacoes, created_at")
        .eq("gira_id", giraSelecionadaId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error);
        setErro("Não foi possível carregar os agendados desta gira.");
        setCarregandoAgendados(false);
        return;
      }

      setAgendados((data ?? []) as Agendamento[]);
      setCarregandoAgendados(false);
    };

    fetchAgendados();
  }, [giraSelecionadaId]);

  const giraSelecionada = giras.find((g) => g.id === giraSelecionadaId) ?? null;

  function exportarCSV() {
    if (!giraSelecionada) return;

    const linhas = [
      ["Nome", "Primeira visita", "Telefone", "E-mail", "Observações", "Agendado em"],
      ...agendados.map((a) => [
        a.nome,
        a.primeira_visita ? "Sim" : "Não",
        a.telefone ?? "",
        a.email ?? "",
        a.observacoes ?? "",
        new Date(a.created_at).toLocaleString("pt-BR"),
      ]),
    ];

    const csvConteudo = linhas
      .map((linha) =>
        linha
          .map((campo) => {
            const valor = campo ?? "";
            const precisaAspas = /[",;\n]/.test(valor);
            if (precisaAspas) {
              return `"${valor.replace(/"/g, '""')}"`;
            }
            return valor;
          })
          .join(";")
      )
      .join("\n");

    const blob = new Blob([csvConteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const nomeArquivo = `agendados_${giraSelecionada.titulo.replace(/\s+/g, "_")}.csv`;

    link.href = url;
    link.setAttribute("download", nomeArquivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleLoginAdmin(e: FormEvent) {
    e.preventDefault();
    if (codigoDigitado === CODIGO_ADMIN) {
      setAutorizado(true);
      setCodigoDigitado("");
    } else {
      alert("Código incorreto.");
    }
  }

  // tela de login da equipe, com estética Tuluz
  if (!autorizado) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card rounded-xl shadow-md border border-border/60 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

          <div className="flex flex-col items-center text-center mb-6">
            <SacredSymbol />
            <h1 className="mt-4 text-3xl font-bold text-primary font-playfair tracking-wide">
              Tuluz
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Terreiro de Umbanda Luzeiro Santo
            </p>

            <div className="mt-4 bead-divider">
              <span className="bead"></span>
              <span className="bead"></span>
              <span className="bead"></span>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-center mb-2">
            Área da equipe – Agendamentos
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Digite o código interno do terreiro para acessar a lista de agendados.
          </p>

          <form onSubmit={handleLoginAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="codigo">
                Código da equipe
              </label>
              <input
                id="codigo"
                type="password"
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="Informe o código interno"
                value={codigoDigitado}
                onChange={(e) => setCodigoDigitado(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-sm"
            >
              Entrar
            </button>
          </form>
        </div>
      </main>
    );
  }

  // tela principal do admin com estética da landing
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* cabeçalho Tuluz */}
        <header className="text-center">
          <div className="flex flex-col items-center">
            <SacredSymbol />
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-primary font-playfair tracking-wide">
              Tuluz
            </h1>
            <h2 className="text-base sm:text-lg text-foreground/80 mt-1 font-light">
              Área da Equipe – Controle de Agendamentos
            </h2>
            <div className="sacred-divider max-w-xs mx-auto mt-4" />
          </div>
        </header>

        {/* card de filtros / info da gira */}
        <section className="bg-card rounded-xl shadow-md border border-border/60 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1 min-w-[220px]">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Selecionar gira
              </p>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={giraSelecionadaId ?? ""}
                onChange={(e) => setGiraSelecionadaId(e.target.value || null)}
              >
                {giras.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.titulo} — {formatarDataBr(g.data)}{" "}
                    {g.tipo ? `(${g.tipo})` : ""}
                  </option>
                ))}
              </select>

              {giraSelecionada && (
                <div className="mt-4 text-sm text-muted-foreground space-y-1">
                  <p>
                    Data:{" "}
                    <span className="font-medium">
                      {formatarDataBr(giraSelecionada.data)}
                    </span>
                  </p>
                  <p>
                    Capacidade:{" "}
                    <span className="font-medium">
                      {giraSelecionada.capacidade} pessoas
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1 md:max-w-xs space-y-2 text-sm text-muted-foreground">
              <p>
                Giras cadastradas:{" "}
                <span className="font-semibold">{giras.length}</span>
              </p>
              {giraSelecionada && (
                <>
                  <p>
                    Agendados nesta gira:{" "}
                    <span className="font-semibold">{agendados.length}</span>
                  </p>
                  <p>
                    Vagas restantes:{" "}
                      <span className="font-semibold">
                        {Math.max(
                          giraSelecionada.capacidade - agendados.length,
                          0
                        )}
                      </span>
                  </p>
                </>
              )}

              <button
                type="button"
                onClick={exportarCSV}
                disabled={!giraSelecionada || agendados.length === 0}
                className="mt-4 w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Exportar lista em CSV
              </button>
            </div>
          </div>

          {erro && (
            <p className="mt-4 text-sm text-red-600">{erro}</p>
          )}
        </section>

        {/* tabela de agendados */}
        <section className="bg-card rounded-xl shadow-md border border-border/60 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
            Agendados da gira selecionada
          </h3>

          {carregandoGiras || carregandoAgendados ? (
            <p className="text-sm text-muted-foreground">
              Carregando dados...
            </p>
          ) : agendados.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum agendamento encontrado para esta gira.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[500px]">
              <table className="min-w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 font-medium">Nome</th>
                    <th className="text-left p-2 font-medium">Primeira visita</th>
                    <th className="text-left p-2 font-medium">Telefone</th>
                    <th className="text-left p-2 font-medium">E-mail</th>
                    <th className="text-left p-2 font-medium">Observações</th>
                    <th className="text-left p-2 font-medium">Agendado em</th>
                  </tr>
                </thead>
                <tbody>
                  {agendados.map((a) => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="p-2">{a.nome}</td>
                      <td className="p-2">{a.primeira_visita ? "Sim" : "Não"}</td>
                      <td className="p-2 whitespace-nowrap">
                        {a.telefone ?? "-"}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {a.email ?? "-"}
                      </td>
                      <td className="p-2 whitespace-pre-wrap max-w-xs">
                        {a.observacoes ?? "-"}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {new Date(a.created_at).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="text-center text-xs text-muted-foreground">
          Terreiro de Umbanda Luzeiro Santo • Área interna da equipe
        </footer>
      </div>
    </main>
  );
}
