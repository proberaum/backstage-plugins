import { Page, Header, Content } from '@backstage/core-components';

import { ConfigViewerContent } from './ConfigViewerContent';

export const ConfigViewerPage = () => {
  return (
    <Page themeId="tool">
      <Header title="Config Viewer" />
      <Content>
        <ConfigViewerContent />
      </Content>
    </Page>
  );
};
