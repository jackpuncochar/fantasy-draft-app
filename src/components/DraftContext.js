import React, { createContext, useState } from 'react';

export const DraftContext = createContext();

export const DraftProvider = ({ children }) => {
    const [draftSettings, setDraftSettings] = useState({
        draftType: 'underdog-best-ball',
        numTeams: 12,
        numRounds: 18,
    });

    return (
        <DraftContext.Provider value={{ draftSettings, setDraftSettings }}>
            {children}
        </DraftContext.Provider>
    );
};
