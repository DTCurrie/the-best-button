import React, { FunctionComponent, lazy, LazyExoticComponent, ReactElement, Suspense } from 'react';
import { BrowserRouter as Router, NavLink, Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';

const Vote: LazyExoticComponent<FunctionComponent<RouteComponentProps>> = lazy(() => import('@routes/Vote'));
const Stats: LazyExoticComponent<FunctionComponent<RouteComponentProps>> = lazy(() => import('@routes/Stats'));
const Error: LazyExoticComponent<FunctionComponent<RouteComponentProps>> = lazy(() => import('@routes/PageNotFound'));

export function App(): ReactElement {
    return (
        <div className='app'>
            <Router>
                <Suspense fallback={(<div className='app'><div className='loader'>Loading...</div></div>)}>
                    <Switch>
                        <Route exact path='/vote' component={(props: RouteComponentProps) => <Vote {...props} />} />
                        <Route exact path='/' render={() => (<Redirect to='/vote' />)} />

                        <Route exact path='/stats' component={(props: RouteComponentProps) => <Stats {...props} />} />
                        <Route exact path='/stats/:week' component={(props: RouteComponentProps) => <Stats {...props} />} />

                        <Route component={(props: RouteComponentProps) => <Error {...props} />} />
                    </Switch>

                    <div className='navigation mdc-elevation--z1'>
                        <ul>
                            <li>
                                <NavLink to='/vote' activeClassName='active'>Vote</NavLink>
                            </li>
                            <li>
                                <NavLink to='/stats' activeClassName='active'>Stats</NavLink>
                            </li>
                        </ul>
                    </div>
                </Suspense>
            </Router >
        </div>);
}
