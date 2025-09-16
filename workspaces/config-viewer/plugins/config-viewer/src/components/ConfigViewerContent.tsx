import { ChangeEventHandler, useMemo } from 'react';
import { CodeSnippet, useQueryParamState } from '@backstage/core-components';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { TextField as SearchField } from '@backstage/canon';

import YAML from 'yaml';

export const ConfigViewerContent = () => {
  const [searchTerm, setSearchTerm] = useQueryParamState<string | undefined>(
    'q',
  );
  const handleSearchChange: ChangeEventHandler<HTMLInputElement> = event => {
    const value = event.target.value;
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
        name="q" // can be removed with @backstage/ui
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
