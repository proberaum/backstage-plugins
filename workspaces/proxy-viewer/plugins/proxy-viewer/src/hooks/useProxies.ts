import { useEffect, useState } from 'react';
import {
  useApi,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { ParsedProxyEndpoint } from '../types';

export const useProxies = () => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [data, setData] = useState<ParsedProxyEndpoint[]>();
  const [error, setError] = useState<Error>();
  useEffect(() => {
    (async () => {
      try {
        const baseUrl = await discoveryApi.getBaseUrl('proxy-viewer');
        const response = await fetchApi.fetch(`${baseUrl}/endpoints`);
        if (!response.ok) {
          throw new Error(
            `Env var API response is not ok: ${response.status} ${response.statusText}`,
          );
        }
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.warn('Env var API call failed:', error);
        setError(error);
      }
    })();
  }, []);
  return {
    data,
    loading: !data && !error,
    error,
  };
};
