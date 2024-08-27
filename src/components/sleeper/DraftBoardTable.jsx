import React, { useState } from 'react';
import useStore from '../../store/Store';
import DraftBoardCard from './DraftBoardCard';

const positionColors = {
  QB: '#ff9999',  // Light red
  RB: '#99ff99',  // Light green
  WR: '#9999ff',  // Light blue
  TE: '#ffff99',  // Light yellow
  K: '#ff99ff',   // Light magenta
  DEF: '#99ffff', // Light cyan
};

const DraftBoardTable = () => {
  const { draftData, draftPicks, leagueUsers } = useStore();
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  if (!draftData || !draftPicks || !leagueUsers) {
    return <div>Click to start</div>;
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
            <td>Round {roundIndex + 1}</td>
            {sortedUserIds.map(userId => {
              const draftPick = getPickForUserInRound(userId, roundIndex + 1);
              const backgroundColor = draftPick ? positionColors[draftPick.metadata.position] || '#ffffff' : '#ffffff';
              return (
                <td key={userId} style={{ backgroundColor, cursor: 'pointer' }} onClick={() => setSelectedPlayerId(draftPick?.player_id)}>
                  {draftPick ? (
                    <>
                      <span>{draftPick.pick_no}</span>
                      <div>{draftPick.metadata.first_name} {draftPick.metadata.last_name}</div>
                      <div>{draftPick.metadata.position} - {draftPick.metadata.team || 'FA'}</div>
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
  );
};

export default DraftBoardTable;
