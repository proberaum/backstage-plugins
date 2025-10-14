import { createDevApp } from '@backstage/dev-utils';

import { Page, Header, TabbedLayout } from '@backstage/core-components';

import { analyticsModuleBrowserLogPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(analyticsModuleBrowserLogPlugin)
  .addPage({
    element: (
      <Page themeId="home">
        <Header title="Test page" />
        <TabbedLayout>
          <TabbedLayout.Route path="/one" title="First tab">
            <p>First tab content</p>
          </TabbedLayout.Route>
          <TabbedLayout.Route path="/two" title="Second tab">
            <p>Second tab content</p>
          </TabbedLayout.Route>
          <TabbedLayout.Route path="/three" title="Third tab">
            <p>Third tab content</p>
          </TabbedLayout.Route>
        </TabbedLayout>
      </Page>
    ),
    title: 'Test Page',
    path: '/test-page',
  })
  .render();
