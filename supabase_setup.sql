-- 1. TRIGGER DE SEGURANÇA: Impede agendamentos em giras inativas
-- Esta função verifica se a gira está ativa antes de permitir a inserção do agendamento
CREATE OR REPLACE FUNCTION check_gira_ativa()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM giras 
        WHERE id = NEW.gira_id AND ativa = true
    ) THEN
        RAISE EXCEPTION 'Não é possível agendar: esta gira não está ativa ou não existe.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remove o trigger se ele já existir (para evitar erro ao rodar o script novamente)
DROP TRIGGER IF EXISTS trg_check_gira_ativa ON agendamentos;

-- Cria o trigger na tabela de agendamentos
CREATE TRIGGER trg_check_gira_ativa
BEFORE INSERT ON agendamentos
FOR EACH ROW
EXECUTE FUNCTION check_gira_ativa();


-- 2. HABILITAR REALTIME: Permite que o Supabase envie avisos de mudança para o site
-- Adiciona a tabela 'giras' à publicação de tempo real do Supabase
ALTER TABLE giras REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'giras'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE giras;
  END IF;
END $$;
