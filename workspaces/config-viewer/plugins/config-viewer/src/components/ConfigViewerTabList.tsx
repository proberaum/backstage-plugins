import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { HeaderTab, Tab, TabList, Tabs } from '@backstage/ui';

import { useFiles } from '../hooks/useFiles';
import { useQueryParamState } from '@backstage/core-components';

export const ConfigViewerFilesTabList = () => {
  const location = useLocation();

  const files = useFiles();
  const [selectedFile] = useQueryParamState<string>('filename');
  const [searchTerm] = useQueryParamState<string>('q');

  const tabs = useMemo(() => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);

    // enforce order
    searchParams.delete('q');
    searchParams.delete('filename');
    if (searchTerm) {
      searchParams.set('q', searchTerm);
    }
    const tabs: HeaderTab[] = [
      {
        id: '__frontend__',
        label: 'Frontend config',
        href: `${path}${searchParams.toString() ? '?' : ''}${searchParams}`,
      },
      // TODO:
      // {
      //   id: '__backend__',
      //   label: 'Full backend config',
      //   href: rootRouteFn(),
      // },
    ];
    files?.forEach((file) => {
      // enforce order
      searchParams.delete('q');
      searchParams.set('filename', file);
      if (searchTerm) {
        searchParams.set('q', searchTerm);
      }
      tabs.push({
        id: file,
        label: file,
        href: `${path}${searchParams.toString() ? '?' : ''}${searchParams}`,
      });
    });
    return tabs;
  }, [files, location.pathname, location.search, searchTerm])

  const selectedKey = selectedFile || tabs[0].id;
  return (
    <Tabs selectedKey={selectedKey}>
      <TabList>
        {tabs.map((tab) => (
          <Tab id={tab.id} href={tab.href}>{tab.label}</Tab>
        ))}
      </TabList>
    </Tabs>
  );
};
