import { useMemo, useState } from 'react';
import { useQueryParamState } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  Alert,
  Cell,
  CellText,
  ColumnConfig,
  Flex,
  SearchField,
  SortDescriptor,
  Table,
} from '@backstage/ui';

import { proxyViewerTranslationRef } from '../translations';
import { ParsedProxyEndpoint } from '../types';
import { useProxies } from '../hooks/useProxies';

export const ProxyViewerContent = () => {
  const { t } = useTranslationRef(proxyViewerTranslationRef);
  const [searchTerm, setSearchTerm] = useQueryParamState<string | undefined>(
    'q',
  );
  const handleSearchChange = (value: string) => {
    setSearchTerm(value || undefined);
  };
  const [sort, onSortChange] = useState<SortDescriptor | null>(null);

  const columns = useMemo<ColumnConfig<ParsedProxyEndpoint>[]>(
    () => [
      {
        id: 'path',
        label: t('table.path'),
        cell: item => <CellText title={item.path} />,
        isRowHeader: true,
        isSortable: true,
      },
      {
        id: 'target',
        label: t('table.target'),
        cell: item => <CellText title={item.target} />,
        isSortable: true,
      },
      {
        id: 'headers',
        label: t('table.headers'),
        cell: item => (
          <Cell>
            {item.headers
              ? Object.entries(item.headers).map(([key, value]) => (
                  <div key={key}>
                    {key}: {value}
                  </div>
                ))
              : '-'}
          </Cell>
        ),
        isSortable: false, // TODO
      },
      {
        id: 'changeOrigin',
        label: t('table.changeOrigin'),
        cell: item => (
          <CellText title={JSON.stringify(item.changeOrigin) ?? 'default'} />
        ),
        isSortable: false, // TODO
      },
      {
        id: 'pathRewrite',
        label: t('table.pathRewrite'),
        cell: item => (
          <Cell>
            {item.pathRewrite
              ? Object.entries(item.pathRewrite).map(([regex, value]) => (
                  <div key={regex}>
                    {regex}
                    {' -> '}
                    {value}
                  </div>
                ))
              : '-'}
          </Cell>
        ),
        isSortable: false, // TODO
      },
      {
        id: 'allowedMethods',
        label: t('table.allowedMethods'),
        cell: item => (
          <CellText
            title={item.allowedMethods ? item.allowedMethods.join(', ') : '-'}
          />
        ),
        isSortable: false, // TODO
      },
      {
        id: 'allowedHeaders',
        label: t('table.allowedHeaders'),
        cell: item => (
          <CellText
            title={item.allowedHeaders ? item.allowedHeaders.join(', ') : '-'}
          />
        ),
        isSortable: false, // TODO
      },
      {
        id: 'Credentials',
        label: t('table.credentials'),
        cell: item => (
          <CellText title={JSON.stringify(item.credentials) ?? 'default'} />
        ),
        isSortable: false, // TODO
      },
    ],
    [],
  );

  const { data, loading, error } = useProxies();

  const filteredAndSortedData = useMemo(() => {
    if (!data) {
      return undefined;
    }
    let rows = data;

    const lowerCasedTerm = searchTerm?.trim().toLocaleLowerCase('en');
    if (lowerCasedTerm) {
      rows = rows.filter(row =>
        JSON.stringify(row).toLocaleLowerCase('en').includes(lowerCasedTerm),
      );
    }

    if (sort) {
      if (sort.column === 'path') {
        rows.sort(
          (a, b) =>
            a.path.localeCompare(b.path) *
            (sort.direction === 'descending' ? -1 : 1),
        );
      }
      if (sort.column === 'target') {
        rows.sort(
          (a, b) =>
            a.target.localeCompare(b.target) *
            (sort.direction === 'descending' ? -1 : 1),
        );
      }
    }

    return rows;
  }, [data, searchTerm, sort]);

  return (
    <Flex direction="column" gap="5" py="5">
      {error ? <Alert status="danger" icon title={String(error)} /> : null}
      <SearchField
        placeholder={t('common.filterPlaceholder')}
        defaultValue={searchTerm}
        onChange={handleSearchChange}
      />
      <Table
        columnConfig={columns}
        data={filteredAndSortedData}
        loading={loading}
        isStale={loading}
        pagination={{ type: 'none' }}
        sort={{
          descriptor: sort,
          onSortChange,
        }}
        emptyState={'No item found.'}
      />
    </Flex>
  );
};
