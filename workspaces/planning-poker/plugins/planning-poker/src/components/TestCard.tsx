import React from 'react';
import { InfoCard, Avatar } from '@backstage/core-components';

import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';

const votes = [
  {
    userId: 'alice',
    displayName: 'Alice',
    voted: 0,
  },
  {
    userId: 'bob',
    displayName: 'Bob',
    voted: 3,
  },
  {
    userId: 'charles',
    displayName: 'Charles',
    voted: 1,
  },
  {
    userId: 'daniel',
    displayName: 'Daniel',
    voted: 5,
  },
];

export const TestCard = () => {
  const [resolved, setResolved] = React.useState(false);

  const sortedVotes = React.useMemo(() => {
    if (resolved) {
      return [...votes].sort((a, b) => {
        if (!a.voted) return 1;
        if (!b.voted) return -1;
        return a.voted - b.voted;
      });
    }
    return [...votes];
  }, [resolved]);

  return (
    <InfoCard title="Story 1234">

      <div style={{ height: '50px' }}>
        {sortedVotes.map((vote, index) => (
          <div
            key={vote.userId}
            style={{
              position: 'absolute',
              transition: 'all 3000ms ease-in-out',
              transform: `translate(${index * 80}px)`,
              opacity: resolved && !vote.voted ? 0.5 : 1,
            }}
          >
            <Tooltip title={vote.displayName}>
              <div>
                <Badge
                  badgeContent={
                    resolved ?
                      (vote.voted ? vote.voted : ' ') :
                      ' '
                  }
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  overlap="circular"
                  color={vote.voted ? 'success' : resolved ? 'error' : 'warning'}
                  slotProps={{
                    badge: {
                      style: {
                        transition: 'all 300ms ease-in-out',
                        width: resolved && vote.voted ? '36px' : undefined,
                        height: resolved && vote.voted ? '36px' : undefined,
                        borderRadius: '50%',
                        fontSize: resolved ? '22px' : undefined,
                      },
                    }
                  }}
                >
                  <Avatar displayName={vote.displayName} />
                </Badge>
              </div>
            </Tooltip>
          </div>
        ))}
      </div>

      <br/><br/>

      <Button
        color="primary"
        variant="contained"
        onClick={() => setResolved(!resolved)}
      >
        {resolved ? 'Unreveal' : 'Reveal'}
      </Button>

      <br/><br/>

      <ButtonGroup color="primary" variant="contained" size="large">
        <Button>timer +10 sec</Button>
        <Button>start / pause</Button>
        <Button>clear</Button>
      </ButtonGroup>

      <br/><br/>

      <ButtonGroup color="primary" variant="contained" size="large">
        <Button>1</Button>
        <Button>2</Button>
        <Button>3</Button>
        <Button>5</Button>
        <Button>Clear</Button>
      </ButtonGroup>

    </InfoCard>
  );
}
