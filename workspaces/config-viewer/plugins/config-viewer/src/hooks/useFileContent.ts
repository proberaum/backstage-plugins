import { useEffect, useState } from 'react';

import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';

type FileContentState =
  { state: 'no-filename' } |
  { state: 'loading' } |
  { state: 'success', content: string } |
  { state: 'error', error: any };

export const useFileContent = (filename: string | undefined) => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [fileContent, setFileContent] = useState<FileContentState>({ state: 'no-filename' });
  useEffect(() => {
    if (!filename) {
      if (fileContent.state !== 'no-filename') {
        setFileContent({ state: 'no-filename' });
      }
      return;
    }
    (async () => {
      if (fileContent.state !== 'loading') {
        setFileContent({ state: 'loading' });
      }
      try {
        const baseUrl = await discoveryApi.getBaseUrl('config-viewer');
        const response = await fetchApi.fetch(
          `${baseUrl}/content?filename=${encodeURIComponent(filename)}`,
        );
        if (!response.ok) {
          throw new Error();
        }
        const content = await response.text();
        setFileContent({ state: 'success', content });
      } catch (error) {
        console.warn('error', error);
        setFileContent({ state: 'error', error });
      }
    })();
  }, [filename]);
  return fileContent;
};
