import React from 'react'; 

const PlayerList = ({ players, onPlayerSelect, draftType }) => {
    const getCellStyle = (value) => ({
        color: value > 0 ? 'green' : 'red',
    });

    const formatExposure = (value) => {
        if (isNaN(value)) return 'N/A';
        return `${(value * 100).toFixed(1)}%`;
    };

    // Define header and attribute mappings based on draft type for available players table
    const headerConfig = {
        common: [
            { label: 'Player', key: 'name' },
            { label: 'Position', key: 'position' },
            { label: 'Team', key: 'team' },
            { label: 'Tier', key: 'tier' },
        ],
        'underdog-best-ball': [
            { label: 'ETR Rank', key: 'rank' },
            { label: 'Underdog ADP', key: 'adp' },
            { label: 'ETR Value', key: 'rankValue' },
            { label: 'ADP Value', key: 'adpValue' },
            { label: 'Exposure', key: 'exposure', format: formatExposure },
            { label: 'Num Teams', key: 'numTeams' },
            { label: 'Snake Slot', key: 'snakeSlot' },
        ],
        snake: [
            { label: 'FP Rank', key: 'rank' },
            { label: 'FP ADP', key: 'adp' },
            { label: 'FP Value', key: 'rankValue' },
            { label: 'ADP Value', key: 'adpValue' },
            { label: 'Bye', key: 'byeWeek' },
        ],
        auction: [
            { label: 'Auction Value', key: 'auctionValue' },
        ],
    };

    // Combine common headers with draft type-specific headers
    const headers = [
        ...headerConfig.common,
        ...(headerConfig[draftType] || []),
    ];

    // Filter out players with any empty values
    const filteredPlayers = players.filter(player =>
        player.name
    );

    return (
        <div>
            <h2>Available Players</h2>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        {headers.map((header) => (
                            <th key={header.key}>{header.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredPlayers.map(player => (
                        <tr key={player.id}>
                            <td>
                                <button onClick={() => onPlayerSelect(player.id)}>Select</button>
                            </td>
                            {headers.map((header) => (
                                <td
                                    key={header.key}
                                    style={header.key.includes('Value') ? getCellStyle(player[header.key]) : {}}
                                >
                                    {header.format ? header.format(player[header.key]) : player[header.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PlayerList;