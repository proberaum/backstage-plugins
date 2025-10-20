import { useEffect, useMemo, useState } from 'react';
import { useQueryParamState } from '@backstage/core-components';
import {
  useApi,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  SearchField,
  Table,
  TableHeader,
  TableBody,
  Column,
  Row,
  Cell,
} from '@backstage/ui';

import { envViewerTranslationRef } from '../translations';

export const EnvViewerContent = () => {
  const { t } = useTranslationRef(envViewerTranslationRef);
  const [searchTerm, setSearchTerm] = useQueryParamState<string | undefined>(
    'q',
  );
  const handleSearchChange = (value: string) => {
    setSearchTerm(value || undefined);
  };

  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [envVars, setEnvVars] = useState<Record<string, string>>();
  useEffect(() => {
    (async () => {
      try {
        const baseUrl = await discoveryApi.getBaseUrl('env-viewer');
        const response = await fetchApi.fetch(`${baseUrl}/envvars`);
        if (!response.ok) {
          throw new Error();
        }
        const json = await response.json();
        setEnvVars(json);
      } catch (error) {
        console.warn('error', error);
      }
    })();
  }, []);

  const filteredEnvVars = useMemo(() => {
    if (!searchTerm || !envVars) {
      return envVars;
    }
    const lowerCasedTerm = searchTerm.toLocaleLowerCase('en');
    return Object.entries(envVars)
      .filter(
        ([key, value]) =>
          key.toLocaleLowerCase('en').includes(lowerCasedTerm) ||
          value.toLocaleLowerCase('en').includes(lowerCasedTerm),
      )
      .reduce((acc, cur) => {
        acc[cur[0]] = cur[1];
        return acc;
      }, {} as Record<string, string>);
  }, [searchTerm, envVars]);

  return (
    <>
      <SearchField
        placeholder={t('common.filterPlaceholder')}
        defaultValue={searchTerm}
        onChange={handleSearchChange}
      />
      <Table>
        <TableHeader>
          <Column isRowHeader allowsSorting>
            Key
          </Column>
          <Column isRowHeader allowsSorting>
            Value
          </Column>
        </TableHeader>
        <TableBody>
          {filteredEnvVars
            ? Object.entries(filteredEnvVars).map(([key, value]) => (
                <Row key={key} style={{ cursor: 'unset' }}>
                  <Cell title={key} />
                  <Cell title={value} />
                </Row>
              ))
            : null}
        </TableBody>
      </Table>
    </>
  );
};
