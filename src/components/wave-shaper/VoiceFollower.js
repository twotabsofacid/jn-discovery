import { useState, useEffect, useRef } from 'react';
import { map } from '@/helpers/math';
import axios from 'axios';

export default function VoiceFollower({ id, activeTick }) {
  const [triangleVal, setTriangleVal] = useState(0);
  const [sineVal, setSineVal] = useState(0);
  const [squareVal, setSquareVal] = useState(0);
  const [maxFreq, setMaxFreq] = useState(50);
  const [minFreq, setMinFreq] = useState(-50);
  const triangleValRef = useRef(0);
  const sineValRef = useRef(0);
  const squareValRef = useRef(0);
  const maxFreqRef = useRef(50);
  const minFreqRef = useRef(-50);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const activeTickRef = useRef(0);
  const waveArrRef = useRef([]);
  const updateWaveArr = () => {
    for (let x = 0; x < ctxRef.current.canvas.width; x++) {
      let mappedX = map(x, 0, ctxRef.current.canvas.width, 0, Math.PI * 2);
      let p = Math.PI * 2;
      let yTriangle =
        2 *
        Math.abs(mappedX / p - Math.floor(mappedX / p + 1 / 2)) *
        triangleValRef.current;
      let ySine = map(Math.sin(mappedX), -1, 1, 0, 1) * sineValRef.current;
      let ySquare = (mappedX < Math.PI ? 1 : 0) * squareValRef.current;
      let y = yTriangle + ySine + ySquare;
      waveArrRef.current[x] = y;
    }
  };
  const draw = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    //Our first draw
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let x = 0; x < ctx.canvas.width; x++) {
      let y = waveArrRef.current[x];
      ctx.beginPath();
      ctx.moveTo(x, ctx.canvas.height);
      ctx.lineTo(x, map(y, 0, 1, ctx.canvas.height, 0));
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
    if (ctxRef.current) {
      const waveAmount =
        waveArrRef.current[
          Math.floor(activeTickRef.current * ctxRef.current.canvas.width)
        ];
      const freqShift = map(
        waveAmount,
        0,
        1,
        minFreqRef.current,
        maxFreqRef.current
      );
      console.log('we should send some shit', freqShift);
      axios({
        method: 'post',
        url: `http://localhost:1337/offset/${id}/${freqShift}`
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
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    ctxRef.current = context;
    draw(context);
  }, [draw]);
  useEffect(() => {
    for (let i = 0; i < 1400; i++) {
      waveArrRef.current[i] = 0;
    }
  }, []);
  return (
    <main className="h-auto flex flex-col m-3 p-3 border border-black">
      <div className="w-full flex justify-items-between pb-1 mb-6 border-b border-black">
        <h1 className="text-xl font-bold">voice {id}</h1>
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
              console.log('we should change...');
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
              console.log('we should change...');
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
              console.log('we should change...');
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
            name="offset"
            min={-100}
            max={100}
            step="1"
            value={maxFreq}
            className="w-full"
            onChange={(e) => {
              console.log('we should change...');
              maxFreqRef.current = parseInt(e.target.value);
              setMaxFreq(maxFreqRef.current);
            }}
          />
          <label htmlFor="offset" className="mb-3">
            Max Freq: {maxFreq}
          </label>
          <input
            type="range"
            name="offset"
            min={-100}
            max={100}
            step="1"
            value={minFreq}
            className="w-full"
            onChange={(e) => {
              console.log('we should change...');
              minFreqRef.current = parseInt(e.target.value);
              setMinFreq(minFreqRef.current);
            }}
          />
          <label htmlFor="offset" className="mb-3">
            Min Freq: {minFreq}
          </label>
        </div>
        <div className="w-[80%] flex mx-auto justify-between">
          <canvas
            className="w-full h-full"
            ref={canvasRef}
            width={512}
            height={256}
          />
        </div>
      </div>
    </main>
  );
}
