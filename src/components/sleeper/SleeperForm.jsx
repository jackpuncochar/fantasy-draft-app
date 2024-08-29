import React, { useState, useEffect } from 'react';
import useStore from '../../store/Store';
import { fetchUserId, fetchLeagues, fetchLeagueData } from '../../hooks/useFetchSleeperData';
import { useNavigate } from 'react-router-dom';
import { FaCaretDown } from 'react-icons/fa'; // Import an icon for dropdown
import '../../index.css'

const LeagueForm = () => {
  const [username, setUsername] = useState('');
  const [year, setYear] = useState('2024');
  const [isPreviousYear, setIsPreviousYear] = useState(false); // user has option to view drafts from previous years, but want to highlight current year
  const [leagues, setLeagues] = useState([]);
  const [savedUsernames, setSavedUsernames] = useState([]);
  const [filteredUsernames, setFilteredUsernames] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { setSelectedLeague, setLeagueUsers, setDraftData, setMainUser } = useStore();

  const navigate = useNavigate();

  useEffect(() => {
    const storedUsernames = JSON.parse(localStorage.getItem('usernames')) || [];
    setSavedUsernames(storedUsernames);
  }, []);

  useEffect(() => {
    const filtered = savedUsernames.filter((savedUsername) =>
      savedUsername.toLowerCase().includes(username.toLowerCase())
    );
    setFilteredUsernames(filtered);
  }, [username, savedUsernames]);

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '500px',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative', marginBottom: '10px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              style={{ flexGrow: 1, padding: '10px', fontSize: '16px' }}
              onFocus={() => savedUsernames.length > 0 && setIsDropdownVisible(true)}
              onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
            />
            {savedUsernames.length > 0 && (
              <div
                onClick={() => setIsDropdownVisible(!isDropdownVisible)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer' 
                }}
              >
                <FaCaretDown />
              </div>
            )}
          </div>
          {isDropdownVisible && filteredUsernames.length > 0 && (
            <ul
              style={{
                position: 'absolute',
                top: 'calc(100% + 5px)',
                left: '0',
                right: '0',
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                maxHeight: '150px',
                overflowY: 'auto',
                zIndex: 1000,
                margin: '0',
                padding: '0',
                listStyle: 'none',
              }}
            >
              {filteredUsernames.map((savedUsername) => (
                <li
                  key={savedUsername}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #ddd',
                  }}
                  onMouseDown={() => {
                    setUsername(savedUsername);
                    setIsDropdownVisible(false);
                  }}
                >
                  {savedUsername}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginBottom: '5px', display: 'block' }}>Select year</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={!isPreviousYear}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              backgroundColor: isPreviousYear ? 'white' : '#f0f0f0',
              color: isPreviousYear ? 'black' : '#777',
              borderColor: isPreviousYear ? '#ccc' : '#ddd',
              cursor: isPreviousYear ? 'pointer' : 'not-allowed',
            }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>
            <input
              type="checkbox"
              checked={isPreviousYear}
              onChange={(e) => setIsPreviousYear(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            Find league from previous year
          </label>
        </div>

        <button className="sleeper-button" type="submit">Find league</button>
      </form>

      {leagues.length > 0 && (
        <div style={{ marginTop: '20px', width: '100%', display:'flex', flexDirection:'column' }}>
          <h4 style={{ alignSelf: 'center' }}>Select your league...</h4>
          <ul style={{ listStyleType: 'none', padding: '0', margin: '0' }}>
            {leagues.map((league) => (
              <li key={league.league_id} style={{ marginBottom: '10px' }}>
                <button className="league-choice-button" onClick={() => handleLeagueSelect(league)} >
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