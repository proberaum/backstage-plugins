import {
  mockCredentials,
  startTestBackend,
} from '@backstage/backend-test-utils';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';
import request from 'supertest';

import { proxyViewerPlugin } from './plugin';

// TEMPLATE NOTE:
// Plugin tests are integration tests for your plugin, ensuring that all pieces
// work together end-to-end. You can still mock injected backend services
// however, just like anyone who installs your plugin might replace the
// services with their own implementations.
describe('plugin', () => {
  it('should create and read TODO items', async () => {
    const { server } = await startTestBackend({
      features: [proxyViewerPlugin],
    });

    await request(server).get('/api/proxy-viewer/endpoints').expect(200, {
      items: [],
    });

    const createRes = await request(server)
      .post('/api/proxy-viewer/endpoints')
      .send({ title: 'My Todo' });

    expect(createRes.status).toBe(201);
    expect(createRes.body).toEqual({
      id: expect.any(String),
      title: 'My Todo',
      createdBy: mockCredentials.user().principal.userEntityRef,
      createdAt: expect.any(String),
    });

    const createdTodoItem = createRes.body;

    await request(server)
      .get('/api/proxy-viewer/endpoints')
      .expect(200, {
        items: [createdTodoItem],
      });

    await request(server)
      .get(`/api/proxy-viewer/endpoints/${createdTodoItem.id}`)
      .expect(200, createdTodoItem);
  });

  it('should create TODO item with catalog information', async () => {
    const { server } = await startTestBackend({
      features: [
        proxyViewerPlugin,
        catalogServiceMock.factory({
          entities: [
            {
              apiVersion: 'backstage.io/v1alpha1',
              kind: 'Component',
              metadata: {
                name: 'my-component',
                namespace: 'default',
                title: 'My Component',
              },
              spec: {
                type: 'service',
                owner: 'me',
              },
            },
          ],
        }),
      ],
    });

    const createRes = await request(server)
      .post('/api/proxy-viewer/endpoints')
      .send({ title: 'My Todo', entityRef: 'component:default/my-component' });

    expect(createRes.status).toBe(201);
    expect(createRes.body).toEqual({
      id: expect.any(String),
      title: '[My Component] My Todo',
      createdBy: mockCredentials.user().principal.userEntityRef,
      createdAt: expect.any(String),
    });
  });

  it('should forward errors from the TodoListService', async () => {
    const { server } = await startTestBackend({
      features: [proxyViewerPlugin],
    });

    const createRes = await request(server)
      .post('/api/proxy-viewer/endpoints')
      .send({ title: 'My Todo', entityRef: 'component:default/my-component' });
    expect(createRes.status).toBe(409);
    expect(createRes.body).toMatchObject({
      error: { name: 'ConflictError' },
    });

    const listRes = await request(server).get('/api/proxy-viewer/endpoints');
    expect(listRes.status).toBe(401);
    expect(listRes.body).toMatchObject({
      error: { name: 'AuthenticationError' },
    });

    const getRes = await request(server).get('/api/proxy-viewer/endpoints/123');
    expect(getRes.status).toBe(403);
    expect(getRes.body).toMatchObject({
      error: { name: 'NotAllowedError' },
    });
  });
});
