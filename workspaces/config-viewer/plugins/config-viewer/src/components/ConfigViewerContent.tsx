import { Key, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { CodeSnippet, useQueryParamState } from '@backstage/core-components';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Tabs, TabList, Tab, SearchField, Flex } from '@backstage/ui';

import YAML from 'yaml';

import { configViewerTranslationRef } from '../translations';
import { useFiles } from '../hooks/useFiles';
import { useFileContent } from '../hooks/useFileContent';

const frontendTabKey: Key = '__frontend';

export const ConfigViewerContent = () => {
  const { t } = useTranslationRef(configViewerTranslationRef);

  const files = useFiles();

  const [searchTerm, setSearchTerm] = useQueryParamState<string | undefined>(
    'q',
  );
  const handleSearchChange = (value: string) => {
    setSearchTerm(value || undefined);
  };

  const configApi = useApi(configApiRef);
  const config = configApi.get();
  const yaml = YAML.stringify(config);

  const [filename] = useQueryParamState<string | undefined>('filename');
  const fileContent = useFileContent(filename);

  const filteredYaml = useMemo(() => {
    const selectedYaml = filename ? fileContent : yaml;
    if (!searchTerm) {
      return selectedYaml;
    }
    const lowerCasedTerm = searchTerm.toLocaleLowerCase('en');
    return selectedYaml
      .split('\n')
      .filter(line => line.toLocaleLowerCase('en').includes(lowerCasedTerm))
      .join('\n');
  }, [searchTerm, yaml, filename, fileContent]);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  searchParams.delete('filename');

  return (
    <Flex direction="column" gap="5" py="5">
      {files && files.length > 0 ? (
        <Tabs selectedKey={filename ?? frontendTabKey}>
          <TabList>
            <Tab id={frontendTabKey} href={`?${searchParams}`}>
              Frontend config
            </Tab>
            {files.map(file => {
              searchParams.set('filename', file);
              return (
                <Tab key={file} id={file} href={`?${searchParams}`}>
                  {file}
                </Tab>
              );
            })}
          </TabList>
        </Tabs>
      ) : null}

      <SearchField
        placeholder={t('common.filterPlaceholder')}
        defaultValue={searchTerm}
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
