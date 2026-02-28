import { useMemo, useState } from 'react';
import { useQueryParamState } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  Alert,
  CellText,
  ColumnConfig,
  Flex,
  SearchField,
  SortDescriptor,
  Table,
  TableItem,
} from '@backstage/ui';

import { envViewerTranslationRef } from '../translations';
import { useEnvVars } from '../hooks/useEnvVars';

export interface EnvVarRow extends TableItem {
  key: string;
  value: string;
}

export const EnvViewerContent = () => {
  const { t } = useTranslationRef(envViewerTranslationRef);
  const [searchTerm, setSearchTerm] = useQueryParamState<string | undefined>(
    'q',
  );
  const handleSearchChange = (value: string) => {
    setSearchTerm(value || undefined);
  };
  const [sort, onSortChange] = useState<SortDescriptor | null>(null);

  const columns = useMemo<ColumnConfig<EnvVarRow>[]>(
    () => [
      {
        id: 'key',
        label: t('common.key'),
        cell: item => <CellText title={item.key} />,
        isRowHeader: true,
        isSortable: true,
      },
      {
        id: 'value',
        label: t('common.value'),
        cell: item => <CellText title={item.value} />,
        isSortable: true,
      },
    ],
    [],
  );

  const { data, loading, error } = useEnvVars();

  const filteredAndSortedData = useMemo(() => {
    if (!data) {
      return undefined;
    }
    let rows = Object.entries(data).map<EnvVarRow>(([key, value]) => ({
      id: key,
      key,
      value: value as string,
    }));

    const lowerCasedTerm = searchTerm?.trim().toLocaleLowerCase('en');
    if (lowerCasedTerm) {
      rows = rows.filter(
        row =>
          row.key.toLocaleLowerCase('en').includes(lowerCasedTerm) ||
          row.value.toLocaleLowerCase('en').includes(lowerCasedTerm),
      );
    }

    if (sort) {
      if (sort.column === 'key') {
        rows.sort(
          (a, b) =>
            a.key.localeCompare(b.key) *
            (sort.direction === 'descending' ? -1 : 1),
        );
      }
      if (sort.column === 'value') {
        rows.sort(
          (a, b) =>
            a.value.localeCompare(b.value) *
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
