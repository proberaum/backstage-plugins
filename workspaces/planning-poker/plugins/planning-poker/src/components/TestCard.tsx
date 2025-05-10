import React from 'react';
import { InfoCard, Avatar } from '@backstage/core-components';

import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';

import RevealButton from './RevealButton';

type Vote = {
  userId: string;
  displayName: string;
  voted?: number;
};

type PositionedVote = Vote & {
  position: number;
}

const votes: Vote[] = [
  {
    userId: 'alice',
    displayName: 'Alice',
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

const pointingOptions = [1, 2, 3, 5, 8, 'Unknown'];

export const TestCard = () => {
  const [revealed, setRevealed] = React.useState(false);

  const canReveal = votes.some((vote) => vote.voted);

  const positionedVotes = React.useMemo<PositionedVote[]>(() => {
    if (revealed) {
      const orderedUsers = [...votes].sort((a, b) => {
        if (!a.voted) return 1;
        if (!b.voted) return -1;
        return a.voted - b.voted;
      }).map((vote) => vote.userId);

      return votes.map<PositionedVote>((vote) => ({
        ...vote,
        position: orderedUsers.indexOf(vote.userId),
      }));
    }

    return votes.map<PositionedVote>((vote, index) => ({
      ...vote,
      position: index,
    }));
  }, [revealed]);

  return (
    <InfoCard title="Story 1234">

      <div style={{ height: '50px' }}>
        {positionedVotes.map((vote) => (
          <div
            key={vote.userId}
            style={{
              position: 'absolute',
              transition: 'all 500ms ease-in-out',
              transform: `translate(${vote.position * 80}px)`,
              opacity: revealed && !vote.voted ? 0.5 : 1,
            }}
          >
            <Tooltip title={vote.displayName}>
              <div>
                <Badge
                  badgeContent={
                    revealed ?
                      (vote.voted ? vote.voted : ' ') :
                      ' '
                  }
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  overlap="circular"
                  color={vote.voted ? 'success' : revealed ? 'error' : 'warning'}
                  slotProps={{
                    badge: {
                      style: {
                        transition: 'all 300ms ease-in-out',
                        width: revealed && vote.voted ? '36px' : undefined,
                        height: revealed && vote.voted ? '36px' : undefined,
                        borderRadius: '50%',
                        fontSize: revealed ? '22px' : undefined,
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

      <ButtonGroup color="primary" variant="contained" size="large">
        {pointingOptions.map((pointingOption) => (
          <Button
            key={pointingOption}
          >
            {pointingOption}
          </Button>
        ))}
        <Button>Clear</Button>
      </ButtonGroup>

      <br/><br/>

      <Button
        color="primary"
        variant="contained"
        onClick={() => setRevealed(!revealed)}
        disabled={!canReveal && !revealed}
      >
        {revealed ? 'Unreveal' : 'Reveal'}
      </Button>

      <br/><br/>

      <RevealButton />

    </InfoCard>
  );
}
