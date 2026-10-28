import { lifiStatus } from "@/lib/lifi";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const txHash = url.searchParams.get("txHash");
  const fromChain = Number(url.searchParams.get("fromChain"));
  const toChain = Number(url.searchParams.get("toChain"));
  if (!txHash || !fromChain || !toChain) return Response.json({ error: "Missing params" }, { status: 400 });
  return Response.json(await lifiStatus(txHash, fromChain, toChain));
}
