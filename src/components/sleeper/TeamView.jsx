import React, { useState, useMemo } from 'react';
import useStore from '../../store/Store';

const TeamView = () => {
  const { leagueUsers, draftPicks, draftData, getDraftPickStats } = useStore();
  const [selectedUserId, setSelectedUserId] = useState(null);

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

    const rosterElements = rosterSlots.map((slot, index) => {
      const pick = userPicks.find(p => isValidForSlot(p, slot));

      let stats = { adpDiff: 0, rankDiff: 0 };
      if (pick) {
        filledSlots.add(pick.player_id);
        stats = getDraftPickStats(pick.player_id);
        totalAdpDiff += stats.adpDiff;
        totalRankDiff += stats.rankDiff;
      }

      return (
        <div key={index} className="roster-slot">
          <span className="slot-name">{slot}:</span>
          {pick ? (
            <span className="player-name">
              {pick.metadata.first_name} {pick.metadata.last_name} ({pick.metadata.position} - {pick.metadata.team || 'FA'})
              {' (ADP Diff: '}{stats.adpDiff.toFixed(2)}{', Rank Diff: '}{stats.rankDiff}{')'}
            </span>
          ) : (
            <span className="empty-slot">Empty</span>
          )}
        </div>
      );
    });

    return (
      <>
        {rosterElements}
        <div className="team-stats">
          <h4>Team Statistics</h4>
          <p>Total ADP Difference: {totalAdpDiff.toFixed(1)}</p>
          <p>Total Rank Difference: {totalRankDiff}</p>
        </div>
      </>
    );
  };

  return (
    <div className="team-view">
      <div className="user-list">
        <h3>Select a Team:</h3>
        {leagueUsers && leagueUsers.map(user => (
          <button
            key={user.user_id}
            onClick={() => setSelectedUserId(user.user_id)}
            className={selectedUserId === user.user_id ? 'selected' : ''}
          >
            {user.display_name}
          </button>
        ))}
      </div>
      {selectedUserId && (
        <div className="user-roster">
          <h3>{leagueUsers.find(u => u.user_id === selectedUserId)?.display_name}'s Roster</h3>
          {renderRoster()}
        </div>
      )}
    </div>
  );
};

export default TeamView;