import playerData from '../DB/PlayerData.json';
import playerRanks from '../DB/2qb.json'

import { create } from 'zustand';

const useStore = create((set, get) => ({
  mainUser: null,
  selectedLeague: null,
  leagueUsers: null,
  draftData: null,
  draftPicks: null,
  playerData: playerData,
  playerRanks: playerRanks,
  draftPickStats: {}, // New field to store ADP and Rank diff for each pick
  setMainUser: (user) => set({ mainUser: user }),
  setSelectedLeague: (league) => set({ selectedLeague: league }),
  setLeagueUsers: (users) => set({ leagueUsers: users }),
  setDraftData: (data) => set({ draftData: data }),
  setDraftPicks: (picks) => set({ draftPicks: picks }),
  addDraftPickStat: (pickId, stats) => set(state => ({
    draftPickStats: {
      ...state.draftPickStats,
      [pickId]: stats
    }
  })),
  getDraftPickStats: (pickId) => get().draftPickStats[pickId] || { adpDiff: 0, rankDiff: 0 },
}));

export default useStore;