import { useState, useEffect, useRef } from 'react';
import { map } from '@/helpers/math';
import axios from 'axios';
const minOffsetConst = 1;
const maxOffsetConst = 99;

export default function VoiceFollower({ id, activeTick }) {
  const [triangleVal, setTriangleVal] = useState(0);
  const [sineVal, setSineVal] = useState(0);
  const [squareVal, setSquareVal] = useState(0);
  const [waveOffset, setWaveOffset] = useState(0);
  const [maxOffset, setMaxOffset] = useState(maxOffsetConst);
  const [minOffset, setMinOffset] = useState(minOffsetConst);
  const triangleValRef = useRef(0);
  const sineValRef = useRef(0);
  const squareValRef = useRef(0);
  const waveOffsetRef = useRef(0);
  const maxOffsetRef = useRef(maxOffsetConst);
  const minOffsetRef = useRef(minOffsetConst);
  const offsetCanvasRef = useRef(null);
  const offsetCtxRef = useRef(null);
  const activeTickRef = useRef(0);
  const waveArrRef = useRef([]);
  const updateWaveArr = () => {
    for (let x = 0; x < offsetCtxRef.current.canvas.width; x++) {
      let mappedX = map(
        x,
        0,
        offsetCtxRef.current.canvas.width,
        0,
        Math.PI * 2
      );
      let p = Math.PI * 2;
      let yTriangle =
        map(
          2 * Math.abs(mappedX / p - Math.floor(mappedX / p + 1 / 2)),
          0,
          1,
          -0.5,
          0.5
        ) * triangleValRef.current;
      let ySine = map(Math.sin(mappedX), -1, 1, -0.5, 0.5) * sineValRef.current;
      let ySquare = (mappedX < Math.PI ? 0.5 : -0.5) * squareValRef.current;
      let y = yTriangle + ySine + ySquare;
      waveArrRef.current[x] = y;
    }
  };
  const drawOffset = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    //Our first draw
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let x = 0; x < ctx.canvas.width; x++) {
      let mappedOffset = Math.floor(
        map(waveOffsetRef.current, 0, 1, 0, ctx.canvas.width)
      );
      let newX = (x + mappedOffset) % ctx.canvas.width;
      let y = waveArrRef.current[newX];
      ctx.beginPath();
      ctx.moveTo(x, ctx.canvas.height);
      ctx.lineTo(x, map(y, -0.5, 0.5, ctx.canvas.height, 0));
      ctx.stroke();
    }
    ctx.strokeStyle = '#ff5566';
    ctx.moveTo(activeTickRef.current * ctx.canvas.width, ctx.canvas.height);
    ctx.lineTo(activeTickRef.current * ctx.canvas.width, 0);
    ctx.stroke();
  };
  useEffect(() => {
    activeTickRef.current = activeTick;
    // Fetch the appropriate element from waveArrRef
    if (offsetCtxRef.current) {
      const mappedOffset = Math.floor(
        map(waveOffsetRef.current, 0, 1, 0, offsetCtxRef.current.canvas.width)
      );
      const currentPlaceInCanvas = Math.floor(
        activeTickRef.current * offsetCtxRef.current.canvas.width
      );
      const offsetPlaceInCanvas =
        (currentPlaceInCanvas + mappedOffset) %
        offsetCtxRef.current.canvas.width;
      const waveAmount = waveArrRef.current[offsetPlaceInCanvas];
      let offsetShift = map(
        waveAmount,
        -0.5,
        0.5,
        minOffsetRef.current,
        maxOffsetRef.current
      );
      axios({
        method: 'post',
        url: `http://localhost:1337/duty/${id}/${offsetShift}`
      })
        .then((res) => {
          // console.log('got res', res);
        })
        .catch((err) => {
          console.log('ERROR', err);
        });
    }
  }, [activeTick]);
  useEffect(() => {
    const canvas = offsetCanvasRef.current;
    const context = canvas.getContext('2d');
    offsetCtxRef.current = context;
    drawOffset(context);
  }, [drawOffset]);
  useEffect(() => {
    for (let i = 0; i < 1400; i++) {
      waveArrRef.current[i] = 0;
    }
  }, []);
  return (
    <main className="h-auto flex flex-col m-3 p-3 border border-black">
      <div className="w-full flex justify-items-between pb-1 mb-6 border-b border-black">
        <h1 className="text-xl font-bold">voice {id}: Duty</h1>
      </div>
      <div className="flex w-full">
        <div className="w-[20%] px-3 flex flex-col justify-items-center items-center">
          <input
            type="range"
            name="triangle"
            id="triangle"
            min={0}
            max={1}
            step="0.01"
            value={triangleVal}
            className="w-full"
            onChange={(e) => {
              triangleValRef.current = parseFloat(e.target.value);
              setTriangleVal(triangleValRef.current);
              updateWaveArr();
            }}
          />
          <label htmlFor="midi" className="mb-3">
            Triangle: {triangleVal}
          </label>
          <input
            type="range"
            name="sine"
            id="sine"
            min={0}
            max={1}
            step="0.01"
            value={sineVal}
            className="w-full"
            onChange={(e) => {
              sineValRef.current = parseFloat(e.target.value);
              setSineVal(sineValRef.current);
              updateWaveArr();
            }}
          />
          <label htmlFor="midi" className="mb-3">
            Sine: {sineVal}
          </label>
          <input
            type="range"
            name="square"
            id="square"
            min={0}
            max={1}
            step="0.01"
            value={squareVal}
            className="w-full"
            onChange={(e) => {
              squareValRef.current = parseFloat(e.target.value);
              setSquareVal(squareValRef.current);
              updateWaveArr();
            }}
          />
          <label htmlFor="midi" className="mb-3">
            Square: {squareVal}
          </label>
          <input
            type="range"
            name="waveoffset"
            id="waveoffset"
            min={0}
            max={1}
            step="0.01"
            value={waveOffset}
            className="w-full"
            onChange={(e) => {
              waveOffsetRef.current = parseFloat(e.target.value);
              setWaveOffset(waveOffsetRef.current);
              // updateWaveArr();
            }}
          />
          <label htmlFor="waveoffset" className="mb-3">
            Wave Offset: {waveOffset}
          </label>
          <input
            type="range"
            name="offset"
            min={minOffsetConst}
            max={maxOffsetConst}
            step="1"
            value={maxOffset}
            className="w-full"
            onChange={(e) => {
              maxOffsetRef.current = parseInt(e.target.value);
              setMaxOffset(maxOffsetRef.current);
            }}
          />
          <label htmlFor="offset" className="mb-3">
            Max Duty: {maxOffset}
          </label>
          <input
            type="range"
            name="offset"
            min={minOffsetConst}
            max={maxOffsetConst}
            step="1"
            value={minOffset}
            className="w-full"
            onChange={(e) => {
              minOffsetRef.current = parseInt(e.target.value);
              setMinOffset(minOffsetRef.current);
            }}
          />
          <label htmlFor="offset" className="mb-3">
            Min Duty: {minOffset}
          </label>
        </div>
        <div className="w-[80%] flex mx-auto justify-between">
          <canvas
            className="w-full h-full"
            ref={offsetCanvasRef}
            width={512}
            height={256}
          />
        </div>
      </div>
    </main>
  );
}
