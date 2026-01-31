import { SacredSymbol } from "@/components/SacredSymbol";
import { InstructionsBox } from "@/components/InstructionsBox";
import { SchedulingForm } from "@/components/SchedulingForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <main className="relative">
        {/* Header Section */}
        <header className="pt-12 pb-8 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <SacredSymbol />

            <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-3 font-playfair tracking-wide">
              Tuluz
            </h1>

            <h2 className="text-xl sm:text-2xl text-foreground/80 mb-6 font-light">
              Terreiro de Umbanda Luzeiro Santo
            </h2>

            <div className="sacred-divider max-w-xs mx-auto" />

            <p className="text-base sm:text-lg text-primary font-semibold mb-4 leading-relaxed tracking-wide">
              LUZ, AMOR E CARIDADE
            </p>

            <p className="text-sm sm:text-base text-muted-foreground italic">
              Leia as orientações abaixo e, em seguida, realize o seu agendamento com tranquilidade.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-4 pb-16">
          <div className="max-w-2xl mx-auto space-y-8">
            <InstructionsBox />

            <div className="bead-divider">
              <span className="bead"></span>
              <span className="bead"></span>
              <span className="bead"></span>
              <span className="bead"></span>
              <span className="bead"></span>
              <span className="bead"></span>
              <span className="bead"></span>
            </div>

            <SchedulingForm />
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 px-4 text-center">
          <div className="bead-divider max-w-xs mx-auto">
            <span className="bead"></span>
            <span className="bead"></span>
            <span className="bead"></span>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Terreiro de Umbanda Luzeiro Santo • Juiz de Fora, MG
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
