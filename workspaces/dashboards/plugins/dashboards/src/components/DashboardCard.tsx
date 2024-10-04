import React from 'react';
import { CodeSnippet, InfoCard, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useQuery } from '@tanstack/react-query'
import { dashboardsApiRef } from '../api/DashboardsApi';

export const DashboardCard = () => {
  const dashboardsApi = useApi(dashboardsApiRef);

  // TODO: use path name
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboards', 'name'],
    queryFn: () => dashboardsApi.getDashboard('name'),
  });

  if (isLoading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <InfoCard title="TODO">
      <CodeSnippet
        language="json"
        text={JSON.stringify(data, null, 2)}
      />
    </InfoCard>
  );
}
