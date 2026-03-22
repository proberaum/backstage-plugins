import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { CodeSnippet, useQueryParamState } from '@backstage/core-components';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { useRouteRef, useTranslationRef } from '@backstage/frontend-plugin-api';
import { SearchField, Flex } from '@backstage/ui';

import YAML from 'yaml';

import { configViewerTranslationRef } from '../translations';
import { useFileContent } from '../hooks/useFileContent';
import { rootRouteRef } from '../routes';

export const ConfigViewerContent = () => {
  const { t } = useTranslationRef(configViewerTranslationRef);

  // Extract filename from query param or from path
  let [filename] = useQueryParamState<string>('filename');

  const location = useLocation();
  const rootRouteFn = useRouteRef(rootRouteRef);
  const rootPrefix = rootRouteFn!() + '/';
  if (!filename && location.pathname.startsWith(rootPrefix)) {
    filename = location.pathname.substring(rootPrefix.length);
  }

  // Extract search term from query
  const [searchTerm, setSearchTerm] = useQueryParamState<string | undefined>('q');
  const handleSearchChange = (value: string) => {
    setSearchTerm(value || undefined);
  };

  // Automatically re-apply search term when the filename (tab) was clicked.
  // It gets *not* triggered if the user clicks the tab again,
  // so that search term disappears. But to me that feels like a small hidden feature... :D
  useEffect(() => {
    setSearchTerm(searchTerm);
  }, [filename]);

  // Frontend config
  const configApi = useApi(configApiRef);
  const config = configApi.get();

  // Backend config
  const fileContentState = useFileContent(filename);

  const filteredYaml = useMemo(() => {
    let yaml: string;
    if (filename) {
      if (fileContentState.state === 'success') {
        yaml = fileContentState.content;
      } else {
        yaml = '';
      }
    } else {
      yaml = YAML.stringify(config);
    }
    if (!searchTerm) {
      return yaml;
    }
    const lowerCasedTerm = searchTerm.toLocaleLowerCase('en');
    return yaml
      .split('\n')
      .filter(line => line.toLocaleLowerCase('en').includes(lowerCasedTerm))
      .join('\n');
  }, [searchTerm, config, filename, fileContentState]);

  return (
    <Flex direction="column" py="5">
      <SearchField
        placeholder={t('common.filterPlaceholder')}
        value={searchTerm || ''}
        onChange={handleSearchChange}
      />
      <CodeSnippet
        language="yaml"
        text={filteredYaml}
        showLineNumbers
        showCopyCodeButton
      />
    </Flex>
  );
};
