// ============================================================
//  SCRATCHLY CONFIG  -  csak ezt a fájlt kell szerkesztened
// ============================================================

window.SCRATCHLY_CONFIG = {
  // A coined mint címe (pump.fun)
  COIN_MINT: "GKFQN4BYgEjNWS2SVYJAbxGCzmkN5tj77HEc9v7Wpump",

  // Ide érkezik a jutalék (a fee tárcád)
  FEE_WALLET: "6paaRBM1KK6VaFdkF3egw2zCLz3EPMF6ChbLYRntnVkf",

  // A coin neve a weboldalon (ha más a ticker, írd át)
  TICKER: "SCR",

  // RPC cím. Ide másold a Helius linkedet, pl:
  // "https://mainnet.helius-rpc.com/?api-key=IDE_A_KULCSOD"
  // Ha üresen hagyod, a lassú, nyilvános RPC-t használja.
  RPC_URL: "https://mainnet.helius-rpc.com/?api-key=844c2e25-a540-4621-97c7-f6839217b987",

  // Jutalék a visszakapott rentből, basis pointban (1500 = 15%)
  FEE_BPS_STANDARD: 1500,

  // Holder szintek: ennyi coint kell tartani (a coin teljes kínálata 1 milliárd)
  TIER1_MIN: 1000000,   // 0,1%  -> Holder szint
  FEE_BPS_TIER1: 750,   // 7,5%

  TIER2_MIN: 5000000,   // 0,5%  -> Diamond szint
  FEE_BPS_TIER2: 0,     // 0%
};
