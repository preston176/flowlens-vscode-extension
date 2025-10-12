/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHEETDB_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
