import { HeaderPage, Container } from '@backstage/ui';

import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

import { envViewerTranslationRef } from '../translations';

import { EnvViewerContent } from './EnvViewerContent';

export const EnvViewerPage = () => {
  const { t } = useTranslationRef(envViewerTranslationRef);

  return (
    <>
      <HeaderPage title={t('page.title')} />
      <Container>
        <EnvViewerContent />
      </Container>
    </>
  );
};
