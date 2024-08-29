import React, { useState } from 'react';
import useStore from '../../store/Store';
import DraftBoardCard from './DraftBoardCard';

const positionColors = {
  QB: '#ee8cb2',  // sleeper red
  RB: '#a1f1d3',  // sleeper green
  WR: '#73d0f8',  // sleeper blue
  TE: '#fabb78',  // sleeper orange
  K: '#ff99ff',   // Light magenta
  DEF: '#99ffff', // Light cyan
};

const DraftBoardTable = ({ toggleView }) => {
  const { draftData, draftPicks, leagueUsers } = useStore();
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  if (!draftData || !draftPicks || !leagueUsers) {
    return <div>Start Live Updates to see the draft board.</div>;
  }

  const numRounds = draftData.settings.rounds;

  // Create an array of user IDs sorted by their draft order
  const sortedUserIds = Object.entries(draftData.draft_order)
    .sort(([, numA], [, numB]) => numA - numB) // Sort by the draft order number
    .map(([userId]) => userId); // Extract the user_id from the sorted array

  const getPickForUserInRound = (userId, round) => {
    return draftPicks.find(pick => pick.round === round && pick.roster_id === draftData.slot_to_roster_id[draftData.draft_order[userId]]);
  };

  return (
    // <div className="page-container">
        <div className="draft-board-container">
          <button 
            className="close-draft-board-button" 
            onClick={() => toggleView('board')}
          >
            X
          </button>
          <table className="draft-board-table">
            <thead>
              <tr>
                <th>Round</th>
                {sortedUserIds.map(userId => (
                  <th key={userId}>{leagueUsers.find(u => u.user_id === userId)?.display_name || 'Unknown'}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: numRounds }, (_, roundIndex) => (
                <tr key={roundIndex}>
                  <td>{roundIndex + 1}</td>
                  {sortedUserIds.map(userId => {
                    const draftPick = getPickForUserInRound(userId, roundIndex + 1);
                    const backgroundColor = draftPick ? positionColors[draftPick.metadata.position] || '#fafafa' : '#fafafa';
                    return (
                      <td 
                        key={userId}
                        className="draft-cell"
                        style={{ backgroundColor }}
                        onClick={() => setSelectedPlayerId(draftPick?.player_id)}
                      >
                        {draftPick ? (
                          <>
                            <span className="pick-number">{draftPick.pick_no}</span>
                            <div className="player-info">
                              <div className="player-name">
                                {draftPick.metadata.first_name.charAt(0)}. {draftPick.metadata.last_name}
                              </div>
                              <div className="player-team-position">
                                {draftPick.metadata.position} - {draftPick.metadata.team || 'FA'}
                              </div>
                            </div>
                            {selectedPlayerId === draftPick.player_id && (
                              <DraftBoardCard playerId={draftPick.player_id} />
                            )}
                          </>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    // </div>
  );
};

export default DraftBoardTable;
