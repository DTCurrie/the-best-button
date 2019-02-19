import React, { ReactElement } from 'react';

import { emit } from '../../socket';

import './Button.scss';

interface ButtonProps { color: string; active: boolean; disabled: boolean; onVote(colorId: string): void; }

export function Button(props: ButtonProps): ReactElement {
    const url = `${process.env.NODE_ENV === 'production'
        ? 'https://tbb.devintcurrie.com'
        : 'http://localhost:3000'}/api/colors/${props.color}/vote`;

    const vote = (): void => {
        fetch(url, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' } })
            .then((response: Response) => response.json()
                .then((data: { success: boolean }) => {
                    if (data.success) { emit<string>('vote', props.color, () => props.onVote(props.color)); }
                }));
    };

    const classes = `button-${props.color} mdc-button ${props.active ? 'mdc-button--raised' : 'mdc-button--outlined'}`;

    return (
        <button className={classes} onClick={vote} disabled={props.disabled}>
            <span className='mdc-button__label'>{props.color.toUpperCase()}</span>
        </button>);

}
