
import React from 'react';
import useStore from '../../store/Store';



const DraftBoardCard = ({ playerId }) => {
  const { playerData } = useStore();

  if (!playerData || !playerData[playerId]) {
    return <div>Player not found</div>;
  }

  const player = playerData[playerId];

  return (
    <div className="draft-board-card">
      <p>Age: {player.age}</p>
      <p>Height: {player.height}"</p>
      <p>Weight: {player.weight} lbs</p>
      <p>College: {player.college}</p>
      <p>Experience: {player.years_exp} years</p>
    </div>
  );
};

export default DraftBoardCard;