import { HttpAuthService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import express from 'express';
import Router from 'express-promise-router';
import { z } from 'zod';
import { HcloudService } from './service';

const metricsQuerySchema = z.object({
  type: z.enum(['cpu', 'disk', 'network']),
  range: z.enum(['1h', '6h', '24h', '7d', '30d']),
  project: z.string().optional(),
});

export async function createRouter(options: {
  httpAuth: HttpAuthService;
  hcloudService: HcloudService;
}): Promise<express.Router> {
  const { httpAuth, hcloudService } = options;
  const router = Router();
  router.use(express.json());

  router.get('/servers/:ref', async (req, res) => {
    await httpAuth.credentials(req as any, { allow: ['user'] });
    const { ref } = req.params;
    const project = req.query.project as string | undefined;
    const server = await hcloudService.getServer(ref, project);
    res.json(server);
  });

  router.get('/servers/:ref/metrics', async (req, res) => {
    await httpAuth.credentials(req as any, { allow: ['user'] });
    const { ref } = req.params;
    const parsed = metricsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new InputError(`Invalid query parameters: ${parsed.error.message}`);
    }
    const { type, range, project } = parsed.data;
    const metrics = await hcloudService.getServerMetrics(
      ref,
      type,
      range,
      project,
    );
    res.json(metrics);
  });

  return router;
}
