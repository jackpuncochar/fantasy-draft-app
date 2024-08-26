import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DraftContext } from './DraftContext';
import './MainPage.css'

const MainPage = () => {
    const { draftSettings, setDraftSettings } = useContext(DraftContext);
    const navigate = useNavigate();

    const handleStartDraft = () => {
        navigate(`/draft/${draftSettings.draftType}`);
    };

    return (
        <div class="main-page-container">
            <h1>Fantasy Football Draft App</h1>
            <h2>Choose Draft Type:</h2>
            <select value={draftSettings.draftType} 
                    onChange={(e) => setDraftSettings({
                        ...draftSettings,
                        draftType: e.target.value,
                    })}>
                <option value="underdog-best-ball">Underdog Best Ball</option>
                <option value="snake">Snake Draft</option>
                <option value="auction">Auction Draft</option>
            </select>

            {(draftSettings.draftType === 'snake' || draftSettings.draftType === 'auction') && (
                <div class="input-container">
                    <div class="input-item">
                        <label>Number of teams:</label>
                        <input 
                            type="number" 
                            min="8" 
                            max="12" 
                            value={draftSettings.numTeams} 
                            onChange={(e) => setDraftSettings({
                                ...draftSettings,
                                numTeams: parseInt(e.target.value, 10),
                            })} 
                        />
                    </div>
                    <div class="input-item">
                        <label>Number of rounds:</label>
                        <input 
                            type="number" 
                            min="15" 
                            max="20" 
                            value={draftSettings.numRounds} 
                            onChange={(e) => setDraftSettings({
                                ...draftSettings,
                                numRounds: parseInt(e.target.value, 10),
                            })} 
                        />
                    </div>
                </div>
                
            )}
            <button onClick={handleStartDraft} disabled={!draftSettings.draftType}>
                Start Draft
            </button>
        </div>
    );
};

export default MainPage;
