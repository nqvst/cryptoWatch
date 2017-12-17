import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Fiat from './components/fiat';
import Curr from './components/currencies';

class App extends Component {

    componentWillMount() {
        const apa = window.localStorage.getItem('fiat');
        console.log(apa);
    }

    render() {
        return (
            <div className="App">
                <header className="">
                    <nav className="navbar navbar-dark bg-primary">
                        <h1 className="navbar-brand">Crypto Watch</h1>
                    </nav>
                </header>
                <Fiat />
                <div className="App-content">
                    <Curr />
                </div>
            </div>
        );
    }
}

export default App;
