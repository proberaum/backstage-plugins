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
  CellText,
} from '@backstage/ui';

import { proxyViewerTranslationRef } from '../translations';
import { ParsedProxyEndpoint } from '../types';

export const ProxyViewerContent = () => {
  const { t } = useTranslationRef(proxyViewerTranslationRef);
  const [searchTerm, setSearchTerm] = useQueryParamState<string | undefined>(
    'q',
  );
  const handleSearchChange = (value: string) => {
    setSearchTerm(value || undefined);
  };

  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [endpoints, setEndpoints] = useState<ParsedProxyEndpoint[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const baseUrl = await discoveryApi.getBaseUrl('proxy-viewer');
        const response = await fetchApi.fetch(`${baseUrl}/endpoints`);
        if (!response.ok) {
          throw new Error();
        }
        const json = await response.json();
        setEndpoints(json);
      } catch (error) {
        console.warn('error', error);
      }
    })();
  }, []);

  const filteredEndpoints = useMemo(() => {
    if (!searchTerm || !endpoints) {
      return endpoints;
    }
    const lowerCasedTerm = searchTerm.toLocaleLowerCase('en');
    return endpoints
      .filter(
        (endpoint) =>
          endpoint.path.toLocaleLowerCase('en').includes(lowerCasedTerm) ||
          endpoint.target.toLocaleLowerCase('en').includes(lowerCasedTerm),
      );
  }, [searchTerm, endpoints]);

  return (
    <>
      <SearchField
        placeholder={t('common.filterPlaceholder')}
        defaultValue={searchTerm}
        onChange={handleSearchChange}
      />
      <Table>
        <TableHeader>
          <Column isRowHeader>
            Path
          </Column>
          <Column isRowHeader>
            Target
          </Column>
          <Column isRowHeader>
            Headers
          </Column>
          <Column isRowHeader>
            Change Origin
          </Column>
          <Column isRowHeader>
            Path Rewrite
          </Column>
          <Column isRowHeader>
            Allow Methods
          </Column>
          <Column isRowHeader>
            Allow Headers
          </Column>
          <Column isRowHeader>
            Credentials
          </Column>
        </TableHeader>
        <TableBody>
          {filteredEndpoints.map((endpoint) => (
            <Row key={endpoint.path} style={{ cursor: 'unset' }}>
              <CellText title={endpoint.path} />
              <CellText title={endpoint.target} />
              <Cell>
                {endpoint.headers
                  ? Object.entries(endpoint.headers)
                      .map(([key, value]) => (
                        <div key={key}>
                          {key}: {value}
                        </div>
                      ))
                  : '-'}
              </Cell>
              <Cell>{JSON.stringify(endpoint.changeOrigin) ?? 'default'}</Cell>
              <Cell>
                {endpoint.pathRewrite
                  ? Object.entries(endpoint.pathRewrite)
                      .map(([regex, value]) => (
                        <div key={regex}>
                          {regex}{' -> '}{value}
                        </div>
                      ))
                  : '-'}
              </Cell>
              <Cell>
                {endpoint.allowedMethods
                  ? endpoint.allowedMethods.join(', ')
                  : '-'}
              </Cell>
              <Cell>
                {endpoint.allowedHeaders
                  ? endpoint.allowedHeaders.join(', ')
                  : '-'}
              </Cell>
              <Cell>{JSON.stringify(endpoint.credentials) ?? 'default'}</Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
