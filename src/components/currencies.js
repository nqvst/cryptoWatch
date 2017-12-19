import React from 'react';
import axios from 'axios';
import Autocomplete from 'react-autocomplete';
import './currencies.css';

import autocompleteItems from '../search.json';

const menuStyle = {
    borderRadius: '3px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '2px 0',
    fontSize: '90%',
    position: 'fixed',
    overflow: 'auto',
    maxHeight: '50%',
};

const TICKER_URL = 'https://api.coinmarketcap.com/v1/ticker/';

const shouldRender = (item, value) => {
    try {
        const search = `${item.name.toLowerCase()}${item.symbol.toLowerCase()}`;
        return search.includes(value.toLowerCase())

    } catch (e) {
        console.log(item, value, e);
    }
    return false;
}


const renderItem = (item, active) => (
    <li className={`list-group-item ${active ? 'active' : ''}`}>
        {`${item.name} [${item.symbol}]`}
    </li>
);

const renderMenu = (items, value, style) => (
    <ul className="list-group" style={{ ...style, ...menuStyle }} children={items} />
);

const localGet = (key) => {
    return window.localStorage.getItem(key);
};

const localSet = (key, value) => {
    window.localStorage.setItem(key, value);
};

const localRemove = (key) => {
    window.localStorage.removeItem(key);
}

const reduceBalance = (data, watching) => {
    return data.reduce((prev, curr) => {
        const w = watching.find(w => curr.symbol === w.symbol);
        if (w && w.amount) {
            console.log('', w.amount, ' \t', curr.symbol, curr.price_sek, ' \t', (w.amount * Number(curr.price_sek)).toFixed(2), 'SEK');
            return {
                ...prev,
                [w.symbol]: (Number(curr['price_' + (localGet('fiat').toLowerCase() || 'usd')])),
                total: prev.total + (w.amount * Number(curr['price_' + (localGet('fiat').toLowerCase() || 'usd')])),
            }
        }
        return prev
    }, { total: 0 });
}

const reduceBalance2 = (data, watching) => {
    console.log(data)
    return data.filter((w) => {
        return watching.find(a => a.symbol === w.symbol);
    });
}

class Currencies extends React.Component {

    state = {
        value: '',
        selected: '',
        amount: 1,
        watchers: [],
        total: 0,
    }

    componentDidMount() {
        const watching = localGet('watching');

        if (watching) {
            this.setState({ watchers: JSON.parse(watching) });
        }
        this.fetchPrices()
    }

    fetchPrices = () => {

        const options = {
            params: {
                convert: localGet('fiat') || 'USD',
            }
        };

        const currentPrices = axios.get(TICKER_URL, options)
            .then(resp => {
                const balances = reduceBalance2(resp.data, this.state.watchers);

                this.setState({
                    watchers: balances,
                })
                this.setState({ total: balances.total });
            })
            .catch(function (error) {
                console.log(error);
            });

    }

    getWatchingFromStorage = () => {
        const watching = localGet('watching');
        if (!watching)  {
            return [];
        }

        try {
            return JSON.parse(watching);
        } catch(e) {
            e.printStacktrace();
            return [];
        }
    }

    clearForm = () => {
        this.setState({
            value: '',
            amount: 1
        });
    }

    addWatcher = (symbol, amount) => {
        let currentlyWatching = this.getWatchingFromStorage();

        const watchers = [
            ...currentlyWatching,
            {
                symbol,
                amount,
                price: 0,
            }
        ];

        this.clearForm();
        this.updateLocalStorage(watchers);
        this.setState({ watchers });
        this.fetchPrices();
    }

    removeWatcher = (symbol) => {
        const watchers = this.state.watchers.filter(i => i.symbol !== symbol);
        this.setState({ watchers })
        this.updateLocalStorage(watchers);
    }

    updateLocalStorage = (watchers) => {
        localRemove('watching');
        localSet('watching', JSON.stringify(watchers));
    }

    renderRow = (item) => {
        const fiat = localGet('fiat');
        console.log(item)
        return (
            <tr key={item.symbol}>
                <td>{item.symbol}</td>
                <td>{item.amount}</td>
                <td>{`${Number(item.price).toFixed(2)} ${fiat}`}</td>
                <td>
                    <button
                        onClick={() => this.removeWatcher(item.symbol)}
                        className="btn btn-danger btn-sm"
                    >
                        remove
                    </button>
                </td>
            </tr>
        );
    }

    renderWatchers = (items) => {
        const fiat = localGet('fiat');
        return (
            <table className="table table-striped">
                <thead className="thead-dark">
                    <tr>
                        <th scope="col">€</th>
                        <th scope="col">Amount</th>
                        <th scope="col">price/amount</th>
                        <th scope="col">x</th>
                    </tr>
                </thead>
                <tbody>
                    { this.state.watchers.map(this.renderRow) }
                    {
                        this.state.watchers.length &&
                            <div className="ticker-row" key="total">
                                <div>{`total: ${Number(this.state.total).toFixed(2)} ${fiat}`}</div>
                            </div>
                    }
                </tbody>
            </table>
        );
    }

    render() {
        console.log(localGet('watching'));
        const inputProps = {
            className: 'form-control',
            placeholder: 'bitcoin, litecoin ...',
        };

        return (
            <div>
                <form className="form-inline" onSubmit={e => e.preventDefault()}>

                    <Autocomplete
                        wrapperProps={{ className: 'form-group' }}
                        wrapperStyle={{}}
                        shouldItemRender={shouldRender}
                        getItemValue={item => item.symbol}
                        items={autocompleteItems}
                        renderItem={renderItem}
                        renderMenu={renderMenu}
                        inputProps={inputProps}
                        value={this.state.value}
                        onChange={e => this.setState({ value: e.target.value })}
                        onSelect={val => this.setState({ value: val, selected: val })}
                    />

                    <div className="form-group">
                        <label htmlFor="amount" className="sr-only">Amount</label>
                        <input className="form-control" id="amount" type="text" placeholder="amount" value={this.state.amount} onChange={e => this.setState({ amount: e.target.value })} />
                    </div>

                    <div className="form-group">
                        {
                            this.state.value !== '' ?
                                <button className="btn btn-success" onClick={() => this.addWatcher(this.state.selected, this.state.amount)}>Watch</button> :
                                <button className="btn btn-success" disabled >Watch</button>
                        }

                    </div>
                </form>
                {this.state.watchers.length && this.renderWatchers(this.state.watchers)}
            </div>

        );
    }
}

export default Currencies;