export type ParsedProxyEndpoint = {
  path: string;
  target: string;
  headers?: { [key: string]: string | undefined };
  changeOrigin?: boolean;
  pathRewrite?: { [regexp: string]: string };
  allowedMethods?: string[];
  allowedHeaders?: string[];
  credentials?:
    | 'require'
    | 'forward'
    | 'dangerously-allow-unauthenticated';
};
