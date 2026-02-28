import { useMemo, useState } from 'react';
import { AppIcon, useQueryParamState } from '@backstage/core-components';
import { useApp } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
// import { iconsApiRef } from '@backstage/frontend-plugin-api';
import {
  Card,
  CardBody,
  CardFooter,
  CellText,
  ColumnConfig,
  Flex,
  Grid,
  Row,
  SearchField,
  SortDescriptor,
  Table,
  TableItem,
  ToggleButton,
  ToggleButtonGroup,
} from '@backstage/ui';

import {
  RiGridFill as GridIcon,
  RiListUnordered as ListIcon,
} from '@remixicon/react';

import { iconViewerTranslationRef } from '../translations';

export interface Row extends TableItem {
  iconId: string;
}

export const IconViewerContent = () => {
  const { t } = useTranslationRef(iconViewerTranslationRef);
  const [searchTerm, setSearchTerm] = useQueryParamState<string | undefined>(
    'q',
  );
  const handleSearchChange = (value: string) => {
    setSearchTerm(value || undefined);
  };
  const [sort, onSortChange] = useState<SortDescriptor>({
    column: 'icon',
    direction: 'ascending',
  });
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const columns = useMemo<ColumnConfig<Row>[]>(
    () => [
      {
        id: 'icon',
        label: 'Icon',
        cell: item => (
          <CellText
            leadingIcon={<AppIcon id={item.iconId} />}
            title={item.iconId}
          />
        ),
        isRowHeader: true,
        isSortable: true,
      },
    ],
    [],
  );

  const app = useApp();
  const allIcons = useMemo(() => app.getSystemIcons(), [app]);

  // const iconsApi = useApi(iconsApiRef);
  // const allIcons = useMemo(() => iconsApi.listIconKeys(), [iconsApi]);

  const filteredAndSortedIcons = useMemo<Row[]>(() => {
    let rows = Object.entries(allIcons).map<Row>(([iconId, iconComponent]) => ({
      id: iconId,
      iconId,
      iconComponent,
    }));

    const lowerCasedTerm = searchTerm?.trim().toLocaleLowerCase('en');
    if (lowerCasedTerm) {
      rows = rows.filter(row =>
        row.iconId.toLocaleLowerCase('en').includes(lowerCasedTerm),
      );
    }

    rows.sort(
      (a, b) =>
        a.iconId.localeCompare(b.iconId) *
        (sort.direction === 'descending' ? -1 : 1),
    );

    return rows;
  }, [allIcons, searchTerm, sort]);

  return (
    <Flex direction="column" gap="5" py="5">
      <Flex align="center" gap="2">
        <SearchField
          aria-label={t('common.filterPlaceholder')}
          placeholder={t('common.filterPlaceholder')}
          defaultValue={searchTerm}
          onChange={handleSearchChange}
        />
        <ToggleButtonGroup
          selectedKeys={[view]}
          onSelectionChange={keys =>
            setView(keys.has('list') ? 'list' : 'grid')
          }
        >
          <ToggleButton id="grid" iconStart={<GridIcon />}>
            Grid
          </ToggleButton>
          <ToggleButton id="list" iconStart={<ListIcon />}>
            List
          </ToggleButton>
        </ToggleButtonGroup>
      </Flex>
      {view === 'grid' ? (
        <Grid.Root columns={{ initial: '2', sm: '3', md: '6', lg: '12' }}>
          {filteredAndSortedIcons.map(item => (
            <Card key={item.id}>
              <CardBody style={{ textAlign: 'center' }}>
                <AppIcon id={item.iconId} />
              </CardBody>
              <CardFooter style={{ textAlign: 'center' }}>
                {item.iconId}
              </CardFooter>
            </Card>
          ))}
        </Grid.Root>
      ) : (
        <Table
          columnConfig={columns}
          data={filteredAndSortedIcons}
          pagination={{ type: 'none' }}
          sort={{
            descriptor: sort,
            onSortChange,
          }}
          emptyState={'No item found.'}
        />
      )}
    </Flex>
  );
};
