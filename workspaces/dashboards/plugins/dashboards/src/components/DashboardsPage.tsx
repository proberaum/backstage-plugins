import React from 'react';
import {
  Header,
  Page,
  Content,
  Table,
  TableColumn,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import { Dashboard } from '../../../dashboards-common/src';
import useAsync from 'react-use/lib/useAsync';

export const DashboardsPage = () => {
  const { fetch } = useApi(fetchApiRef);

  const { value, loading, error } = useAsync<() => Promise<{ items: Dashboard[] }>>(async () => {
    // TODO use client, use identity
    const response = await fetch('http://localhost:7007/api/dashboards/dashboards');
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json();
  }, []);

  const columns: TableColumn[] = [
    { title: 'Name', field: 'name' },
    { title: 'Title', field: 'title' },
  ];

  return (
    <Page themeId="tool">
      <Header title="Dashboards" />
      <Content>
        {error ? 
          <ResponseErrorPanel error={error} /> :
          <Table
            title="Dashboards"
            options={{ search: false, paging: false }}
            columns={columns}
            isLoading={loading}
            data={value?.items || []}
          />
        }
      </Content>
    </Page>
  );
}
