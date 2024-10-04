import React from 'react';
import { CodeSnippet, InfoCard, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import { useQuery } from '@tanstack/react-query'
import { dashboardsApiRef } from '../api/DashboardsApi';
import { dashboardDetailRouteRef } from '../routes';

export const DashboardCard = () => {
  const { name } = useRouteRefParams(dashboardDetailRouteRef);
  const dashboardsApi = useApi(dashboardsApiRef);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboards', name],
    queryFn: () => dashboardsApi.getDashboard(name),
  });

  let content: React.ReactNode
  if (isLoading) {
    content = <Progress />;
  } else if (error) {
    content = <ResponseErrorPanel error={error} />;
  } else {
    content = (
      <CodeSnippet
        language="json"
        text={JSON.stringify(data, null, 2)}
      />
    )
  }

  return (
    <InfoCard title={name}>
      {content}      
    </InfoCard>
  );
}
