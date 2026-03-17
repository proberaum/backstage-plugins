import { useCallback, useEffect, useRef, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  HCLOUD_SERVER_ANNOTATION,
  HCLOUD_PROJECT_ANNOTATION,
  HcloudServerDetails,
} from '@proberaum/backstage-plugin-hcloud-common';
import { hcloudApiRef } from '../api';

export interface UseServerDetailsResult {
  server: HcloudServerDetails | undefined;
  loading: boolean;
  error: Error | undefined;
  refresh: () => void;
}

export function useServerDetails(): UseServerDetailsResult {
  const { entity } = useEntity();
  const api = useApi(hcloudApiRef);
  const [server, setServer] = useState<HcloudServerDetails>();
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
      const result = await api.getServer(ref, project);
      if (mountedRef.current) {
        setServer(result);
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
  }, [api, ref, project]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  return { server, loading, error, refresh: load };
}
