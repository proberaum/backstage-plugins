import React from 'react';

import { CodeSnippet, ErrorBoundary, InfoCard } from '@backstage/core-components';
import makeStyles from '@mui/styles/makeStyles';

import {
  Layout,
  Layouts,
  Responsive,
  ResponsiveProps,
} from 'react-grid-layout';
// Removes the doubled scrollbar
import 'react-grid-layout/css/styles.css';

import useMeasure from 'react-use/lib/useMeasure';

const gridGap = 16;

const defaultProps: ResponsiveProps = {
  // Aligned with the 1.0-1.2 home page gap.
  margin: [gridGap, gridGap],
  // Same as in home-plugin CustomHomepageGrid
  rowHeight: 60,

  // We use always a 12-column grid, but each cards can define
  // their number of columns (width) and start column (x) per breakpoint.
  breakpoints: {
    xl: 1600,
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
    xxs: 0,
  },
  cols: {
    xl: 12,
    lg: 12,
    md: 12,
    sm: 12,
    xs: 12,
    xxs: 12,
  },
};

const useStyles = makeStyles({
  // Make card content scrollable (so that cards don't overlap)
  cardWrapper: {
    '& > div[class*="MuiCard-root"]': {
      width: '100%',
      height: '100%',
    },
    '& div[class*="MuiCardContent-root"]': {
      overflow: 'auto',
    },
  },
});

export const DashboardGrid = () => {
  const classes = useStyles();
  const [measureRef, measureRect] = useMeasure<HTMLDivElement>();

  let cards = [
    {
      id: '1',
    },
    {
      id: '2',
    },
    {
      id: '3',
    },
  ];

  const [currentLayout, setCurrentLayout] = React.useState<any>();
  const [allLayouts, setAllLayout] = React.useState<any>();
  const onLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
    console.log('xxx onLayoutChange', currentLayout, allLayouts)
    setCurrentLayout(currentLayout);
    setAllLayout(allLayouts);
  }

  const children = React.useMemo(() => {
    return cards.map(card => (
      <div
        key={card.id}
        data-cardid={card.id}
        data-testid={`home-page card ${card.id}`}
        // data-layout={JSON.stringify(card.layouts)}
        className={classes.cardWrapper}
      >
        <ErrorBoundary>
          <InfoCard>
            {card.id}
          </InfoCard>
        </ErrorBoundary>
      </div>
    ));
  }, [cards, classes.cardWrapper]);

  return (
    <div style={{ margin: -gridGap, marginTop: gridGap }}>
      <div ref={measureRef} />
      {measureRect.width ? (
        <Responsive
          {...defaultProps}
          width={measureRect.width}
          // layouts={layouts}
          onLayoutChange={onLayoutChange}
        >
          {children}
        </Responsive>
      ) : null}

      <CodeSnippet
        language="json"
        text={JSON.stringify(currentLayout, null, 2)}
      />
      <CodeSnippet
        language="json"
        text={JSON.stringify(allLayouts, null, 2)}
      />
    </div>
  );
}
