import React from 'react';
import './fiat.css';

const currencies = [
    'USD',
    'DKK',
    'JPY',
    'PLN',
    'AUD',
    'EUR',
    'KRW',
    'RUB',
    'BRL',
    'GBP',
    'MXN',
    'SEK',
    'CAD',
    'HKD',
    'MYR',
    'SGD',
    'CHF',
    'HUF',
    'NOK',
    'THB',
    'CLP',
    'IDR',
    'NZD',
    'TRY',
    'CNY',
    'ILS',
    'PHP',
    'TWD',
    'CZK',
    'INR',
    'PKR',
    'ZAR',
];

export default class Fiat extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            selected: '',
        }
    }

    renderButtons (currencyList, selected = 'USD') {
        return [
            selected,
            ...currencyList.filter((c => c !== selected))
        ].map(currency => (
            <li key={currency}>
                <button type="button" className={`btn ${currency === selected ? 'btn-success': 'btn-light'}`} onClick={this.fiatClickHandler.bind(this)}>
                    {currency}
                </button>
            </li>
        ));
    };

    fiatClickHandler (e) {
        e.preventDefault();
        console.log(e.target.innerHTML);
        window.localStorage.setItem('fiat', e.target.innerHTML)
        this.setState({
            selected:  e.target.innerHTML,
        });
    };

    componentDidMount() {
        const selected = window.localStorage.getItem('fiat');
        this.setState({
            selected,
        })
    }

    render() {
        const { selected } = this.state;
        return (
            <div className="fiat-container card">
                <ul>
                    { this.renderButtons(currencies, selected) }
                </ul>
            </div>

        );
    }

}

