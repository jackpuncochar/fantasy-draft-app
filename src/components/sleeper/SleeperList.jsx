import React, { useEffect, useMemo, useState } from 'react';
import useStore from '../../store/Store';

const SleeperList = ( {currentPlayer, currentBid} ) => {
    const { playerRanks, draftPicks, selectedLeague, draftType } = useStore();
    const [sortColumn, setSortColumn] = useState('Rank');
    const [sortDirection, setSortDirection] = useState('asc');
    const [positionFilters, setPositionFilters] = useState({}); // Track checkbox states
    const [isAllChecked, setIsAllChecked] = useState(true); // Track the "All" checkbox state
    const [availablePlayers, setAvailablePlayers] = useState([]);

    // Fetch available players when the league is selected or when draft picks are updated
    useEffect(() => {
        if (selectedLeague && playerRanks && playerRanks) {
            const pickedPlayerNames = draftPicks && draftPicks.length > 0
                ? new Set(draftPicks.map(pick =>
                    `${pick.metadata.first_name} ${pick.metadata.last_name}`
                ))
                : new Set();

            const filteredPlayers = playerRanks.filter(player =>
                !pickedPlayerNames.has(player.Player)
            );

            setAvailablePlayers(filteredPlayers);
        }
    }, [selectedLeague, playerRanks, draftPicks]);

    const headerOptions = [
        'Player', 'Team', 'Pos', 'Rank', 'Pos Rank', 'Tier', 'Bye',
        draftType === 'auction' ? 'Auction Value' : null,
        draftType === 'snake' ? 'ADP' : null,
        draftType === 'snake' ? 'Rank Diff' : null,
        draftType === 'snake' ? 'ADP Diff' : null
    ].filter(Boolean);

    const currentPickNumber = draftPicks ? draftPicks.length + 1 : 1;

    const getDifferenceStyle = (difference) => {
        if (difference === 0) {
            return {}; // No special styling for 0
        }
        return {
            color: difference > 0 ? 'green' : 'red',
            fontWeight: 'bold'
        };
    };    

    const formatDifference = (difference) => {
        if (difference === 0) {
            return '0'; // No prefix for 0
        }
        const prefix = difference > 0 ? '+' : '-';
        return `${prefix}${Math.abs(difference)}`;
    };    

    const isNumericColumn = (column) => {
        return [
            'Rank', 'Tier', 'Pos Rank', 'Bye', 'ADP', 
            'Rank Diff', 'ADP Diff', 'Avg Pick', 'High', 'Low', 'Std Dev', 'Auction Value'
        ].includes(column);
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Handle "All" checkbox change
    const handleAllCheckboxChange = (e) => {
        const checked = e.target.checked;
        setIsAllChecked(checked);
        setPositionFilters(prev => {
            const newFilters = {};
            uniquePositions.forEach(pos => {
                if (pos !== 'All') newFilters[pos] = checked;
            });
            return newFilters;
        });
    };

    // Handle individual checkbox change
    const handleCheckboxChange = (position) => {
        setPositionFilters(prev => {
            const newFilters = { ...prev, [position]: !prev[position] };
            const allChecked = Object.keys(newFilters).length === uniquePositions.length - 1
                ? Object.values(newFilters).every(val => val)
                : false;
            setIsAllChecked(allChecked);
            return newFilters;
        });
    };


    const sortedAndFilteredPlayers = useMemo(() => {
        const positionFilterKeys = Object.keys(positionFilters).filter(key => positionFilters[key]);

        let filtered = positionFilterKeys.length === 0 
            ? availablePlayers 
            : availablePlayers.filter(player => positionFilterKeys.includes(player.Position));

        return filtered.sort((a, b) => {
            let aValue = a[sortColumn];
            let bValue = b[sortColumn];

            // Handle sorting for 'Rank Diff' and 'ADP Diff'
            if (sortColumn === 'Rank Diff') {
                bValue = draftType === 'snake' ? currentPickNumber - parseInt(a.Rank) : null;
                aValue = draftType === 'snake' ? currentPickNumber - parseInt(b.Rank) : null;
            } else if (sortColumn === 'ADP Diff') {
                bValue = draftType === 'snake' ? currentPickNumber - parseFloat(a.ADP) : null;
                aValue = draftType === 'snake' ? currentPickNumber - parseFloat(b.ADP) : null;
            } else if (isNumericColumn(sortColumn)) {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [availablePlayers, sortColumn, sortDirection, positionFilters, currentPickNumber, draftType]);

    const uniquePositions = ['All', ...new Set(availablePlayers.map(player => player.Position))];
    
    return (
        <div className="available-players-container">
            <h2 style={{ marginBottom:'.5em' }}>Available Players</h2>
            <div>
            <fieldset style={{ border:'none' }}>
                <legend>Filter by Position:</legend>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <input 
                            type="checkbox" 
                            checked={isAllChecked} 
                            onChange={handleAllCheckboxChange}
                        />
                        All
                    </label>
                    {uniquePositions.map(pos => (
                        pos !== 'All' && (
                            <label key={pos} style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <input 
                                    type="checkbox" 
                                    checked={!!positionFilters[pos]} 
                                    onChange={() => handleCheckboxChange(pos)}
                                />
                                {pos}
                            </label>
                        )
                    ))}
                </div>
            </fieldset>
            </div>
            <table style={{ borderCollapse: 'collapse', width: '60%' }}>
                <thead>
                    <tr>
                        {headerOptions.map(header => (
                            <th key={header} onClick={() => handleSort(header)} style={{ cursor: 'pointer' }}>
                                {header} {sortColumn === header && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedAndFilteredPlayers.map((player, index) => {
                        const rankDiff = draftType === 'snake' ? currentPickNumber - parseInt(player.Rank) : null;
                        const adpDiff = draftType === 'snake' ? currentPickNumber - parseFloat(player.ADP) : null;
                        return (
                            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                                <td>{player.Player}</td>
                                <td>{player.Team}</td>
                                <td>{player.Position}</td>
                                <td>{player.Rank}</td>
                                <td>{player['Pos Rank']}</td>
                                <td>{player.Tier}</td>
                                <td>{player.Bye}</td>
                                {draftType === 'auction' && (
                                    <>
                                        <td>{player['Adjusted Value']}</td>
                                    </>
                                )}
                                {draftType === 'snake' && (
                                    <>
                                        <td>{player.ADP}</td>
                                        <td style={getDifferenceStyle(rankDiff)}>{formatDifference(rankDiff)}</td>
                                        <td style={getDifferenceStyle(adpDiff)}>{formatDifference(adpDiff)}</td>
                                    </>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default SleeperList;
