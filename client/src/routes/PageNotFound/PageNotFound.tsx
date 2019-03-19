import React, { ReactElement } from 'react';

import './PageNotFound.scss';

export default function PageNotFound(): ReactElement {
    return (
        <div className='page-not-found'>
            <h1>Page Not Found</h1>
            <div className='message'>
                Unable to locate the page you are looking for. Use the "Vote" or "Stats" links below to return to the app.
            </div>
        </div>
    );
}
