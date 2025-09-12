import { CodeSnippet } from '@backstage/core-components';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

import YAML from 'yaml';

export const ConfigViewerContent = () => {
  const configApi = useApi(configApiRef);
  const config = configApi.get();
  const yaml = YAML.stringify(config);

  return (
    <CodeSnippet
      language="yaml"
      text={yaml}
      showLineNumbers
      showCopyCodeButton
    />
  );
};
