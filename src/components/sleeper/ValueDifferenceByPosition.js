// src/components/ValueDifferenceByPosition.js

import React, { useMemo } from 'react';
import useStore from '../../store/Store';
import '../../index.css';

const ValueDifferenceByPosition = () => {
  const { draftPicks, getPlayerAuctionValue } = useStore();

  const valueDifferenceByPosition = useMemo(() => {
    if (!draftPicks) return {};

    const positionStats = {};

    draftPicks.forEach(pick => {
      if (pick.metadata && pick.metadata.amount !== undefined) {
        const position = pick.metadata.position;
        const currentBid = pick.metadata.amount;
        const adjustedValue = parseFloat(getPlayerAuctionValue(`${pick.metadata.first_name} ${pick.metadata.last_name}`)) || 0;
        const valueDifference = adjustedValue - currentBid;

        if (!positionStats[position]) {
          positionStats[position] = { totalDifference: 0, count: 0 };
        }

        positionStats[position].totalDifference += valueDifference;
        positionStats[position].count += 1;
      }
    });

    return positionStats;
  }, [draftPicks, getPlayerAuctionValue]);

  return (
    <div className="value-by-position">
      <h2 style={{ textAlign: 'center', margin:'12px 0' }}>Value Difference by Position (All Teams)</h2>
      <table className="table-center">
        <thead>
          <tr>
            <th>Position</th>
            <th>Total Value Difference</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(valueDifferenceByPosition).map(([position, stats]) => (
            <tr key={position}>
              <td>{position}</td>
              <td>{stats.totalDifference}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ValueDifferenceByPosition;
