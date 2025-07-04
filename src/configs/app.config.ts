export type AppConfig = {
  apiPrefix: string
  authenticatedEntryPath: string
  unAuthenticatedEntryPath: string
  locale: string
  activeNavTranslation: boolean
}

const appConfig: AppConfig = {
  apiPrefix: '/api',
  authenticatedEntryPath: '/ai',
  unAuthenticatedEntryPath: '/sign-in',
  locale: 'en',
  activeNavTranslation: false,
}

export default appConfig
