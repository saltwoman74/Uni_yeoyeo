/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ALPHA_VANTAGE_KEY: string
    readonly VITE_FRED_KEY: string
    readonly VITE_BOK_KEY: string
    readonly VITE_KOREAEXIM_KEY: string
    readonly VITE_DATA_GO_KR_KEY: string
    readonly VITE_GOOGLE_SHEET_ID: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
