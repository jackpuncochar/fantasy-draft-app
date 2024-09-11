import playerData from '../DB/PlayerData.json';
import snakePlayerRanks  from '../DB/2qb.json';
import auctionPlayerRanks  from '../DB/2qb_auction.json';
// import playerRanks from '../DB/test.json';

import { create } from 'zustand';

const useStore = create((set, get) => ({
  mainUser: null,
  selectedLeague: null,
  leagueUsers: null,
  draftType: null,
  draftData: null,
  draftPicks: null,
  auctionData: null,
  playerData: playerData,
  playerRanks: snakePlayerRanks["Fantasy Pros 2 QB Rankings"],
  draftPickStats: {}, // New field to store ADP and Rank diff for each pick
  setMainUser: (user) => set({ mainUser: user }),
  setSelectedLeague: (league) => set({ selectedLeague: league }),
  setLeagueUsers: (users) => set({ leagueUsers: users }),
  
  // Method to set draft type and update player ranks accordingly
  setDraftType: (type) => {
    // Update playerRanks based on draft type
    const updatedPlayerRanks = type === 'auction' 
      ? auctionPlayerRanks["Fantasy Pros 2 QB Rankings"]
      : snakePlayerRanks["Fantasy Pros 2 QB Rankings"];
    // Ensure playerRanks is properly set
    if (updatedPlayerRanks) {
      set({ draftType: type, playerRanks: updatedPlayerRanks });
    } else {
      console.error('Failed to load player rankings for type:', type);
    }
  },

  setDraftData: (data) => set({ draftData: data }),
  setDraftPicks: (picks) => set({ draftPicks: picks }),
  setAuctionData: (auctionInfo) => set({ auctionData: auctionInfo }),
  addDraftPickStat: (pickId, stats) => {
    // Set ADP to 200 if it is null
    const adjustedStats = {
      ...stats,
      adpDiff: stats.adpDiff === null ? 200 : stats.adpDiff
  };
    
    set(state => ({
      draftPickStats: {
        ...state.draftPickStats,
        [pickId]: adjustedStats
      }
    }));
  },
  getDraftPickStats: (pickId) => {
    const stats = get().draftPickStats[pickId] || { adpDiff: 0, rankDiff: 0 };
    return stats;
  },

  // Helper methods to get player ADP and Rank from playerRanks
  getPlayerAdp: (playerName) => {
    const playerRank = get().playerRanks.find(p => p.Player === playerName);
    return playerRank ? parseFloat(playerRank.ADP) : null;
  },
  getPlayerRank: (playerName) => {
    const playerRank = get().playerRanks.find(p => p.Player === playerName);
    return playerRank ? parseInt(playerRank.Rank) : null;
  },

  getPlayerAuctionValue: (playerName) => {
    const playerRank = get().playerRanks.find(p => p.Player === playerName);
    return playerRank ? parseInt(playerRank['Adjusted Value']) : null;
  },
}));

export default useStore;