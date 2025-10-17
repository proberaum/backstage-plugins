import { useMemo } from 'react';
import { AppIcon, useQueryParamState } from '@backstage/core-components';
import { useApp } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
// import { iconsApiRef } from '@backstage/frontend-plugin-api';
import {
  SearchField,
  Table,
  TableHeader,
  TableBody,
  Column,
  Row,
  Cell,
} from '@backstage/ui';

import { iconViewerTranslationRef } from '../translations';

export const IconViewerContent = () => {
  const { t } = useTranslationRef(iconViewerTranslationRef);
  const [searchTerm, setSearchTerm] = useQueryParamState<string | undefined>(
    'q',
  );
  const handleSearchChange = (value: string) => {
    setSearchTerm(value || undefined);
  };

  const app = useApp();
  const allIcons = useMemo(
    () => Object.keys(app.getSystemIcons()).sort(),
    [app],
  );

  // const iconsApi = useApi(iconsApiRef);
  // const allIcons = useMemo(() => iconsApi.listIconKeys(), [iconsApi]);

  const filteredIcons = useMemo(() => {
    if (!searchTerm) {
      return allIcons;
    }
    const lowerCasedTerm = searchTerm.toLocaleLowerCase('en');
    return allIcons.filter(id =>
      id.toLocaleLowerCase('en').includes(lowerCasedTerm),
    );
  }, [searchTerm, allIcons]);

  return (
    <>
      <SearchField
        placeholder={t('common.filterPlaceholder')}
        defaultValue={searchTerm}
        onChange={handleSearchChange}
      />
      <Table>
        <TableHeader>
          <Column isRowHeader>Icon</Column>
        </TableHeader>
        <TableBody>
          {filteredIcons.map(iconId => (
            <Row key={iconId}>
              <Cell title={iconId} leadingIcon={<AppIcon id={iconId} />} />
            </Row>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
