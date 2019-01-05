import './style';
import { Component } from 'preact';

const getRandom = (a, b) => {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

const PlayButton = ({ onClick }) => {
    return <button type="button" onClick={onClick}>▶</button>;
};

const getRange = n => Array.from(Array(n).keys());

const Disc = () => {
    return (
        <svg height="100" width="100">
            <circle cx="50" cy="50" r="40" fill="black" />
        </svg>
    );
}

const Figures = ({ number }) => {
    return (
        <div>{getRange(number).map(() => {
            return <Disc/>;
        })}</div>
    );
}

const BigSign = ({ symbol }) => {
    return <div className="display">{symbol}</div>;
}

const Success = () => <BigSign symbol="✓"/>;
const Fail = () => <BigSign symbol="&#x274C;"/>;

class Game extends Component {
    constructor(props) {
        super(props);
        this.guess = this.guess.bind(this);
        this.start = this.start.bind(this);
    }
    guess(value) {
        console.assert(this.state.number !== undefined);
        const isSuccess = value === this.state.number;
        this.setState({
            fullscreen: isSuccess ? 'success' : 'fail',
            number: undefined,
        });
        if (!isSuccess) {
            navigator.vibrate(200);
        }
    }
    start() {
        this.setState({
            fullscreen: undefined,
            number: getRandom(1, 5),
        });
    }
    renderInner(number) {
        if (number === undefined) {
            return (
                <div className="buttons">
                    <PlayButton onClick={this.start}/>
                </div>
            );
        }
        return [
            <div className="display"><Figures number={number}/></div>,
            <div className="buttons">
                {getRange(5).map(i => {
                    const value = i + 1;
                    return (
                        <button type="button" onClick={() => this.guess(value)}>
                            {value}
                        </button>
                    );
                })}
            </div>
        ];
    }
    render({}, { number, fullscreen }) {
        const fullscreenClass = fullscreen === undefined ? "" : fullscreen;
        return (
            <div className={"fullscreen " + fullscreenClass}>
                {{success: <Success/>, fail: <Fail/>}[fullscreen]}
                {this.renderInner(number)}
            </div>
        );
    }
}

export default class App extends Component {
    render() {
        return <Game/>;
    }
}
