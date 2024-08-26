import React from 'react';

const MyTeamTable = ({ selectedTeam, teams, draftType }) => {
    // Define header configurations based on draftType
    const headers = {
        'underdog-best-ball': ['Player', 'Position', 'Team', '15', '16', '17'],
        'snake': ['Player', 'Position', 'Team', 'Bye'],
        'auction': ['Player', 'Position', 'Team', 'Cost'],
    };

    // Determine the headers for the current draftType
    const draftHeaders = headers[draftType] || headers['underdog-best-ball']; // Default to 'underdog-best-ball'

    return (
        <div>
            <h2>My Team ({selectedTeam + 1})</h2>
            <table>
                <thead>
                    <tr>
                        {draftHeaders.map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {teams[selectedTeam].map(player => (
                        <tr key={player.id}>
                            <td>{player.name}</td>
                            <td>{player.position}</td>
                            <td>{player.team}</td>
                            {/* Render data based on headers */}
                            {draftHeaders.includes('15') && <td>{player.week15Opponent}</td>}
                            {draftHeaders.includes('16') && <td>{player.week16Opponent}</td>}
                            {draftHeaders.includes('17') && <td>{player.week17Opponent}</td>}
                            {draftHeaders.includes('Bye') && <td>{player.byeWeek}</td>}
                            {/* {draftHeaders.includes('Cost') && <td>{player.cost}</td>} */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MyTeamTable;
