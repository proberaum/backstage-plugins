export type ParsedProxyEndpoint = {
  id: string;
  path: string;
  target: string;
  headers?: {
    /** @visibility secret */
    Authorization?: string;
    /** @visibility secret */
    authorization?: string;
    /** @visibility secret */
    'X-Api-Key'?: string;
    /** @visibility secret */
    'x-api-key'?: string;
    [key: string]: string | undefined;
  };
  changeOrigin?: boolean;
  pathRewrite?: { [regexp: string]: string };
  allowedMethods?: string[];
  allowedHeaders?: string[];
  credentials?: 'require' | 'forward' | 'dangerously-allow-unauthenticated';
};
