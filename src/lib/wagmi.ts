import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { SUPPORTED_CHAINS } from "./chains";

export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors: [injected()],
  transports: Object.fromEntries(SUPPORTED_CHAINS.map((c) => [c.id, http(c.rpcUrls.default.http[0])])),
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
