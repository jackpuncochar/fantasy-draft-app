import React, { useMemo, useState } from 'react';
import useStore from '../../store/Store';

const SleeperList = () => {
    const { playerRanks, draftPicks } = useStore();
    const [sortColumn, setSortColumn] = useState('Rank');
    const [sortDirection, setSortDirection] = useState('asc');
    const [positionFilter, setPositionFilter] = useState('All');

    const availablePlayers = useMemo(() => {
        if (!draftPicks || !playerRanks["Fantasy Pros 2 QB Rankings"]) return [];

        const pickedPlayerNames = new Set(draftPicks.map(pick => 
            `${pick.metadata.first_name} ${pick.metadata.last_name}`
        ));
        return playerRanks["Fantasy Pros 2 QB Rankings"].filter(player => 
            !pickedPlayerNames.has(player.Player)
        );
    }, [playerRanks, draftPicks]);

    const currentPickNumber = draftPicks ? draftPicks.length + 1 : 1;

    const getDifferenceStyle = (difference) => ({
        color: difference > 0 ? 'green' : 'red',
        fontWeight: 'bold'
    });

    const formatDifference = (difference) => {
        const prefix = difference > 0 ? '+' : '-';
        return `${prefix}${Math.abs(difference)}`;
    };

    const isNumericColumn = (column) => {
        return [
            'Rank', 'Tier', 'Pos Rank', 'Bye', 'ADP', 
            'Rank Diff', 'ADP Diff', 'Avg Pick', 'High', 'Low', 'Std Dev'
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

    const sortedAndFilteredPlayers = useMemo(() => {
        let filtered = positionFilter === 'All' 
            ? availablePlayers 
            : availablePlayers.filter(player => player.Position === positionFilter);

        return filtered.sort((a, b) => {
            let aValue = a[sortColumn];
            let bValue = b[sortColumn];

            // Handle sorting for 'Rank Diff' and 'ADP Diff'
            if (sortColumn === 'Rank Diff') {
                bValue = currentPickNumber - parseInt(a.Rank);
                aValue = currentPickNumber - parseInt(b.Rank);
            } else if (sortColumn === 'ADP Diff') {
                bValue = currentPickNumber - parseFloat(a.ADP);
                aValue = currentPickNumber - parseFloat(b.ADP);
            } else if (isNumericColumn(sortColumn)) {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [availablePlayers, sortColumn, sortDirection, positionFilter, currentPickNumber]);

    const uniquePositions = ['All', ...new Set(availablePlayers.map(player => player.Position))];

    return (
        <div>
            <h2>Available Players</h2>
            <p>Current Pick: {currentPickNumber}</p>
            <div>
                <label>
                    Filter by Position:
                    <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)}>
                        {uniquePositions.map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                        ))}
                    </select>
                </label>
            </div>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                    <tr>
                        {['Player', 'Team', 'Pos', 'Rank', 'Tier', 'Pos Rank', 'Bye', 'ADP', 'Rank Diff', 'ADP Diff', 'Avg Pick', 'High', 'Low', 'Std Dev'].map(header => (
                            <th key={header} onClick={() => handleSort(header)} style={{cursor: 'pointer'}}>
                                {header} {sortColumn === header && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedAndFilteredPlayers.map((player, index) => {
                        const rankDiff = currentPickNumber - parseInt(player.Rank);
                        const adpDiff = currentPickNumber - parseFloat(player.ADP);
                        return (
                            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                                <td>{player.Player}</td>
                                <td>{player.Team}</td>
                                <td>{player.Position}</td>
                                <td>{player.Rank}</td>
                                <td>{player.Tier}</td>
                                <td>{player['Pos Rank']}</td>
                                <td>{player.Bye}</td>
                                <td>{player.ADP}</td>
                                <td style={getDifferenceStyle(rankDiff)}>{formatDifference(rankDiff)}</td>
                                <td style={getDifferenceStyle(adpDiff)}>{formatDifference(adpDiff)}</td>
                                <td>{player['Avg Pick']}</td>
                                <td>{player.High}</td>
                                <td>{player.Low}</td>
                                <td>{player['Std Dev']}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default SleeperList;
