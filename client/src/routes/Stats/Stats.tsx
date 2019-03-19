import React, { Dispatch, ReactElement, useEffect, useState } from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { ChartData } from 'chart.js';
import { PolarAreaChart } from '@charts/PolarAreaChart';
import { ErrorMessage } from '@components/ErrorMessage';
import variables from '@styles/styles.scss';

import './Stats.scss';

const url = process.env.NODE_ENV === 'production' ? 'https://tbb.devintcurrie.com' : 'http://localhost:3000';

function WinBanner(props: { win?: string }): ReactElement {
    if (!props.win) { return null; }
    const [ win, setWin ]: [ Win, Dispatch<Win> ] = useState(null);

    useEffect(() => {
        fetch(`${url}/api/wins/${props.win}`)
            .then((res: Response) => res.json()
                .then((data: Win) => setWin(data))
                .catch(() => null))
            .catch(() => null);
    }, [ props.win ]);

    return win && (
        <div className={`win-banner ${win.color}`}>
            {win.color} won this week with {win.votes} votes!
        </div>);
}

export default function Stats(routeProps: { match: { params: { week?: string } } }): ReactElement<RouteComponentProps> {
    const [ currentWeek, setCurrentWeek ]: [ Week, Dispatch<Week> ] = useState(null);
    const [ weeks, setWeeks ]: [ Array<Week>, Dispatch<Array<Week>> ] = useState([]);
    const [ weekLinks, setWeekLinks ]: [ Array<ReactElement>, Dispatch<Array<ReactElement>> ] = useState([]);

    const [ colors, setColors ]: [ Array<Color>, Dispatch<Array<Color>> ] = useState([]);
    const [ chartData, setChartData ]: [ ChartData, Dispatch<ChartData> ] = useState(null);

    const [ error, setError ]: [ string, Dispatch<string> ] = useState(null);

    const handleCurrentWeek = (data?: Week, err?: string): void => {
        setCurrentWeek(data);
        setColors(data ? Object.keys(data.stats).map((_id: string) => ({ _id, votes: data.stats[ _id ].votes })) : []);
        setError(err);
    };

    const handleWeeks = (data?: Array<Week>, err?: string): void => {
        setWeeks(data);
        setError(err);
    };

    useEffect(() => {
        fetch(`${url}/api/weeks/${routeProps.match.params.week || 'current'}`)
            .then((res: Response) => res.json()
                .then((data: Week) => handleCurrentWeek(data, null))
                .catch((err: string) => handleCurrentWeek(null, err)))
            .catch((err: string) => setError(err));

        fetch(`${url}/api/weeks`)
            .then((res: Response) => res.json()
                .then((data: Array<Week>) => handleWeeks(data, null))
                .catch((err: string) => handleWeeks(null, err)))
            .catch((err: string) => setError(err));
    }, [ routeProps.match.params.week ]);

    useEffect(() => {
        const newChartData: ChartData = { datasets: [ { data: [] } ], labels: [] };
        const dataset = newChartData.datasets[ 0 ];
        const fillColors: Array<string> = [];

        colors.forEach((color: Color) => {
            dataset.data.push(color.votes);
            newChartData.labels.push(color._id.toUpperCase());
            fillColors.push(variables[ `${color._id}-transparent` ]);
        });

        dataset.backgroundColor = fillColors;
        setChartData(newChartData);
    }, [ currentWeek, colors ]);

    useEffect(() => setWeekLinks(weeks.map((week: Week) => {
        if (week._id !== currentWeek._id) {
            return <li key={week._id}>
                <NavLink to={`/stats/${week._id}`} activeClassName='active'>{week.date}</NavLink>
            </li>;
        }
    })), [ weeks ]);

    return error
        ? <div className='stats' ><ErrorMessage error={error} /></div>
        : <div className='stats'>
            {currentWeek && (
                <div className='current-week'>
                    <div className='header'>{currentWeek.date}:</div>
                    <PolarAreaChart id='weekVotes' data={chartData}></PolarAreaChart>
                    <WinBanner win={currentWeek.win} />
                </div>
            )}
            {weekLinks.length && (
                <div className='weeks-navigation'>
                    <div className='header'>Past Weeks:</div>
                    <ul>{weekLinks}</ul>
                </div>
            )}
        </div>;
}
