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

function pickRandom(arr) {
    return arr[arr.length * Math.random() << 0];
}

const textShapeFactory = codePoint => ({ cx, cy }) =>
    <text x={cx} y={cy} text-anchor="middle"
        dominant-baseline="central">{String.fromCodePoint(codePoint)}</text>;

const shapes = [
    9200, 9742, 9749, 9752, 9878, 9881, 9917, 9976, 9986, 127789, 127790,
    127791, 127792, 127793, 127794, 127795, 127796, 127797, 127798, 127799,
    127800, 127801, 127802, 127803, 127804, 127805, 127806, 127807, 127808,
    127809, 127810, 127811, 127812, 127813, 127814, 127815, 127816, 127817,
    127818, 127819, 127820, 127821, 127822, 127823, 127824, 127825, 127826,
    127827, 127828, 127829, 127830, 127831, 127835, 127836, 127838, 127839,
    127840, 127843, 127844, 127846, 127847, 127848, 127849, 127850, 127851,
    127852, 127854, 127856, 127858, 127859, 127861, 127869, 127871, 127873,
    127874, 127874, 127874, 127875, 127876, 127880, 127912, 127913, 127922,
    127925, 127926, 127927, 127928, 127929, 127930, 127931, 127952, 127989,
    128085, 128086, 128087, 128091, 128092, 128096, 128142, 128144, 128187,
    128190, 128239, 128251, 128274, 128295, 128298, 128374, 128421, 128722,
    129344, 129345, 129360, 129361, 129362, 129363, 129364, 129365, 129367,
    129369, 129370, 129371, 129372, 129373, 129374, 129375, 129379, 129381,
    129382, 129383, 129384, 129385, 129386, 129388, 129389, 129391, 129406,
    129472, 129473, 129507, 129508, 129510, 129521, 129522, 129525, 129526,
].map(textShapeFactory);

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
        const object = pickRandom(shapes);
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
        if (window.gtag) { window.gtag('event', 'Play'); }
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
