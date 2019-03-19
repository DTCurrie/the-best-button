import React, { ReactElement } from 'react';

export function ErrorMessage(props: { error: string }): ReactElement {
    if (!props.error) { return null; }
    return <div className='error-message'>{props.error}</div>;
}
