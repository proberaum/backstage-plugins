import { useEffect, useState } from 'react';

import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';

export const useFiles = () => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [files, setFiles] = useState<string[]>();
  useEffect(() => {
    (async () => {
      try {
        const baseUrl = await discoveryApi.getBaseUrl('config-viewer');
        const response = await fetchApi.fetch(`${baseUrl}/files`);
        if (!response.ok) {
          throw new Error();
        }
        const json = await response.json();
        setFiles(json);
      } catch (error) {
        console.warn('error', error);
      }
    })();
  }, []);
  return files;
};
