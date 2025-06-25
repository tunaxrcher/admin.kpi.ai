import { auth } from '../auth'
import AuthProvider from '../components/auth/AuthProvider'
import ThemeProvider from '../components/template/Theme/ThemeProvider'
import pageMetaConfig from '../configs/page-meta.config'
import NavigationProvider from '../components/template/Navigation/NavigationProvider'
import { getNavigation } from '../server/actions/navigation/getNavigation'
import { getTheme } from '../server/actions/theme'
import type { ReactNode } from 'react'
import '@/assets/styles/app.css'
import { Kanit } from 'next/font/google'
import ReactQueryProvider from '../providers/ReactQueryProvider'

const kanit = Kanit({
  variable: '--font-kanit',
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
  display: 'swap',
})

export const metadata = {
  ...pageMetaConfig,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const session = await auth()

  const navigationTree = await getNavigation()

  const theme = await getTheme()

  return (
    <AuthProvider session={session}>
      <ReactQueryProvider>
        <html
          className={`${kanit.variable} ${theme.mode === 'dark' ? 'dark' : 'light'}`}
          dir={theme.direction}
          suppressHydrationWarning
        >
          <body suppressHydrationWarning>
            <ThemeProvider theme={theme}>
              <NavigationProvider navigationTree={navigationTree}>
                {children}
              </NavigationProvider>
            </ThemeProvider>
          </body>
        </html>
      </ReactQueryProvider>
    </AuthProvider>
  )
}
