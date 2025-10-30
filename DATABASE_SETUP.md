# Guía de Integración con Base de Datos - Liga 33

## Paso a Paso para Configurar la Base de Datos

### 1. Requisitos Previos
- Tener una cuenta en Vercel
- Tener acceso al proyecto de Liga 33 en v0

### 2. Agregar Integración de Base de Datos

#### Opción A: Usar Supabase (Recomendado)
1. En v0, ve a la sección **Connect** en el sidebar izquierdo
2. Busca y selecciona **Supabase**
3. Haz clic en "Add Integration"
4. Sigue las instrucciones para conectar o crear un proyecto de Supabase
5. Una vez conectado, las variables de entorno se agregarán automáticamente

#### Opción B: Usar Neon
1. En v0, ve a la sección **Connect** en el sidebar izquierdo
2. Busca y selecciona **Neon**
3. Haz clic en "Add Integration"
4. Sigue las instrucciones para conectar o crear un proyecto de Neon
5. Una vez conectado, las variables de entorno se agregarán automáticamente

### 3. Ejecutar Scripts de Base de Datos

Una vez que la integración esté conectada:

1. **Ejecutar el script de creación de tablas:**
   - Ve a la carpeta `scripts` en tu proyecto
   - Abre el archivo `001_create_tables.sql`
   - Haz clic en el botón "Run Script" que aparece en v0
   - Espera a que se complete la ejecución

2. **Ejecutar el script de datos iniciales:**
   - Abre el archivo `002_seed_initial_data.sql`
   - Haz clic en "Run Script"
   - Esto creará los grupos y equipos iniciales

3. **Ejecutar el script de jugadores:**
   - Abre el archivo `003_seed_players.sql`
   - Haz clic en "Run Script"
   - Esto agregará los jugadores de ejemplo

### 4. Verificar la Instalación

Para verificar que todo se instaló correctamente:

\`\`\`sql
-- Verificar que las tablas se crearon
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar cantidad de equipos
SELECT COUNT(*) as total_equipos FROM teams;

-- Verificar cantidad de jugadores
SELECT COUNT(*) as total_jugadores FROM players;

-- Ver equipos por grupo
SELECT g.name as grupo, t.name as equipo, tg.points as puntos
FROM team_groups tg
JOIN teams t ON tg.team_id = t.id
JOIN copa_groups g ON tg.group_id = g.id
ORDER BY g.name, tg.points DESC;
\`\`\`

### 5. Variables de Entorno

Las siguientes variables de entorno se configuran automáticamente al agregar la integración:

**Para Supabase:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Para Neon:**
- `DATABASE_URL`

### 6. Conectar la Aplicación a la Base de Datos

Una vez que los scripts se hayan ejecutado, necesitarás actualizar los componentes para que lean de la base de datos en lugar de usar datos estáticos.

#### Ejemplo de conexión con Supabase:

\`\`\`typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
\`\`\`

#### Ejemplo de conexión con Neon:

\`\`\`typescript
// lib/db.ts
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export { sql }
\`\`\`

### 7. Estructura de la Base de Datos

#### Tablas Principales:

1. **teams** - Equipos participantes
2. **players** - Jugadores de cada equipo
3. **copa_groups** - Grupos A, B, C
4. **team_groups** - Posiciones de equipos en grupos
5. **matches** - Partidos jugados
6. **goals** - Goles marcados
7. **cards** - Tarjetas amarillas y rojas
8. **draws** - Sorteos de octavos

### 8. Funcionalidades Implementadas

✅ Sistema de tarjetas con suspensiones automáticas
✅ Contador de goles por jugador
✅ Tabla de posiciones por grupo
✅ Registro de partidos y resultados
✅ Sistema de sorteo para octavos de final

### 9. Próximos Pasos

Después de configurar la base de datos:

1. Actualizar los componentes para leer datos reales
2. Implementar las funciones de actualización en el admin
3. Crear triggers para actualizar automáticamente las estadísticas
4. Agregar validaciones de negocio

### 10. Soporte

Si tienes problemas con la integración:
- Verifica que la integración esté correctamente conectada en la sección Connect
- Revisa los logs de ejecución de los scripts
- Asegúrate de que las variables de entorno estén configuradas
- Contacta al soporte de Vercel si persisten los problemas
