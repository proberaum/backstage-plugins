import { HeaderPage, Container } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

import { proxyViewerTranslationRef } from '../translations';

import { ProxyViewerContent } from './ProxyViewerContent';

export const ProxyViewerPage = () => {
  const { t } = useTranslationRef(proxyViewerTranslationRef);

  return (
    <>
      <HeaderPage title={t('page.title')} />
      <Container>
        <ProxyViewerContent />
      </Container>
    </>
  );
};
