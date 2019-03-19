import React, { Dispatch, ReactElement, useEffect, useState } from 'react';
import { ErrorMessage } from '@components/ErrorMessage';
import { Button } from '@components/Button';
import { listen } from '@utilities/socket';

import './Vote.scss';

export default function Vote(): ReactElement {
    const [ colors, setColors ]: [ Array<Color>, Dispatch<Array<Color>> ] = useState([]);
    const [ activeColor, setActiveColor ]: [ string, Dispatch<string> ] = useState(null);
    const [ canVote, setCanVote ]: [ boolean, Dispatch<boolean> ] = useState(false);
    const [ error, setError ]: [ string, Dispatch<string> ] = useState(null);

    const [ buttons, setButtons ]: [ Array<ReactElement>, Dispatch<Array<ReactElement>> ] = useState([]);

    const url = `${process.env.NODE_ENV === 'production' ? 'https://tbb.devintcurrie.com' : 'http://localhost:3000'}`;

    const setData = (data?: Array<Color>, err?: string): void => {
        setColors(data);

        const active = data.find((color: Color) => color.active);
        if (active && active._id !== activeColor) { setActiveColor(active._id); }

        setError(err);
    };

    const handleActiveColorChange = (colorId: string) => {
        setColors(colors.map((color: Color) => {
            if (color._id === colorId) { color.active = true; }
            if (color._id === activeColor) { color.active = false; }
            return color;
        }));
    };

    const handleVote = (colorId: string): void => {
        handleActiveColorChange(colorId);
        setActiveColor(colorId);
        setButtons(colors.map((color: Color) =>
            <Button key={color._id} color={color._id} active={color.active} disabled={true} onVote={() => handleVote(color._id)}
                onError={(voteError: string) => setError(voteError)} />));
        setCanVote(false);
    };

    listen<string>('vote', (colorId: string) => {
        handleActiveColorChange(colorId);
        setActiveColor(colorId);
    });

    useEffect(() => {
        fetch(`${url}/api/colors/can-vote/`)
            .then((canVoteRes: Response) => canVoteRes.json()
                .then((canVoteData: { canVote: boolean }) => {
                    setCanVote(canVoteData.canVote);
                    fetch(`${url}/api/colors`)
                        .then((colorsRes: Response) => colorsRes.json()
                            .then((colorsData: Array<Color>) => setData(colorsData, null))
                            .catch((err: string) => setData(null, err)))
                        .catch((err: string) => setError(err));
                })
                .catch((err: string) => setError(err)))
            .catch((err: string) => setError(err));
    }, []);

    useEffect(
        () => setButtons(colors.map((color: Color) =>
            <Button key={color._id} color={color._id} active={color.active} disabled={!canVote} onVote={handleVote}
                onError={(voteError: string) => setError(voteError)} />)),
        [ activeColor, colors ]);

    return (
        <div className='vote'>
            <ErrorMessage error={error} />
            {!error && (
                <div className='buttons'>
                    <div className='instructions'>Vote on the best button:</div>
                    {buttons}
                </div>)}
            {!canVote && (
                <div className='voted'>
                    <p>You already voted. You will be able to vote again after someone else votes.</p>
                </div>
            )}
        </div>);
}
