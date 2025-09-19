import { Page, Header, Content } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

import { configViewerTranslationRef } from '../translations';

import { ConfigViewerContent } from './ConfigViewerContent';

export const ConfigViewerPage = () => {
  const { t } = useTranslationRef(configViewerTranslationRef);

  return (
    <Page themeId="tool">
      <Header title={t('page.title')} />
      <Content>
        <ConfigViewerContent />
      </Content>
    </Page>
  );
};
