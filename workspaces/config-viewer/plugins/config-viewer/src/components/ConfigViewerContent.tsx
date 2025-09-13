import { useMemo } from 'react';
import { CodeSnippet, useQueryParamState } from '@backstage/core-components';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { SearchField } from '@backstage/ui';

import YAML from 'yaml';

export const ConfigViewerContent = () => {
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
        placeholder="Filter config keys"
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
