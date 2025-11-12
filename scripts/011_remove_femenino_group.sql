-- Script para eliminar el Grupo F y actualizar partidos femeninos a usar NULL en group_id
-- Esto elimina la dependencia de grupos para el torneo femenino

-- Paso 1: Actualizar todos los partidos del torneo femenino para usar NULL en group_id
UPDATE matches 
SET group_id = NULL 
WHERE tournament_id = 2;

-- Paso 2: Eliminar todas las relaciones de equipos femeninos con el grupo F
DELETE FROM team_groups 
WHERE group_id IN (
  SELECT id FROM copa_groups WHERE tournament_id = 2
);

-- Paso 3: Eliminar el grupo F del torneo femenino
DELETE FROM copa_groups 
WHERE tournament_id = 2;

-- Verificar que los cambios se aplicaron correctamente
SELECT 
  'Partidos femeninos sin grupo' as status,
  COUNT(*) as count
FROM matches 
WHERE tournament_id = 2 AND group_id IS NULL;

SELECT 
  'Grupos femeninos restantes' as status,
  COUNT(*) as count
FROM copa_groups 
WHERE tournament_id = 2;
