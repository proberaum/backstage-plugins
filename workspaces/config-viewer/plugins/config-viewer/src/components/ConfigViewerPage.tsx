import { useMemo } from 'react';
import { Container, HeaderTab, PluginHeader } from '@backstage/ui';
import { useRouteRef, useTranslationRef } from '@backstage/frontend-plugin-api';

import { useFiles } from '../hooks/useFiles';
import { fileRouteRef, rootRouteRef } from '../routes';
import { configViewerTranslationRef } from '../translations';
import { ConfigViewerContent } from './ConfigViewerContent';
import { Icon } from './Icon';

export const ConfigViewerPage = () => {
  const { t } = useTranslationRef(configViewerTranslationRef);
  const pageTitle = t('page.title');

  const files = useFiles();

  const rootRouteFn = useRouteRef(rootRouteRef)!;
  const fileRouteFn = useRouteRef(fileRouteRef)!;

  const tabs = useMemo(() => {
    const tabs: HeaderTab[] = [
      {
        id: '__frontend__',
        label: 'Frontend config',
        href: rootRouteFn(),
      },
      // TODO:
      // {
      //   id: '__backend__',
      //   label: 'Full backend config',
      //   href: rootRouteFn(),
      // },
    ];
    files?.forEach((file) => tabs.push({
      id: file,
      label: file,
      href: fileRouteFn({ file }),
    }));
    return tabs;
  }, [files])

  return (
    <>
      <PluginHeader
        icon={<Icon />}
        title={pageTitle}
        tabs={tabs}
      />
      <Container>
        <ConfigViewerContent />
      </Container>
    </>
  );
};
