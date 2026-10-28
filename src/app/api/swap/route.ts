import { uniswapBuildSwap } from "@/lib/uniswap";

/** Builds the final Uniswap swap tx once the user has signed the Permit2 message (if any). */
export async function POST(req: Request) {
  try {
    const { quote, permitData, signature } = await req.json();
    if (!quote || typeof quote !== "object") return Response.json({ error: "Missing quote" }, { status: 400 });
    const tx = await uniswapBuildSwap({ quote, permitData, signature });
    return Response.json({ tx });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
