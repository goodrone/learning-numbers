import './style';
import { Component } from 'preact';

const getRandom = (a, b) => {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

const PlayButton = ({ onClick }) => {
    return <button type="button" onClick={onClick}>▶</button>;
};

const getRange = n => Array.from(Array(n).keys());

const Figures = ({ number }) => {
    return (
        <div>{getRange(number).map(() => {
            return "⚫";
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
        this.setState({
            fullscreen: value === this.state.number ? 'success' : 'fail',
            number: undefined,
        });
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
        return (
            <div>
                <div className="display"><Figures number={number}/></div>
                <div className="buttons">
                    {getRange(9).map(i => {
                        const value = i + 1;
                        return (
                            <button type="button" onClick={() => this.guess(value)}>
                                {value}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
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
        return <div className="fullscreen"><Game/></div>;
    }
}
