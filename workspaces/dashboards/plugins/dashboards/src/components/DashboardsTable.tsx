import React from 'react';
import { Table, TableColumn, ResponseErrorPanel, Link, OverflowTooltip } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import Chip from '@material-ui/core/Chip';
import { useQuery } from '@tanstack/react-query'
import { dashboardsApiRef } from '../api/DashboardsApi';
import type { Dashboard } from '@internal/backstage-plugin-dashboards-common';

const columns: TableColumn<Dashboard>[] = [
  {
    title: 'Name',
    field: 'name',
    highlight: true,
    render: (row) => <Link to={row.name}>{row.name}</Link>,
  },
  {
    title: 'Description',
    field: 'description',
    render: (row) => (
      <OverflowTooltip
        text={row.description}
        placement="bottom-start"
        line={2}
      />
    )
  },
  {
    title: 'Owner',
    field: 'owner',
    // use EntityRefLink from catalog-react later
    render: (row) => row.owner ? (
      <Link to={`/catalog/default/group/${row.owner}`}>{row.owner}</Link>
    ) : null
  },
  {
    title: 'Tags',
    field: 'tags',
    render: (row) => (
      <>
        {row.tags?.map(t => (
          <Chip
            key={t}
            label={t}
            size="small"
            variant="outlined"
            style={{ marginBottom: '0px' }}
          />
        ))}
      </>
    ),
  },
  {
    title: 'Actions',
    field: 'actions',
  },
];

export const DashboardsTable = () => {
  const dashboardsApi = useApi(dashboardsApiRef);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboards'],
    queryFn: () => dashboardsApi.getDashboards(),
  });

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <Table
      title="Dashboards"
      columns={columns}
      isLoading={isLoading}
      data={data || []}
    />
  );
}
