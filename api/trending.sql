--drop view "trending2.dev";

DROP VIEW "trending.dev";


CREATE VIEW "trending.dev" AS
SELECT a.*,
       CASE
           WHEN b.num_ans IS NULL THEN 0
           ELSE b.num_ans
       END AS num_ans
FROM "messages.dev" a
LEFT OUTER JOIN
  (SELECT related_id AS id,
          count(*) AS num_ans
   FROM "messages.dev"
   WHERE related_id IS NOT NULL
   GROUP BY related_id
   ORDER BY num_ans DESC) AS b ON a.id = b.id
WHERE a.related_id IS NULL
ORDER BY num_ans DESC,
         created_at