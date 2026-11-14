// ============================================================
//  SCRATCHLY CONFIG  -  csak ezt a fájlt kell szerkesztened
// ============================================================
window.SCRATCHLY_CONFIG = {
  // A coined mint címe (pump.fun)
  COIN_MINT: "3xMg4dC3xVBPNWeeph9ArdsyTZQZV7QdRz3vRGbxpump",

  // Ide érkezik a jutalék (a fee tárcád)
  FEE_WALLET: "6paaRBM1KK6VaFdkF3egw2zCLz3EPMF6ChbLYRntnVkf",

  // A coin neve a weboldalon (ha más a ticker, írd át)
  TICKER: "SCRATCHLY",

  // RPC cím. Ide másold a Helius linkedet, pl:
  // "https://mainnet.helius-rpc.com/?api-key=IDE_A_KULCSOD"
  // Ha üresen hagyod, a lassú, nyilvános RPC-t használja.
  RPC_URL: "",

  // Jutalék a visszakapott rentből, basis pointban (1500 = 15%)
  FEE_BPS_STANDARD: 1500,

  // Holder szintek: ennyi coint kell tartani (a coin teljes kínálata 1 milliárd)
  TIER1_MIN: 1000000,   // 0,1%  -> Holder szint
  FEE_BPS_TIER1: 750,   // 7,5%

  TIER2_MIN: 5000000,   // 0,5%  -> Diamond szint
  FEE_BPS_TIER2: 0,     // 0%
};
