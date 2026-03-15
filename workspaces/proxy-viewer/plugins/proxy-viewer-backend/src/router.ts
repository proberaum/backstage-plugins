import { RootConfigService } from '@backstage/backend-plugin-api';
import { NotAllowedError } from '@backstage/errors';

import express from 'express';
import Router from 'express-promise-router';

import { ProxyConfig, ProxyEndpointConfig, ProxyViewerConfig } from '../config';
import { ParsedProxyEndpoint } from './types';

// remove all securet headers
function convertHeaders(
  headers: Record<string, string | undefined> | undefined,
): { [key: string]: string | undefined } | undefined {
  if (!headers) {
    return undefined;
  }

  return Object.entries(headers).reduce((acc, [key, value]) => {
    if (
      key.toLowerCase().includes('auth') ||
      key.toLowerCase().includes('api-key')
    ) {
      acc[key] = '***REDACTED***';
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {} as { [key: string]: string | undefined });
}

function convertEndpoint(
  path: string,
  endpoint: string | ProxyEndpointConfig,
): ParsedProxyEndpoint {
  if (typeof endpoint === 'string') {
    return {
      id: path,
      path,
      target: endpoint,
    };
  } else {
    return {
      id: path,
      path,
      target: endpoint.target,
      headers: convertHeaders(endpoint.headers),
      changeOrigin: endpoint.changeOrigin,
      pathRewrite: endpoint.pathRewrite,
      allowedMethods: endpoint.allowedMethods,
      allowedHeaders: endpoint.allowedHeaders,
      credentials: endpoint.credentials,
    };
  }
}

export async function createRouter({
  rootConfig,
}: // httpAuth,
{
  rootConfig: RootConfigService;
  // httpAuth: HttpAuthService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.get('/endpoints', async (_req, res) => {
    const proxyViewerConfig =
      rootConfig.getOptional<ProxyViewerConfig>('proxyViewer');
    if (
      !proxyViewerConfig ||
      !proxyViewerConfig.dangerouslyAnyoneCanReadAllProxies
    ) {
      throw new NotAllowedError();
    }

    const proxyConfig = rootConfig.getOptional<ProxyConfig['proxy']>('proxy');

    if (proxyConfig?.endpoints) {
      const endpoints = Object.entries(proxyConfig.endpoints).map(
        ([path, endpoint]) => convertEndpoint(path, endpoint),
      );
      res.json(endpoints);
    } else if (typeof proxyConfig?.proxy === 'object') {
      const endpoints = Object.entries(
        proxyConfig as Record<string, string | ProxyEndpointConfig>,
      )
        .filter(([path]) => path.startsWith('/'))
        .map(([path, endpoint]) => convertEndpoint(path, endpoint));
      res.json(endpoints);
    } else {
      res.json([]);
    }
  });

  return router;
}
