import { Avatar, InfoCard } from '@backstage/core-components';

import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';

import Autocomplete from '@mui/material/Autocomplete';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';

import DeleteIcon from '@mui/icons-material/Delete';

import { useQuery } from '@tanstack/react-query';
import React from 'react';

export const ConfigCard = () => {
  const [selectedUsers, setSelectedUsers] = React.useState<Entity[]>([]);
  const [search, setSearch] = React.useState('');
  const catalogApi = useApi(catalogApiRef);

  const usersQuery = useQuery({
    queryKey: ['users', search],
    queryFn: () =>
      catalogApi.queryEntities({
        filter: {
          kind: 'User',
        },
        fullTextFilter: {
          term: search,
        },
        orderFields: {
          field: 'metadata.name',
          order: 'asc',
        },
      }),
  });

  const users = usersQuery.data?.items || [];

  return (
    <InfoCard title="Config">
      <Autocomplete
        value={null}
        inputValue={search}
        onInputChange={(_event, value) => setSearch(value)}
        onChange={(_event, value, _reason) => {
          setSearch('');
          if (value) {
            const selectedValueRef = stringifyEntityRef(value);
            if (
              !selectedUsers.some(
                u => stringifyEntityRef(u) === selectedValueRef,
              )
            ) {
              setSelectedUsers([...selectedUsers, value]);
            }
          }
        }}
        renderInput={params => (
          <TextField {...params} label="Search users..." />
        )}
        loading={usersQuery.isLoading}
        options={users}
        noOptionsText="No user found"
        getOptionKey={stringifyEntityRef}
        getOptionLabel={entity => entity.metadata.name} // TODO: profile displayName
        sx={{ width: 300 }}
        disablePortal
      />

      <br />
      <br />

      <div style={{ height: '50px' }}>
        {selectedUsers.map((user, index) => (
          <div
            key={stringifyEntityRef(user)}
            style={{
              position: 'absolute',
              transform: `translate(${index * 80}px)`,
            }}
          >
            <Badge
              badgeContent={
                <IconButton
                  color="error"
                  onClick={() => {
                    setSelectedUsers(selectedUsers.filter(u => u !== user));
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              }
              overlap="circular"
            >
              <Avatar displayName={user.metadata.name} />
            </Badge>
          </div>
        ))}
      </div>

      <br />
      <br />
    </InfoCard>
  );
};
