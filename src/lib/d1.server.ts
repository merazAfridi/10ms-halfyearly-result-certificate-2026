/**
 * Cloudflare D1 Server Access Layer
 * Supports:
 * 1. Native Cloudflare Edge Binding (env.DB) when deployed on Cloudflare Pages/Workers.
 * 2. Cloudflare D1 REST API when CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, and D1_DATABASE_ID are set in .env.
 * 3. In-memory local fallback store for seamless development.
 */

export type ResultSubmission = {
  id: string;
  created_at: string;
  certificate_name: string;
  class_name: string | null;
  school_name: string;
  preparation_type: string;
  exam_name: string;
  total_marks: number;
  exam_total_marks: number | null;
  class_position: number;
  result_card_url: string | null;
  student_phone?: string | null;
  student_email?: string | null;
  external_user_id?: string | null;
};

// In-memory local fallback storage for dev when D1 is not bound/configured yet
const memoryStore: ResultSubmission[] = [
  {
    id: "sample-1",
    certificate_name: "মেরাজ আফ্রিদি",
    school_name: "গভ. ল্যাবরেটরি হাই স্কুল",
    exam_name: "বার্ষিক পরীক্ষা ২০২৫",
    preparation_type: "অনলাইন কোর্স",
    class_name: "Class 9",
    class_position: 1,
    total_marks: 98,
    exam_total_marks: 100,
    result_card_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    certificate_name: "মাহিন করিম",
    school_name: "আইডিয়াল স্কুল অ্যান্ড কলেজ",
    exam_name: "অর্ধবার্ষিক পরীক্ষা ২০২৫",
    preparation_type: "লাইভ ক্লাস",
    class_name: "Class 10",
    class_position: 2,
    total_marks: 96,
    exam_total_marks: 100,
    result_card_url: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

function getD1Config() {
  const accountId = (process.env["CLOUDFLARE_ACCOUNT_ID"] || process.env["VITE_CLOUDFLARE_ACCOUNT_ID"])?.trim();
  const databaseId = (process.env["CLOUDFLARE_D1_DATABASE_ID"] || process.env["D1_DATABASE_ID"] || process.env["VITE_D1_DATABASE_ID"])?.trim();
  const apiToken = (process.env["CLOUDFLARE_API_TOKEN"] || process.env["VITE_CLOUDFLARE_API_TOKEN"])?.trim();

  if (accountId && databaseId && apiToken) {
    return { accountId, databaseId, apiToken };
  }
  return null;
}

/** Execute SQL via Cloudflare D1 HTTP REST API */
async function queryD1RestApi<T>(sql: string, params: any[] = []): Promise<T[]> {
  const cfg = getD1Config();
  if (!cfg) return [];

  const url = `https://api.cloudflare.com/client/v4/accounts/${cfg.accountId}/d1/database/${cfg.databaseId}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cfg.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[D1 REST API Error]", res.status, errText);
    throw new Error(`Cloudflare D1 REST API query failed: ${res.status}`);
  }

  const json = await res.json() as {
    success: boolean;
    result?: Array<{ results?: T[] }>;
    errors?: Array<{ message: string }>;
  };

  if (!json.success || !json.result?.[0]?.results) {
    console.warn("[D1 Query Warning]", json.errors);
    return [];
  }

  return json.result[0].results;
}

/** Get list of result submissions from D1 */
export async function getResultSubmissions(limit = 300, cloudflareEnv?: any): Promise<ResultSubmission[]> {
  // 1. Check Cloudflare Edge Binding (env.DB)
  const db = cloudflareEnv?.DB ?? (process.env as any)?.DB;
  if (db && typeof db.prepare === "function") {
    try {
      const stmt = db.prepare("SELECT * FROM result_submissions ORDER BY created_at DESC LIMIT ?").bind(limit);
      const { results } = await stmt.all();
      return (results || []) as ResultSubmission[];
    } catch (err) {
      console.error("[D1 Native Binding Error]", err);
    }
  }

  // 2. Check Cloudflare D1 REST API
  if (getD1Config()) {
    try {
      const sql = "SELECT * FROM result_submissions ORDER BY created_at DESC LIMIT ?";
      return await queryD1RestApi<ResultSubmission>(sql, [limit]);
    } catch (err) {
      console.error("[D1 Rest API fetch failed, falling back]", err);
    }
  }

  // 3. Fallback to memory store during dev
  return memoryStore;
}

/** Insert a new result submission into D1 */
export async function insertResultSubmission(
  data: Omit<ResultSubmission, "id" | "created_at">,
  cloudflareEnv?: any,
): Promise<ResultSubmission> {
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();

  const record: ResultSubmission = {
    id,
    created_at,
    certificate_name: data.certificate_name,
    class_name: data.class_name ?? null,
    school_name: data.school_name,
    preparation_type: data.preparation_type,
    exam_name: data.exam_name,
    total_marks: data.total_marks,
    exam_total_marks: data.exam_total_marks ?? null,
    class_position: data.class_position,
    result_card_url: data.result_card_url ?? null,
    student_phone: data.student_phone ?? null,
    student_email: data.student_email ?? null,
    external_user_id: data.external_user_id ?? null,
  };

  // 1. Check Cloudflare Edge Binding (env.DB)
  const db = cloudflareEnv?.DB ?? (process.env as any)?.DB;
  if (db && typeof db.prepare === "function") {
    try {
      const sql = `
        INSERT INTO result_submissions (
          id, created_at, certificate_name, class_name, school_name,
          preparation_type, exam_name, total_marks, exam_total_marks,
          class_position, result_card_url, student_phone, student_email, external_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.prepare(sql).bind(
        record.id, record.created_at, record.certificate_name, record.class_name, record.school_name,
        record.preparation_type, record.exam_name, record.total_marks, record.exam_total_marks,
        record.class_position, record.result_card_url, record.student_phone, record.student_email, record.external_user_id
      ).run();
      return record;
    } catch (err) {
      console.error("[D1 Native Binding Insert Error]", err);
    }
  }

  // 2. Check Cloudflare D1 REST API
  if (getD1Config()) {
    try {
      const sql = `
        INSERT INTO result_submissions (
          id, created_at, certificate_name, class_name, school_name,
          preparation_type, exam_name, total_marks, exam_total_marks,
          class_position, result_card_url, student_phone, student_email, external_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await queryD1RestApi(sql, [
        record.id, record.created_at, record.certificate_name, record.class_name, record.school_name,
        record.preparation_type, record.exam_name, record.total_marks, record.exam_total_marks,
        record.class_position, record.result_card_url, record.student_phone, record.student_email, record.external_user_id
      ]);
      return record;
    } catch (err) {
      console.error("[D1 REST API Insert Error]", err);
    }
  }

  // 3. Fallback to memory store during dev
  memoryStore.unshift(record);
  return record;
}
