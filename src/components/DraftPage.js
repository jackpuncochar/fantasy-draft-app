import React, { useState, useEffect, useContext } from 'react'; 
import PlayerList from '../components/PlayerList';
import DraftGrid from '../components/DraftGrid';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchFromCSV, fetchFromXLSX } from '../components/api';
import './DraftPage.css';
import { DraftContext } from './DraftContext'
import MyTeamTable from './MyTeamTable';

const DraftPage = () => { 
    const { draftSettings } = useContext(DraftContext);
    const { draftType } = useParams();

    const [players, setPlayers] = useState([]);
    const [originalPlayers, setOriginalPlayers] = useState([]); // Store original player list
    const [teams, setTeams] = useState(Array(draftSettings.numTeams).fill([])); // 12 teams
    const [currentRound, setCurrentRound] = useState(1);
    const [currentPick, setCurrentPick] = useState(1); // Track current pick position
    const [selectedTeam, setSelectedTeam] = useState(0); // Track team making the current pick
    const [showPrompt, setShowPrompt] = useState(true); // Show prompt for pick
    const [showResetConfirm, setShowResetConfirm] = useState(false); // Show reset confirmation dialog
    const [selectedSquare, setSelectedSquare] = useState(null); // Track selected grid square
    const [isGridVisible, setIsGridVisible] = useState(false); // Track visibility of the grid
    const [myTeamIndex, setMyTeamIndex] = useState(0); // set to team index that user selects from drop down
    const [isDraftStarted, setIsDraftStarted] = useState(false); // Track draft progress

    useEffect(() => {
        const loadData = async () => {
            if (draftType === 'underdog-best-ball') {
                const fetchedPlayers = await fetchFromXLSX('../Underdog Rankings.xlsx');
                const fetchedMatchups = await fetchFromCSV('../Playoff Matchups.csv');
                const fetchedExposures = await fetchFromXLSX('../Underdog Exposures.xlsx');
                const playersWithRank = processUnderdogData(fetchedPlayers, fetchedMatchups, fetchedExposures);
                setPlayers(playersWithRank);
                setOriginalPlayers(playersWithRank);
            } else if (draftType === 'snake' || draftType === 'auction') {
                const fetchedPlayers = await fetchFromXLSX('../2 QB Rankings.xlsx');
                setPlayers(fetchedPlayers);
                setOriginalPlayers(fetchedPlayers);
            }
        };

        loadData();
    }, [draftType]); // Re-run data fetch when draftType changes

    // Helper function to process Underdog data
    const processUnderdogData = (players, matchups, exposures) => {
        // Merge players with matchups
        const mergedPlayers = players.map(player => {
            const teamMatchup = matchups.find(matchup => matchup.Team === player['Team']);
            return {
                ...player,
                week15Opponent: teamMatchup ? teamMatchup['Week 15'] : null,
                week16Opponent: teamMatchup ? teamMatchup['Week 16'] : null,
                week17Opponent: teamMatchup ? teamMatchup['Week 17'] : null,
            };
        });

        // Merge players with exposures
        const finalPlayers = mergedPlayers.map(player => {
            const playerExposure = exposures.find(exposure => exposure.Player === player['Player']);
            return {
                ...player,
                exposure: playerExposure ? playerExposure['Exposure'] : null,
                numTeams: playerExposure ? playerExposure['Num Teams'] : null,
                snakeSlot: playerExposure ? playerExposure['Snake Slot'] : null,
            };
        });

        return finalPlayers;
    };

    useEffect(() => {
        // Recalculate metrics whenever currentPick changes, excluding selected players
        const availablePlayers = originalPlayers.filter(player => 
            !teams.flat().some(selectedPlayer => selectedPlayer.id === player['Player'])
        );
        const updatedPlayers = calculatePlayerMetrics(availablePlayers, currentPick);
        setPlayers(updatedPlayers);
    }, [currentPick, originalPlayers, teams]); // Recalculate whenever currentPick or teams change


    const calculatePlayerMetrics = (playersList, pick) => {
        return playersList.map(player => ({
            id: player['Player'],  
            name: player['Player'],
            position: player['Position'],
            team: player['Team'],
            rank: player['Rank'],
            adp: player['ADP'],
            tier: player['Tier'],
            week15Opponent: player.week15Opponent,
            week16Opponent: player.week16Opponent,
            week17Opponent: player.week17Opponent,
            rankValue: pick - player['Rank'],
            adpValue: pick - player['ADP'],
            exposure: player.exposure,
            numTeams: player.numTeams,
            snakeSlot: player.snakeSlot,
            byeWeek: player['Bye'],
        }));
    };

    const handlePlayerSelect = (playerId) => {
        if (!isDraftStarted) {
            setIsDraftStarted(true);
        }
        const selectedPlayer = players.find(player => player.id === playerId);
        if (selectedPlayer) {
            const newPlayers = players.filter(player => player.id !== playerId);
            const newTeams = [...teams];
        
            let roundIndex;
            let teamIndex;
        
            if (selectedSquare) {
                // Use selectedSquare for placement if a square is selected
                roundIndex = selectedSquare.roundIndex;
                teamIndex = selectedSquare.teamIndex;
            } else {
                // Default to current pick if no square is selected
                roundIndex = Math.floor((currentPick - 1) / teams.length);
                teamIndex = (currentPick - 1) % teams.length;
            }
        
            // Determine if the current round is forward or backward
            const roundDirection = roundIndex % 2 === 0; // Even rounds go forward, odd rounds go backward
        
            // Adjust the team index for snake draft logic if no square is selected
            const actualTeamIndex = selectedSquare ? teamIndex : (roundDirection ? teamIndex : teams.length - 1 - teamIndex);
        
            // Ensure the team array is populated
            if (!newTeams[actualTeamIndex]) {
                newTeams[actualTeamIndex] = Array(draftSettings.numRounds).fill(null); // rounds refers to totalRounds
            }
        
            // Only update the specific round and team slot
            newTeams[actualTeamIndex] = [...newTeams[actualTeamIndex]]; // Create a copy to maintain immutability
            newTeams[actualTeamIndex][roundIndex] = selectedPlayer;
        
            setTeams(newTeams);
            setPlayers(newPlayers);
        
            // Update current pick to the next one if no square was selected
            if (!selectedSquare) {
                setCurrentPick(currentPick + 1);
                if (currentPick % teams.length === 0) {
                    setCurrentRound(currentRound + 1);
                }
            }
        
            // Reset the selected square after the pick
            setSelectedSquare(null);
            setShowPrompt(false);
        }
    };            

    const handleSquareSelect = (square) => {
        // Log the current state
        console.log('Selected Square:', selectedSquare);
        console.log('Current Pick:', currentPick);
        console.log('Current Round:', currentRound);
        setSelectedSquare(square);
        setShowPrompt(false);
    };

    const handleRemovePlayer = (teamIndex, roundIndex) => {
        const team = teams[teamIndex] || []; // Ensure the team exists
        const playerToRemove = team[roundIndex];
    
        if (playerToRemove) {
            const newTeams = [...teams];
            // Remove player from the team and adjust the team slots
            newTeams[teamIndex] = team.filter((_, index) => index !== roundIndex);
            // Add the removed player back to the available players list
            const newPlayers = [...players, playerToRemove].sort((a, b) => a.adpRank - b.adpRank);
    
            setTeams(newTeams);
            setPlayers(newPlayers);
    
            // Set the removed player's square as the selected square
            setSelectedSquare({ teamIndex, roundIndex });
        }
    };
    
    const handleTeamChange = (event) => {
        const teamIndex = parseInt(event.target.value, 10);
        setSelectedTeam(teamIndex);
        setMyTeamIndex(teamIndex); // Update myTeamIndex here
        setShowPrompt(true);
    };
    
    const handlePickSubmit = () => {
        setShowPrompt(false);
    };

    // Calculate the current pick in terms of round and position
    const currentPickInfo = `Round ${Math.floor((currentPick - 1) / 12) + 1}, Pick ${((currentPick - 1) % 12) + 1}`;

    const handleResetDraft = () => {
        setTeams(Array(draftSettings.numTeams).fill([]));
        setPlayers([...originalPlayers]); // Optionally reload initial players if necessary
        setCurrentRound(1);
        setCurrentPick(1);
        setSelectedSquare(null);
        setSelectedTeam(0);
        setShowPrompt(true);
        setShowResetConfirm(false);
        setIsDraftStarted(false);
    };

    const handleResetConfirm = () => {
        setShowResetConfirm(true);
    };

    const handleResetCancel = () => {
        setShowResetConfirm(false);
    };

    const toggleGridVisibility = () => {
        setIsGridVisible(!isGridVisible);
    };

    const navigate = useNavigate();
    const handleHomeClick = () => {
        if (isDraftStarted) {
            const confirmLeave = window.confirm(
                'The draft has begun. Are you sure you want to leave? Progress will be lost.'
            );
            if (!confirmLeave) return; // Exit if the user cancels
        }
        navigate('/'); // Navigate to home page
    };

    return (    
        <div className="draft-container">
            <div className="home-button" onClick={handleHomeClick}>
                Home
            </div>
            <div className="draft-header">
                <h1>{draftType === 'underdog-best-ball' ? 'Underdog Best Ball Draft' : draftType.charAt(0).toUpperCase() + draftType.slice(1) + ' Draft'}</h1>
                <h2>{currentPickInfo}</h2>
                <h3>Overall Pick: {currentPick}</h3>
                <button className="reset-button" onClick={handleResetConfirm}>Reset Draft</button>
            </div>
            <div className="draft-content">
                <div className="player-list">
                    <PlayerList 
                        players={players} 
                        onPlayerSelect={handlePlayerSelect}
                        draftType={draftType}
                    />
                </div>
                <div className="user-team">
                    <MyTeamTable
                        selectedTeam={selectedTeam}
                        teams={teams}
                        draftType={draftType}
                    />
                </div>
            </div>
            <div>
                <button className="open-grid-button" onClick={toggleGridVisibility}>
                    {isGridVisible ? 'Close Draft Grid' : 'Open Draft Grid'}
                </button>
                <div className={`draft-grid ${isGridVisible ? 'visible' : 'hidden'}`}>
                    {isGridVisible ? (
                        <DraftGrid
                            teams={teams}
                            rounds={draftSettings.numRounds}
                            selectedSquare={selectedSquare}
                            currentPick={currentPick}
                            myTeamIndex={myTeamIndex}
                            onSquareSelect={handleSquareSelect}
                            onRemovePlayer={handleRemovePlayer}
                        />
                    ) : null}
                </div>
            </div>
            {showPrompt && (
                <div className="draft-prompt">
                    <label>
                        Select Draft Slot:
                        <select value={selectedTeam} onChange={handleTeamChange}>
                            {teams.map((_, index) => (
                                <option key={index} value={index}>
                                    Team {index + 1}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button onClick={handlePickSubmit}>Submit</button>
                </div>
            )}
            {showResetConfirm && (
                <div className="reset-confirm">
                    <h2>Are you sure you want to reset the draft?</h2>
                    <button onClick={handleResetDraft}>Yes, Reset</button>
                    <button onClick={handleResetCancel}>Cancel</button>
                </div>
            )}
        </div>
    ); 
}; 

export default DraftPage;
