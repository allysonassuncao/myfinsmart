/*
  # Create view for category/subcategory report

  1. New View
    - `view_categoria_subcategoria_report`
      - Shows financial data grouped by category, subcategory, and type
      - Includes data for current month and two previous months
      - Allows for easy comparison of spending patterns over time
  
  2. Structure
    - Aggregates financial data by category, subcategory, and type
    - Pivots data to show three months side by side
    - Filters by user_id for data security
*/

CREATE OR REPLACE VIEW view_categoria_subcategoria_report AS
WITH months AS (
  SELECT 
    date_trunc('month', current_date) as current_month,
    date_trunc('month', current_date - interval '1 month') as prev_month1,
    date_trunc('month', current_date - interval '2 month') as prev_month2
)
SELECT 
  r.user_id,
  date_trunc('month', r.data::date) as month_date,
  c.name as categoria_name,
  s.name as subcategoria_name,
  t.name as tipo_name,
  COALESCE(SUM(CASE WHEN date_trunc('month', r.data::date) = m.current_month THEN r.valor ELSE 0 END), 0) as month1,
  COALESCE(SUM(CASE WHEN date_trunc('month', r.data::date) = m.prev_month1 THEN r.valor ELSE 0 END), 0) as month2,
  COALESCE(SUM(CASE WHEN date_trunc('month', r.data::date) = m.prev_month2 THEN r.valor ELSE 0 END), 0) as month3,
  m.current_month
FROM 
  registros r
CROSS JOIN 
  months m
LEFT JOIN 
  categorias c ON r.categoria = c.value AND r.user_id = c.user_id
LEFT JOIN 
  subcategorias s ON r.subcategoria = s.value AND r.user_id = s.user_id
LEFT JOIN 
  tipos t ON r.tipo = t.value AND r.user_id = t.user_id
WHERE 
  date_trunc('month', r.data::date) >= m.prev_month2
  AND date_trunc('month', r.data::date) <= m.current_month
GROUP BY 
  r.user_id, month_date, c.name, s.name, t.name, m.current_month
ORDER BY 
  c.name, s.name, t.name;