import { randomInt } from "crypto"

export function generateRandomImei15(): string {
  // Generates a 15-digit numeric string (DB column is @db.VarChar(15)).
  let out = ""
  for (let i = 0; i < 15; i++) {
    const digit = i === 0 ? randomInt(1, 10) : randomInt(0, 10)
    out += String(digit)
  }
  return out
}
