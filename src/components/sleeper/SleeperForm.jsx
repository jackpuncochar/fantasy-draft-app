import React, { useState, useEffect } from 'react';
import useStore from '../../store/Store';
import { fetchUserId, fetchLeagues, fetchLeagueData } from '../../hooks/useFetchSleeperData';
import { useNavigate } from 'react-router-dom';

const LeagueForm = () => {
  const [username, setUsername] = useState('');
  const [year, setYear] = useState('2020');
  const [leagues, setLeagues] = useState([]);
  const [savedUsernames, setSavedUsernames] = useState([]);
  const { setSelectedLeague, setLeagueUsers, setDraftData, setMainUser } = useStore();

  const navigate = useNavigate();

  useEffect(() => {
    const storedUsernames = JSON.parse(localStorage.getItem('usernames')) || [];
    setSavedUsernames(storedUsernames);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = await fetchUserId(username);
      setMainUser(userId);
      const leaguesData = await fetchLeagues(userId, year);
      setLeagues(leaguesData);

      // Save username to localStorage
      const storedUsernames = JSON.parse(localStorage.getItem('usernames')) || [];
      if (!storedUsernames.includes(username)) {
        const updatedUsernames = [...storedUsernames, username];
        localStorage.setItem('usernames', JSON.stringify(updatedUsernames));
        setSavedUsernames(updatedUsernames);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLeagueSelect = async (league) => {
    setSelectedLeague(league);

    try {
      const { users, draft } = await fetchLeagueData(league.league_id, league.draft_id);
      setLeagueUsers(users);
      setDraftData(draft);
      navigate('/sleeper/draft');
    } catch (error) {
      console.error('Error fetching league data:', error);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => (2020 + i).toString());

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <select value={username} onChange={(e) => setUsername(e.target.value)}>
          <option value="">Select a username</option>
          {savedUsernames.map((savedUsername) => (
            <option key={savedUsername} value={savedUsername}>
              {savedUsername}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
        />
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <button type="submit">Submit</button>
      </form>

      {leagues.length > 0 && (
        <div>
          <h2>Select a League:</h2>
          <ul>
            {leagues.map((league) => (
              <li key={league.league_id}>
                <button onClick={() => handleLeagueSelect(league)}>
                  {league.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LeagueForm;