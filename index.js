import './style';
import { Component } from 'preact';

function disableViewportZoom() {
    const viewport = document.querySelector("meta[name=viewport]");
    const oldValue = viewport.getAttribute("content");
    viewport.setAttribute("content", oldValue + ",user-scalable=no");
}

class RandomGenerator {
    constructor(values, noRepeat) {
        this.pool = Array.from(values);
        this.noRepeat = noRepeat;
        this.history = [];
    }
    next() {
        if (this.history.length > this.noRepeat) {
            this.pool.push(this.history.shift());
        }
        const index = Math.floor(Math.random() * this.pool.length);
        const value = this.pool.splice(index, 1)[0];
        this.history.push(value);
        return value;
    }
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

const knownNumbers = [1, 2, 3, 4, 5];

const BigSign = ({ symbol, color }) => {
    const style = color === undefined ? "" : `color: ${color}`;
    return <div className="display" style={style}>{symbol}</div>;
}

const Success = () => <BigSign color="green" symbol="✓"/>;
const Fail = () => <BigSign symbol="&#x274C;"/>;

class Game extends Component {
    constructor(props) {
        super(props);
        this.guess = this.guess.bind(this);
        this.start = this.start.bind(this);
        this.random = new RandomGenerator(knownNumbers, 2);
    }
    getNextNumber() {
        if (this.state.nextNumber !== undefined) {
            const number = this.state.nextNumber;
            this.setState({nextNumber: undefined});
            return number;
        }
        return this.random.next();
    }
    guess(value) {
        console.assert(this.state.number !== undefined);
        const isSuccess = value === this.state.number;
        if (!isSuccess) {
            navigator.vibrate(200);
            this.setState({nextNumber: this.state.number});
        }
        this.setState({
            fullscreen: isSuccess ? 'success' : 'fail',
            number: undefined,
        });
    }
    start() {
        this.setState({
            fullscreen: undefined,
            number: this.getNextNumber(),
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
                {knownNumbers.map(value => {
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
    componentDidMount() {
        disableViewportZoom();
    }
    render() {
        return <Game/>;
    }
}
