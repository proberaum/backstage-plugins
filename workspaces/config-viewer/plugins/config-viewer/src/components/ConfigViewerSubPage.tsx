import { Container } from '@backstage/ui';

import { ConfigViewerContent } from './ConfigViewerContent';
import { ConfigViewerFilesTabList } from './ConfigViewerTabList';

export const ConfigViewerSubPage = () => {
  return (
    <Container mt="4">
      <ConfigViewerFilesTabList />
      <ConfigViewerContent />
    </Container>
  );
};
