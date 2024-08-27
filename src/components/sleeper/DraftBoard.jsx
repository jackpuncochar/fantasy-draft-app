import React, { useState, useEffect } from 'react';
import useStore from '../../store/Store';
import { fetchDraftPicks } from '../../hooks/useFetchSleeperData';
import DraftBoardTable from './DraftBoardTable';
import SleeperList from './SleeperList';
import TeamView from './TeamView';

const DraftBoard = () => {
  const { draftData, setDraftPicks, addDraftPickStat, playerRanks } = useStore();
  const [isLiveUpdating, setIsLiveUpdating] = useState(false);
  const [activeView, setActiveView] = useState('board');

  useEffect(() => {
    let interval;
    if (isLiveUpdating) {
      interval = setInterval(async () => {
        try {
          const picks = await fetchDraftPicks(draftData.draft_id);
          setDraftPicks(picks);
          
        
          picks.forEach((pick, index) => {
            const playerName = `${pick.metadata.first_name} ${pick.metadata.last_name}`;
            const playerRank = playerRanks["Fantasy Pros 2 QB Rankings"].find(p => p.Player === playerName);
            if (playerRank) {
              const pickNumber = index + 1;
              const adpDiff = pickNumber - parseFloat(playerRank.ADP);
              const rankDiff = pickNumber - parseInt(playerRank.Rank);
              addDraftPickStat(pick.player_id, { adpDiff, rankDiff });
            }
          });
        } catch (error) {
          console.error('Error fetching draft picks:', error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLiveUpdating, draftData, setDraftPicks, addDraftPickStat, playerRanks]);

  if (!draftData) {
    return <div>return home</div>;
  }

  const toggleLiveUpdates = () => {
    setIsLiveUpdating(!isLiveUpdating);
  };

  const toggleView = (view) => {
    setActiveView(activeView === view ? null : view);
  };

  return (
    <div>
      <header className='draft-header'>
        <h1>{draftData.metadata.name} {draftData.season} Draft</h1>
        <p>Number of Teams: {draftData.settings.teams}</p>
        <p>Scoring Type: {draftData.metadata.scoring_type}</p>
        <p>Draft Type: {draftData.type}</p>
        <p>Start Time: {new Date(draftData.start_time).toLocaleString()}</p>
        <p>Status: {draftData.status}</p>
      </header>

      <button onClick={toggleLiveUpdates}>
        {isLiveUpdating ? 'Stop Live Updates' : 'Start Live Updates'}
      </button>

      <button onClick={() => toggleView('board')}>
        {activeView === 'board' ? 'Hide Draft Board' : 'Show Draft Board'}
      </button>

      <button onClick={() => toggleView('teams')}>
        {activeView === 'teams' ? 'Hide Team View' : 'Show Team View'}
      </button>

      {activeView === 'board' && <DraftBoardTable />}
      {activeView === 'teams' && <TeamView />}
      <SleeperList/>
    </div>
  );
};

export default DraftBoard;