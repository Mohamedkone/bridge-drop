interface ImportMetaEnv {
  readonly VITE_API: string
  readonly VITE_BASE_URL: string
  readonly VITE_STORAGE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}