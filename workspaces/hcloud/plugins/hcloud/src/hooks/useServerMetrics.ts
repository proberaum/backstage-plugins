import { useCallback, useEffect, useRef, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  HCLOUD_SERVER_ANNOTATION,
  HCLOUD_PROJECT_ANNOTATION,
  HcloudMetricType,
  HcloudTimeRange,
  HcloudMetricsResponse,
} from '@proberaum/backstage-plugin-hcloud-common';
import { hcloudApiRef } from '../api';

export interface UseServerMetricsResult {
  metrics: HcloudMetricsResponse | undefined;
  loading: boolean;
  error: Error | undefined;
  refresh: () => void;
}

export function useServerMetrics(
  type: HcloudMetricType,
  range: HcloudTimeRange,
): UseServerMetricsResult {
  const { entity } = useEntity();
  const api = useApi(hcloudApiRef);
  const [metrics, setMetrics] = useState<HcloudMetricsResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const mountedRef = useRef(true);

  const ref = entity.metadata.annotations?.[HCLOUD_SERVER_ANNOTATION];
  const project = entity.metadata.annotations?.[HCLOUD_PROJECT_ANNOTATION];

  const load = useCallback(async () => {
    if (!ref) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const result = await api.getServerMetrics(ref, type, range, project);
      if (mountedRef.current) {
        setMetrics(result);
      }
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e : new Error(String(e)));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [api, ref, project, type, range]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  return { metrics, loading, error, refresh: load };
}
