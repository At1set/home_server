/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_GATEWAY_DEV: string;
	readonly VITE_API_GATEWAY_PROD: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
