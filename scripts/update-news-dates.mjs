import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

try {
  await sql.begin(async (tx) => {
    const firstYear = await tx.unsafe(
      "update news set published_at = '2026-10-24T09:00:00+03:00', updated_at = now() where title ilike '%первый год%' returning id, title, published_at",
    );
    const knowledgeDay = await tx.unsafe(
      "update news set published_at = '2026-09-01T09:00:00+03:00', updated_at = now() where title ilike '%знани%' returning id, title, published_at",
    );

    if (firstYear.length !== 1 || knowledgeDay.length !== 1) {
      throw new Error(`Ожидалась ровно одна запись для каждой новости: первый год=${firstYear.length}, знания=${knowledgeDay.length}`);
    }

    console.log({ firstYear: firstYear[0], knowledgeDay: knowledgeDay[0] });
  });
} finally {
  await sql.end();
}
