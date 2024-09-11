import React, { useEffect, useState, useMemo } from 'react';
import useStore from '../../store/Store';
import '../../index.css';

const TeamView = () => {
  const { 
    leagueUsers, 
    draftPicks, 
    draftData, 
    getDraftPickStats, 
    mainUser,
    getPlayerAdp,
    getPlayerRank,
    getPlayerAuctionValue,
    draftType } = useStore();
  
  // State to track the selected user's ID
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Set main user as the selected user on component mount
  useEffect(() => {
    if (mainUser) {
      setSelectedUserId(mainUser.user_id);
    }
  }, [mainUser]);

  const rosterSlots = useMemo(() => {
    if (!draftData) return null;
    const { slots_bn, slots_flex, slots_qb, slots_rb, slots_te, slots_wr } = draftData.settings;
    return [
      ...Array(slots_qb).fill('QB'),
      ...Array(slots_rb).fill('RB'),
      ...Array(slots_wr).fill('WR'),
      ...Array(slots_te).fill('TE'),
      ...Array(slots_flex).fill('FLEX'),
      ...Array(slots_bn).fill('BN'),
    ];
  }, [draftData]);

  const userPicks = useMemo(() => {
    if (!selectedUserId || !draftPicks) return [];
    return draftPicks.filter(pick => pick.picked_by === selectedUserId);
  }, [selectedUserId, draftPicks]);

  // Create a map of pick IDs to overall pick numbers
  const pickNumberMap = useMemo(() => {
    const map = {};
    draftPicks.forEach((pick, index) => {
      map[pick.player_id] = index + 1;
    });
    return map;
  }, [draftPicks]);

  const renderRoster = () => {
    if (!rosterSlots || userPicks.length === 0) return null;

    const filledSlots = new Set();

    const isValidForSlot = (pick, slot) => {
      if (filledSlots.has(pick.player_id)) return false;
      
      switch (slot) {
        case 'QB': return pick.metadata.position === 'QB';
        case 'RB': return pick.metadata.position === 'RB';
        case 'WR': return pick.metadata.position === 'WR';
        case 'TE': return pick.metadata.position === 'TE';
        case 'FLEX': return ['RB', 'WR', 'TE'].includes(pick.metadata.position);
        case 'BN': return true;
        default: return false;
      }
    };

    let totalAdpDiff = 0;
    let totalRankDiff = 0;

    const rosterRows = rosterSlots.map((slot, index) => {
      const pick = userPicks.find(p => isValidForSlot(p, slot));
      const overallPickNumber = pick ? pickNumberMap[pick.player_id] || '' : '';

      const adp = pick ? getPlayerAdp(`${pick.metadata.first_name} ${pick.metadata.last_name}`) : '';
      const rank = pick ? getPlayerRank(`${pick.metadata.first_name} ${pick.metadata.last_name}`) : '';
      const auctionValue = pick ? getPlayerAuctionValue(`${pick.metadata.first_name} ${pick.metadata.last_name}`) : '';
      let stats = { adpDiff: 0, rankDiff: 0 };

      if (pick) {
        filledSlots.add(pick.player_id);
        stats = getDraftPickStats(pick.player_id);
        totalAdpDiff += isNaN(stats.adpDiff) ? 0 : stats.adpDiff;
        totalRankDiff += stats.rankDiff;
        console.log(`Pick ID: ${pick.player_id} - ADP Diff: ${stats.adpDiff}, Rank Diff: ${stats.rankDiff}`);
      }

      // Render differently based on draft type
      return draftType === 'auction' ? (
        <tr key={index}>
          <td className="slot-name">{slot}</td>
          <td className="player-name-full">
            {pick ? (
              <>
                {pick.metadata.first_name} {pick.metadata.last_name} ({pick.metadata.team || 'FA'})
              </>
            ) : ''}
          </td>
          <td>{pick ? auctionValue : ''}</td>
          <td>{pick ? pick.metadata.amount : ''}</td>
        </tr>
      ) : (
        <tr key={index}>
          <td className="slot-name">{slot}</td>
          <td className="player-name-full">
            {pick ? (
              <>
                {pick.metadata.first_name} {pick.metadata.last_name} ({pick.metadata.team || 'FA'})
              </>
            ) : ''}
          </td>
          <td>{overallPickNumber}</td>
          <td>{adp ? (isNaN(adp) ? '300' : adp) : ''}</td>
          <td>{rank}</td>
          <td>{pick ? (isNaN(stats.adpDiff) ? '10000' : stats.adpDiff) : ''}</td>
          <td>{pick ? stats.rankDiff : ''}</td>
        </tr>
      );
    });

    return (
      <>
        <table className="roster-table">
          <thead>
            <tr>
              <th>Position</th>
              <th>Player</th>
              {draftType === 'auction' ? (
                <>
                  <th>Predicted Value</th>
                  <th>Actual Bid</th>
                </>
              ) : (
                <>
                  <th>Pick</th>
                  <th>ADP</th>
                  <th>Rank</th>
                  <th>ADP Diff</th>
                  <th>Rank Diff</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rosterRows}
            {draftType !== 'auction' && (
              <tr className="totals-row">
                <td colSpan="5" className="totals-label">Value Totals</td>
                <td>{totalAdpDiff}</td>
                <td>{totalRankDiff}</td>
              </tr>
            )}
          </tbody>
        </table>
      </>
    );
  };

  return (
    <div className="team-view">
      <div className="user-list">
        {leagueUsers && leagueUsers.map(user => (
          <button
            key={user.user_id}
            onClick={() => {
              setSelectedUserId(user.user_id);
            }}
            className={selectedUserId === user.user_id ? 'selected' : ''}
          >
            {user.display_name}
          </button>
        ))}
      </div>
      {selectedUserId && (
        <>
          <div className="user-roster">
            {renderRoster()}
          </div>
        </>
      )}
    </div>
  );
};

export default TeamView;