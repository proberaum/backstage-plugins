import { useMemo } from 'react';
import { CodeSnippet, useQueryParamState } from '@backstage/core-components';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { SearchField } from '@backstage/ui';

import YAML from 'yaml';

import { configViewerTranslationRef } from '../translations';

export const ConfigViewerContent = () => {
  const { t } = useTranslationRef(configViewerTranslationRef);
  const [searchTerm, setSearchTerm] = useQueryParamState<string | undefined>(
    'q',
  );
  const handleSearchChange = (value: string) => {
    setSearchTerm(value || undefined);
  };

  const configApi = useApi(configApiRef);
  const config = configApi.get();
  const yaml = YAML.stringify(config);

  const filteredYaml = useMemo(() => {
    if (!searchTerm) {
      return yaml;
    }
    const lowerCasedTerm = searchTerm.toLocaleLowerCase('en');
    return yaml
      .split('\n')
      .filter(line => line.toLocaleLowerCase('en').includes(lowerCasedTerm))
      .join('\n');
  }, [searchTerm, yaml]);

  return (
    <>
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
    </>
  );
};
