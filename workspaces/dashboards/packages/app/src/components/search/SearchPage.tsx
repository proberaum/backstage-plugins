import React from 'react';
import { Grid, Paper } from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';

import { CatalogSearchResultListItem } from '@backstage/plugin-catalog';
import {
  catalogApiRef,
  CATALOG_FILTER_EXISTS,
} from '@backstage/plugin-catalog-react';

import { SearchType } from '@backstage/plugin-search';
import {
  SearchBar,
  SearchFilter,
  SearchResult,
  SearchPagination,
  useSearch,
} from '@backstage/plugin-search-react';
import {
  CatalogIcon,
  Content,
  DocsIcon,
  Header,
  Page,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

const useStyles = makeStyles(() => ({
  filters: {
    padding: '16px',
    marginTop: '16px',
  },
  filter: {
    '& + &': {
      marginTop: '20px',
    },
  },
}));

const SearchPage = () => {
  const classes = useStyles();
  const { types } = useSearch();
  const catalogApi = useApi(catalogApiRef);

  return (
    <Page themeId="home">
      <Header title="Search" />
      <Content>
        <Grid container direction="row">
          <Grid item xs={12}>
            <SearchBar />
          </Grid>
          <Grid item xs={3}>
            <SearchType.Accordion
              name="Result Type"
              defaultValue="software-catalog"
              types={[
                {
                  value: 'software-catalog',
                  name: 'Software Catalog',
                  icon: <CatalogIcon />,
                },
                {
                  value: 'techdocs',
                  name: 'Documentation',
                  icon: <DocsIcon />,
                },
              ]}
            />
            <Paper className={classes.filters}>
              {types.includes('techdocs') && (
                <SearchFilter.Select
                  className={classes.filter}
                  label="Entity"
                  name="name"
                  values={async () => {
                    // Return a list of entities which are documented.
                    const { items } = await catalogApi.getEntities({
                      fields: ['metadata.name'],
                      filter: {
                        'metadata.annotations.backstage.io/techdocs-ref':
                          CATALOG_FILTER_EXISTS,
                      },
                    });

                    const names = items.map(entity => entity.metadata.name);
                    names.sort();
                    return names;
                  }}
                />
              )}
              <SearchFilter.Select
                className={classes.filter}
                label="Kind"
                name="kind"
                values={['Component', 'Template']}
              />
              <SearchFilter.Checkbox
                className={classes.filter}
                label="Lifecycle"
                name="lifecycle"
                values={['experimental', 'production']}
              />
            </Paper>
          </Grid>
          <Grid item xs={9}>
            <SearchPagination />
            <SearchResult>
              <CatalogSearchResultListItem icon={<CatalogIcon />} />
            </SearchResult>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};

export const searchPage = <SearchPage />;
