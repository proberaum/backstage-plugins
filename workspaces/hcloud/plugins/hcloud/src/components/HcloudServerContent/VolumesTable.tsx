// plugins/hcloud/src/components/HcloudServerContent/VolumesTable.tsx
import { Table, TableColumn } from '@backstage/core-components';
import { HcloudVolume } from '@proberaum/backstage-plugin-hcloud-common';

const columns: TableColumn<HcloudVolume>[] = [
  { title: 'Name', field: 'name' },
  { title: 'Size (GB)', field: 'size', type: 'numeric' },
  { title: 'Format', field: 'format' },
  { title: 'Device', field: 'linux_device' },
];

export function VolumesTable({ volumes }: { volumes: HcloudVolume[] }) {
  if (volumes.length === 0) {
    return null;
  }

  return (
    <Table
      title="Volumes"
      options={{ search: false, paging: false, padding: 'dense' }}
      columns={columns}
      data={volumes}
    />
  );
}
