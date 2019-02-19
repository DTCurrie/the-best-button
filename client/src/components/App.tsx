import React, { Dispatch, ReactElement, useEffect, useState } from 'react';

import { Color } from '../../../core/color';
import { listen } from '../socket';

import { Button } from './Button/Button';

function AppError(props: { error: string }): ReactElement {
    if (!props.error) { return null; }
    return <div className='app-error'>{props.error}</div>;
}

export function App(): ReactElement {
    const [ colors, setColors ]: [ Array<Color>, Dispatch<Array<Color>> ] = useState([]);
    const [ activeColor, setActiveColor ]: [ string, Dispatch<string> ] = useState(null);
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
            <Button key={color._id} color={color._id} active={color.active} disabled={true} onVote={() => handleVote(color._id)} />));
    };

    listen<string>('vote', (colorId: string) => {
        handleActiveColorChange(colorId);
        setActiveColor(colorId);
    });

    useEffect(() => {
        fetch(`${url}/api/colors`)
            .then((response: Response) => response.json()
                .then((data: Array<Color>) => setData(data, null))
                .catch((err: string) => setData(null, err)))
            .catch((err: string) => setError(err));
    }, []);

    useEffect(
        () => setButtons(colors.map((color: Color) =>
            <Button key={color._id} color={color._id} active={color.active} disabled={false} onVote={handleVote} />)),
        [ activeColor, colors ]);

    return (
        <div className='app'>
            <div className='buttons'>{buttons}</div>
            <div className='navigation'>
                <AppError error={error} />
                <a href='#' type='button' className='mdc-button'>
                    <span className='mdc-button__label'>Stats</span>
                </a>
            </div>
        </div>);
}
