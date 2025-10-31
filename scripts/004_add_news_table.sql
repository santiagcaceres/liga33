-- Tabla de noticias
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT NOT NULL,
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para ordenar por fecha
CREATE INDEX idx_news_published_date ON news(published_date DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_news_updated_at
BEFORE UPDATE ON news
FOR EACH ROW
EXECUTE FUNCTION update_news_updated_at();
