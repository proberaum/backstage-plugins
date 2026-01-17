export interface ProxyViewerConfig {
  dangerouslyAnyoneCanReadAllProxies?: boolean;
}

export interface ProxyEndpointConfig {
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
  credentials?:
    | 'require'
    | 'forward'
    | 'dangerously-allow-unauthenticated';
}

export interface ProxyConfig {
  proxy?: {
    skipInvalidProxies?: boolean;
    reviveConsumedRequestBodies?: boolean;
    endpoints?: {
      [key: string]: string | ProxyEndpointConfig;
    };
  } & {
    [key: string]: string | ProxyEndpointConfig;
  };
}

export interface Config {
  proxyViewer?: ProxyViewerConfig;
  proxy?: ProxyConfig;
}
