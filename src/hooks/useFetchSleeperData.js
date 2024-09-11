// api.js
import axios from 'axios';

// Fetch user_id from username
export const fetchUserId = async (username) => {
  try {
    const response = await axios.get(`https://api.sleeper.app/v1/user/${username}`);
    return response.data.user_id;
  } catch (error) {
    console.error('Error fetching user_id:', error);
    throw error;
  }
};

// Fetch leagues using user_id
export const fetchLeagues = async (userId, year) => {
  try {
    const response = await axios.get(`https://api.sleeper.app/v1/user/${userId}/leagues/nfl/${year}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching leagues:', error);
    throw error;
  }
};

// Fetch league data and draft data
export const fetchLeagueData = async (leagueId, draftId) => {
  try {
    const [usersResponse, draftResponse] = await Promise.all([
      axios.get(`https://api.sleeper.app/v1/league/${leagueId}/users`),
      axios.get(`https://api.sleeper.app/v1/draft/${draftId}`)
    ]);

    // console.log(usersResponse)
    // console.log(draftResponse)
    return {
      users: usersResponse.data,
      draft: draftResponse.data
    };
  } catch (error) {
    console.error('Error fetching league data:', error);
    throw error;
  }
};

export const fetchDraftPicks = async (draftId) => {
  try {
    const response = await axios.get(`https://api.sleeper.app/v1/draft/${draftId}/picks`);
    console.log('run');
    return response.data;
  } catch (error) {
    // console.error('Error fetching draft picks:', error);
    throw error;
  }
};

// Fetch auction-specific data
export const fetchAuctionData = async (draftId) => {
  try {
    const response = await axios.get(`https://api.sleeper.app/v1/draft/${draftId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching auction data:', error);
    throw error;
  }
};