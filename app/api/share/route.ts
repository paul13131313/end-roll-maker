import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL!,
  token: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN!,
});

// POST: データを保存して短いIDを返す
export async function POST(req: Request) {
  const body = await req.json();
  const id = crypto.randomUUID().slice(0, 8);
  // 1年間保持
  await redis.set(`endroll:${id}`, JSON.stringify(body), { ex: 60 * 60 * 24 * 365 });
  return Response.json({ id });
}

// GET: IDからデータを取得する
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }
  const raw = await redis.get<string>(`endroll:${id}`);
  if (!raw) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  // rawがすでにオブジェクトならそのまま返す、文字列ならパースして返す
  const data = typeof raw === "string" ? JSON.parse(raw) : raw;
  return Response.json(data);
}
