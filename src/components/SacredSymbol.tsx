import logoTerreiro from "@/assets/logo-terreiro.jpg";

export const SacredSymbol = () => {
  return (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-forest/30 shadow-lg bg-card">
          <img
            src={logoTerreiro}
            alt="Logo Terreiro de Umbanda Luzeiro Santo"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center animate-pulse">
        <div className="w-32 h-32 rounded-full border border-forest/20"></div>
      </div>
    </div>
  );
};
