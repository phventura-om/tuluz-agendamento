import { Instagram, MapPin } from "lucide-react";
import { Button } from "./ui/button";

export const InstructionsBox = () => {
  const handleInstagramClick = () => {
    window.open(
      "https://www.instagram.com/p/CqK8yizujuHsiiilYda-pvDX8v_ToziBAB1QDs0/?igsh=eW1lOW9pbTczZWIz",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleMapClick = () => {
    window.open(
      "https://www.google.com/maps/dir//J%C3%BAlio+%C3%81lvares+de+Assis,+300+-+casa+4+-+Floresta,+Juiz+de+Fora+-+MG,+36072-117/@-21.7755718,-43.339121,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x98834373007c81:0x8b9450ef67af0673!2m2!1d-43.2760548!2d-21.7537543?entry=ttu&g_ep=EgoyMDI1MTEyMy4xIKXMDSoASAFQAw%3D%3D",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-primary mb-6 text-center font-playfair">
        Instruções para Agendamento
      </h2>

      <div className="space-y-4 text-foreground/90 leading-relaxed">
        <p>Olá,</p>
        <p>O Terreiro de Umbanda Luzeiro Santo informa:</p>

        <div className="space-y-2 font-medium">
          <p>É NECESSÁRIO FAZER UM AGENDAMENTO INDIVIDUAL POR PESSOA.</p>
          <p>
            Quando não há horários disponíveis, as senhas encerraram. Procure o DIRECT no Instagram
            para acompanhar a lista de desistências.
          </p>
          <p>ACOMPANHANTES MAIORES DE 12 ANOS NECESSITAM DE AGENDAMENTO.</p>
          <p>VISITANTES SEM AGENDAMENTO PRÉVIO NÃO SERÃO ATENDIDOS.</p>
          <p>
            O atendimento na gira se dá por ordem de agendamento. Pedimos que a chegada se
            concentre no horário de 16h.
          </p>
          <p>POR GENTILEZA, SINALIZE NAS OBSERVAÇÕES SE ESSA FOR SUA PRIMEIRA VEZ!</p>
          <p>
            SINALIZE NAS OBSERVAÇÕES SE VOCÊ É PESSOA COM DEFICIÊNCIA OU NECESSIDADES ESPECIAIS!
          </p>
          <p>
            Cadeirantes podem estacionar para descer dentro dos portões. Nos informe pelo direct
            para receber instruções.
          </p>
        </div>

        <div className="bead-divider">
          <span className="bead"></span>
          <span className="bead"></span>
          <span className="bead"></span>
          <span className="bead"></span>
          <span className="bead"></span>
        </div>

        <div>
          <p className="font-semibold text-primary mb-3">Orientações:</p>
          <ul className="space-y-2 list-disc list-inside ml-2">
            <li>
              Pedimos aos consulentes que venham com roupas brancas ou claras que não sejam curtas
              (shorts ou bermudas, camisetas), nem decotadas e justas.
            </li>
            <li>Que não utilizem bonés ou chapéus.</li>
            <li>
              Que não utilizem celulares e aparelhos eletrônicos em nenhuma dependência do terreiro.
            </li>
            <li>Que não fumem em nenhuma área do terreiro.</li>
            <li>Que tragam agasalho, pois estamos localizados em área montanhosa!</li>
          </ul>
        </div>

        <div className="bead-divider">
          <span className="bead"></span>
          <span className="bead"></span>
          <span className="bead"></span>
          <span className="bead"></span>
          <span className="bead"></span>
        </div>

        <div>
          <p className="font-semibold text-primary mb-4">MAIS INFORMAÇÕES:</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleInstagramClick}
              variant="outline"
              className="flex-1 gap-2 border-secondary/50 hover:bg-secondary/10 hover:border-secondary"
            >
              <Instagram className="w-4 h-4" />
              Ver mais sobre o atendimento
            </Button>
            <Button
              onClick={handleMapClick}
              variant="outline"
              className="flex-1 gap-2 border-earth/50 hover:bg-earth/10 hover:border-earth"
            >
              <MapPin className="w-4 h-4" />
              Ver endereço no mapa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
