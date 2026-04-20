/**
 * Resolves the logo path based on NEXT_PUBLIC_LOGO env variable.
 * Usage: set NEXT_PUBLIC_LOGO=evx in .env   → /img/logo/evx/logo-dark-full.png
 *        set NEXT_PUBLIC_LOGO=shop2          → /img/logo/shop2/logo-dark-full.png
 *        supports any brand name (shop1..shop10, etc.)
 * Falls back to 'evx' if not set.
 *
 * Expected folder structure:
 *   public/img/logo/{brand}/logo-{mode}-{type}.png
 */
const LOGO_BASE_PATH = '/img/logo'
const brand = process.env.NEXT_PUBLIC_LOGO || 'evx'

export function getLogoSrc(
  mode: 'light' | 'dark',
  type: 'full' | 'streamline',
): string {
  return `${LOGO_BASE_PATH}/${brand}/logo-${mode}-${type}.png`
}

export const LOGO_BRAND = brand
