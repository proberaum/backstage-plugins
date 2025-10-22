import { useEffect, useState } from 'react';

import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';

export const useFileContent = (filename: string | undefined) => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [fileContent, setFileContent] = useState<string>('');
  useEffect(() => {
    if (!filename) {
      return;
    }
    (async () => {
      try {
        const baseUrl = await discoveryApi.getBaseUrl('config-viewer');
        const response = await fetchApi.fetch(
          `${baseUrl}/content?filename=${filename}`,
        );
        if (!response.ok) {
          throw new Error();
        }
        const content = await response.text();
        setFileContent(content);
      } catch (error) {
        console.warn('error', error);
      }
    })();
  }, [filename]);
  return fileContent;
};
