import { Page, Header, Content } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

import { configViewerTranslationRef } from '../translations';

import { ConfigViewerContent } from './ConfigViewerContent';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

export const ConfigViewerPage = () => {
  const { t } = useTranslationRef(configViewerTranslationRef);
  const appTitle = useApi(configApiRef).getOptionalString('app.title');
  const pageTitle = t('page.title');
  const pageSubtitle = appTitle
    ? t('page.subtitleWithAppTitle', { appTitle })
    : t('page.subtitleWithoutAppTitle');

  return (
    <Page themeId="tool">
      <Header title={pageTitle} subtitle={pageSubtitle} />
      <Content>
        <ConfigViewerContent />
      </Content>
    </Page>
  );
};
