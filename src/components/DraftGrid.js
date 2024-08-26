import React from 'react';
import './DraftGrid.css';

const DraftGrid = ({ teams, rounds, selectedSquare, currentPick, myTeamIndex, onSquareSelect, onRemovePlayer }) => {
    // Calculate the current pick row and column
    const currentPickRow = Math.floor((currentPick - 1) / teams.length);
    const currentPickColumn = (currentPick - 1) % teams.length;
  
    return (
      <div className="draft-grid">
        <table>
          <thead>
            <tr>
              <th>Round</th>
              {teams.map((_, index) => (
                <th key={index}>
                    {index === myTeamIndex ? 'My Team' : `Team ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rounds }).map((_, roundIndex) => (
              <tr key={roundIndex}>
                <td>{roundIndex + 1}</td>
                {teams.map((team, teamIndex) => {
                  // Determine if the cell is the current pick
                  const isCurrentPick = roundIndex === currentPickRow && (
                    roundIndex % 2 === 0
                      ? teamIndex === currentPickColumn
                      : teamIndex === teams.length - 1 - currentPickColumn
                  );
                  
                  // Determine if the cell is selected
                  const isSelected = selectedSquare && selectedSquare.teamIndex === teamIndex && selectedSquare.roundIndex === roundIndex;
  
                  return (
                    <td
                      key={teamIndex}
                      className={`grid-cell ${isSelected ? 'selected' : ''} ${isCurrentPick ? 'current-pick' : ''}`}
                      onClick={() => onSquareSelect({ teamIndex, roundIndex })}
                    >
                      {team[roundIndex] ? (
                        <div className="player-entry">
                          <span>{team[roundIndex].name}</span>
                          <button onClick={(e) => {
                            e.stopPropagation();
                            onRemovePlayer(teamIndex, roundIndex);
                          }}>
                            x
                          </button>
                        </div>
                      ) : (
                        <span>--</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  

export default DraftGrid;

