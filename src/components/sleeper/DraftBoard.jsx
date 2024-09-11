import React, { useState, useEffect } from 'react';
import useStore from '../../store/Store';
import { fetchDraftPicks, fetchAuctionData } from '../../hooks/useFetchSleeperData';
import DraftBoardTable from './DraftBoardTable';
import SleeperList from './SleeperList';
import TeamView from './TeamView';
import ValueDifferenceByPosition from './ValueDifferenceByPosition';

const DraftBoard = () => {
  const { draftData, setDraftPicks, setAuctionData, addDraftPickStat, setDraftType, playerRanks } = useStore();
  const [isLiveUpdating, setIsLiveUpdating] = useState(false);
  const [activeView, setActiveView] = useState('board');
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);

  useEffect(() => {
    // Set draftType in the store
    setDraftType(draftData.type);

    let interval;
    if (isLiveUpdating) {
      interval = setInterval(async () => {
        try {

          if (draftData.type === 'auction') {
            const auctionInfo = await fetchAuctionData(draftData.draft_id);
            setAuctionData(auctionInfo);
            // Assuming auctionData contains a field for the current player and current bid
            setCurrentPlayer(auctionInfo.metadata.nominated_player_id);
            setCurrentBid(auctionInfo.metadata.highest_offer);
          }

          const picks = await fetchDraftPicks(draftData.draft_id);
          setDraftPicks(picks);
        
          picks.forEach((pick, index) => {
            const playerName = `${pick.metadata.first_name} ${pick.metadata.last_name}`;
            const playerRank = playerRanks.find(p => p.Player === playerName);
            if (playerRank) {
              const pickNumber = index + 1;
              const adpDiff = pickNumber - parseFloat(playerRank.ADP);
              const rankDiff = pickNumber - parseInt(playerRank.Rank);
              addDraftPickStat(pick.player_id, { adpDiff, rankDiff });
            }
          });
        } catch (error) {
          // console.error('Error fetching draft picks:', error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLiveUpdating, draftData, setDraftPicks, setAuctionData, addDraftPickStat, playerRanks, setDraftType]);

  if (!draftData) {
    return (
      <div style={{ margin:'16px' }}>
        <p>Why did you do that? The draft data is not available, or some shit.</p>
        <a href="/">Return to home page.</a>
      </div>
    );
  }

  const toggleLiveUpdates = () => {
    setIsLiveUpdating(!isLiveUpdating);
  };

  const toggleView = (view) => {
    setActiveView(activeView === view ? null : view);
  };

  return (
    <div>
      <header className='sleeper-draft-header'>
        <h1>{draftData.metadata.name} {draftData.season} Draft</h1>
        <p>Number of Teams: {draftData.settings.teams}</p>
        <p>Scoring Type: {draftData.metadata.scoring_type}</p>
        <p>Draft Type: {draftData.type}</p>
        <p>Start Time: {new Date(draftData.start_time).toLocaleString()}</p>
        <p>Status: {draftData.status}</p>
      </header>

      <div className="button-container" style={{ 'display':'flex', justifyContent:'center' }}>
        <button 
          onClick={toggleLiveUpdates}
          className={`live-updates-button ${isLiveUpdating ? 'stop-updates' : 'start-updates'}`}
        >
          {isLiveUpdating ? 'Stop Live Updates' : 'Start Live Updates'}
        </button>

        <button 
          onClick={() => toggleView('board')}
          className={`toggle-draft-board-button ${activeView === 'board' ? 'active' : ''}`}
        >
          {activeView === 'board' ? 'Hide Draft Board' : 'Show Draft Board'}
        </button>

        <button 
          onClick={() => toggleView('teams')}
          className={`toggle-team-view-button ${activeView === 'teams' ? 'active' : ''}`}
          disabled={!isLiveUpdating}
        >
          {activeView === 'teams' ? 'Hide Team View' : 'Show Team View'}
        </button>
        {/* disable team view */}
        {!isLiveUpdating && (
        <div className="disabled-message">
            Live updates are off, Team View is disabled.
        </div>
        )}
      </div>
      
        {activeView === 'board' && (
          <DraftBoardTable 
            toggleView={toggleView}
            activeView={activeView}
          />
        )}
        {activeView === 'teams' && <TeamView />}
      <ValueDifferenceByPosition />
      <SleeperList 
        currentPlayer={currentPlayer}
        currentBid={currentBid}
      />
    </div>
  );
};

export default DraftBoard;