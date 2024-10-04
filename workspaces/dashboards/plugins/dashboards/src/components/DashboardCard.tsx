import React from 'react';
import { CodeSnippet, InfoCard, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { dashboardsApiRef } from '../api/DashboardsApi';

export const DashboardCard = () => {
  const dashboardsApi = useApi(dashboardsApiRef);

  const { value, loading, error } = useAsync(() => dashboardsApi.getDashboard('asd'), []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <InfoCard title="TODO">
      <CodeSnippet
        language="json"
        text={JSON.stringify(value, null, 2)}
      />
    </InfoCard>
  );
}
