import { Page, Header, Content } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

import { envViewerTranslationRef } from '../translations';

import { EnvViewerContent } from './EnvViewerContent';

export const EnvViewerPage = () => {
  const { t } = useTranslationRef(envViewerTranslationRef);

  return (
    <Page themeId="tool">
      <Header title={t('page.title')} />
      <Content>
        <EnvViewerContent />
      </Content>
    </Page>
  );
};
