# Guía de Integración con Base de Datos - Liga 33

## Paso 1: Configurar la Base de Datos

### Opción A: Usar Supabase (Recomendado)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. En el panel de Supabase, ve a "SQL Editor"
4. Ejecuta los scripts en este orden:
   - `scripts/001_create_tables.sql`
   - `scripts/002_seed_initial_data.sql` (opcional - datos de ejemplo)
   - `scripts/003_seed_players.sql` (opcional - jugadores de ejemplo)
   - `scripts/004_add_news_table.sql`

5. Ve a "Settings" > "API" y copia:
   - `Project URL` (será tu `NEXT_PUBLIC_SUPABASE_URL`)
   - `anon public` key (será tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Opción B: Usar Neon

1. Ve a [neon.tech](https://neon.tech) y crea una cuenta
2. Crea un nuevo proyecto
3. Copia la connection string
4. Ejecuta los scripts SQL usando el cliente de Neon o cualquier cliente PostgreSQL

## Paso 2: Configurar Variables de Entorno

En v0, ve a la sección "Vars" en el sidebar y agrega:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
\`\`\`

O si usas Neon:

\`\`\`
DATABASE_URL=tu_connection_string_de_neon
\`\`\`

## Paso 3: Instalar el Cliente de Base de Datos

El proyecto ya incluye las dependencias necesarias. Si usas Supabase:

\`\`\`typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
\`\`\`

Si usas Neon:

\`\`\`typescript
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)
\`\`\`

## Paso 4: Conectar los Componentes

### Ejemplo: Cargar Noticias

\`\`\`typescript
// En components/home-section.tsx
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HomeSection() {
  const [news, setNews] = useState([])

  useEffect(() => {
    async function fetchNews() {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_date', { ascending: false })
        .limit(4)
      
      if (data) setNews(data)
    }
    fetchNews()
  }, [])

  // ... resto del componente
}
\`\`\`

### Ejemplo: Guardar Noticia desde Admin

\`\`\`typescript
// En components/admin-dashboard.tsx
const handleAddNews = async () => {
  const { data, error } = await supabase
    .from('news')
    .insert([{
      title: newNews.title,
      content: newNews.content,
      image_url: newNews.image,
      published_date: newNews.date
    }])
  
  if (error) {
    alert('Error al guardar la noticia')
  } else {
    alert('Noticia agregada exitosamente!')
    // Limpiar formulario
  }
}
\`\`\`

## Paso 5: Implementar CRUD para Todas las Entidades

Sigue el mismo patrón para:
- Equipos (teams)
- Jugadores (players)
- Partidos (matches)
- Goles (goals)
- Tarjetas (cards)
- Grupos (groups)

## Paso 6: Configurar Row Level Security (RLS) en Supabase

Para proteger tus datos, configura políticas RLS:

\`\`\`sql
-- Permitir lectura pública de noticias
CREATE POLICY "Public can read news"
ON news FOR SELECT
TO public
USING (true);

-- Solo admin puede insertar/actualizar/eliminar
CREATE POLICY "Admin can manage news"
ON news FOR ALL
TO authenticated
USING (auth.uid() = 'tu_admin_user_id');
\`\`\`

## Paso 7: Probar la Integración

1. Agrega una noticia desde el panel de administración
2. Verifica que aparezca en la página de inicio
3. Prueba agregar equipos, jugadores y resultados
4. Verifica que las tablas se actualicen automáticamente

## Notas Importantes

- Todos los datos hardcodeados han sido eliminados
- El admin debe cargar toda la información desde el panel
- Las imágenes se pueden subir a Supabase Storage o usar URLs externas
- Implementa validaciones en el backend para evitar datos incorrectos
- Considera agregar autenticación para el panel de administración
