import './style';
import { Component } from 'preact';

function disableViewportZoom() {
    const viewport = document.querySelector("meta[name=viewport]");
    const oldValue = viewport.getAttribute("content");
    viewport.setAttribute("content", oldValue + ",user-scalable=no");
}

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
    }
    getNextNumber() {
        if (this.state.nextNumber !== undefined) {
            const number = this.state.nextNumber;
            this.setState({nextNumber: undefined});
            return number;
        }
        return getRandom(1, 5);
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
    componentDidMount() {
        disableViewportZoom();
    }
    render() {
        return <Game/>;
    }
}
