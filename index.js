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

const knownNumbers = [1, 2, 3, 4, 5];

const BigSign = ({ symbol, color }) => {
    const style = color === undefined ? "" : `color: ${color}`;
    return <div className="display" style={style}>{symbol}</div>;
}

const Success = () => <BigSign color="green" symbol="✓"/>;
const Fail = () => <BigSign symbol="&#x274C;"/>;

const ObjectGrid = ({ object, dim, grid, viewport }) => {
    const step = Math.floor(Math.min(viewport[0] / dim[0], viewport[1] / dim[1]));
    const width = (dim[0]) * step;
    const height = (dim[1]) * step;
    const offsetX = (viewport[0] - width) / 2;
    const offsetY = (viewport[1] - height) / 2;
    return (
        <svg width={viewport[0]} height={viewport[1]}
                viewBox={`-${offsetX} -${offsetY} ${viewport[0]} ${viewport[1]}`}>
            { // DEBUG:
              // <rect stroke="silver" fill="none" width={width - 0.5} height={height - 0.5}/>
            }
            {grid.map(([x, y]) => <g>{object({
                cx: (x + .5) * step,
                cy: (y + .5) * step,
                step,
            })}{
                // DEBUG:
                // <rect stroke="none" fill="red" fill-opacity="0.2"
                //     x={x * step} y={y * step} width={step} height={step}/>
            }</g>)}
        </svg>
    );
};

function createRandomGrid(dim, n) {
    const grid = [];
    const known = new Set();
    while (grid.length < n) {
        const x = Math.floor(Math.random() * dim[0]);
        const y = Math.floor(Math.random() * dim[1]);
        const value = x * dim[0] + y;
        if (known.has(value)) {
            continue;
        }
        known.add(value);
        grid.push([x, y]);
    }
    return grid;
}

function randomProperty(obj) {
    const keys = Object.keys(obj)
    return obj[keys[keys.length * Math.random() << 0]];
}

const textShapeFactory = text => ({ cx, cy }) =>
    <text x={cx} y={cy} text-anchor="middle"
        dominant-baseline="central">{text}</text>;

const shapes = {
    flower: textShapeFactory(String.fromCharCode(10048)),
    heart: textShapeFactory(String.fromCharCode(9829)),
    catFace: textShapeFactory(String.fromCodePoint(0x1F431)),
    cat: textShapeFactory(String.fromCodePoint(0x1F408)),
    avocado: textShapeFactory(String.fromCodePoint(0x1F951)),
    lemon: textShapeFactory(String.fromCodePoint(0x1F34B)),
    boat: textShapeFactory(String.fromCodePoint(0x26F5)),
    alarmClock: textShapeFactory(String.fromCodePoint(0x23F0)),
    umbrella: textShapeFactory(String.fromCodePoint(0x2614)),
    telephone: textShapeFactory(String.fromCodePoint(0x260F)),
    circle: ({ cx, cy, step }) =>
        <circle cx={cx} cy={cy} r={step * 0.4} fill="black" stroke="none"/>,
};

class FigureGrid extends Component {
    componentDidMount() {
        const p = this.elem.parentElement;
        const newState = {viewport: [p.offsetWidth, p.offsetHeight]};
        // FIXME: without the following, the parent element (p) grows a little
        // bit vertically
        p.style = `width: ${p.offsetWidth}px; height: ${p.offsetHeight}px`;
        this.setState(newState);
    }
    render({ num }, { viewport }) {
        if (viewport === undefined) {
            return <div ref={c => this.elem = c} style="height: 100%"/>;
        }
        const object = randomProperty(shapes);
        const step = 100;
        const dim = [4, 4];
        const grid = createRandomGrid(dim, num);
        return (
            <ObjectGrid viewport={viewport}
                object={object} grid={grid} step={step} dim={dim}/>
        );
    }
}

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
            <div className="display">
                <div style="flex: 1; width: 100%">
                    <FigureGrid num={this.state.number}/>
                </div>
            </div>,
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
