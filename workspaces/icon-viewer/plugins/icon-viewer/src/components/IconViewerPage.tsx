import { Page, Header, Content } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

import { iconViewerTranslationRef } from '../translations';

import { IconViewerContent } from './IconViewerContent';

export const IconViewerPage = () => {
  const { t } = useTranslationRef(iconViewerTranslationRef);

  return (
    <Page themeId="tool">
      <Header title={t('page.title')} />
      <Content>
        <IconViewerContent />
      </Content>
    </Page>
  );
};
