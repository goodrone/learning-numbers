import './style';
import { Component } from 'preact';
import linkState from 'linkState';

const getRandom = () => {
    return Math.floor(Math.random() * 9) + 1;
}

const PlayButton = (onClick) => {
    return <button type="button" onClick={onClick}>Play</button>;
};

const getRange = n => Array.from(Array(n).keys());

export default class App extends Component {
    constructor(props) {
        super(props);
        this.guess = this.guess.bind(this);
    }
    guess(value) {
        console.assert(this.state.number !== undefined);
        if (value === this.state.number) {
            this.setState({fullscreen: 'success', number: undefined});
        } else {
            this.setState({fullscreen: 'fail', number: undefined});
        }
    }
    render({}, { number, fullscreen }) {
        if (number === undefined) {
            return (
                <div>
                {fullscreen !== undefined && fullscreen}
                <PlayButton onClick={() => this.setState({number: getRandom()})}/>
                </div>
            );
        }
        return (
            <div>
                <h1>{number}</h1>
                {getRange(9).map(i => {
                    const value = i + 1;
                    return (
                        <button type="button" onClick={() => this.guess(value)}>
                            {value}
                        </button>
                    );
                })}
            </div>
        );
    }
}
