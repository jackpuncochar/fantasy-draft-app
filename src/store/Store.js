import playerData from '../DB/PlayerData.json';
import playerRanks from '../DB/2qb.json';
// import playerRanks from '../DB/test.json';

import { create } from 'zustand';

const useStore = create((set, get) => ({
  mainUser: null,
  selectedLeague: null,
  leagueUsers: null,
  draftData: null,
  draftPicks: null,
  playerData: playerData,
  playerRanks: playerRanks["Fantasy Pros 2 QB Rankings"],
  draftPickStats: {}, // New field to store ADP and Rank diff for each pick
  setMainUser: (user) => set({ mainUser: user }),
  setSelectedLeague: (league) => set({ selectedLeague: league }),
  setLeagueUsers: (users) => set({ leagueUsers: users }),
  setDraftData: (data) => set({ draftData: data }),
  setDraftPicks: (picks) => set({ draftPicks: picks }),
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
  }
}));

export default useStore;