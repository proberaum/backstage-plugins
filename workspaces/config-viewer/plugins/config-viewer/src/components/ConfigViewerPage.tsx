import { HeaderPage, Container } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

import { configViewerTranslationRef } from '../translations';

import { ConfigViewerContent } from './ConfigViewerContent';

export const ConfigViewerPage = () => {
  const { t } = useTranslationRef(configViewerTranslationRef);
  const pageTitle = t('page.title');

  return (
    <>
      <HeaderPage title={pageTitle} />
      <Container>
        <ConfigViewerContent />
      </Container>
    </>
  );
};
