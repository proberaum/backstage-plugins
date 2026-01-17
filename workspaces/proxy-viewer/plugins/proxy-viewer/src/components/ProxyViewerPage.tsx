import { Page, Header, Content } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

import { proxyViewerTranslationRef } from '../translations';

import { ProxyViewerContent } from './ProxyViewerContent';

export const ProxyViewerPage = () => {
  const { t } = useTranslationRef(proxyViewerTranslationRef);

  return (
    <Page themeId="tool">
      <Header title={t('page.title')} />
      <Content>
        <ProxyViewerContent />
      </Content>
    </Page>
  );
};
