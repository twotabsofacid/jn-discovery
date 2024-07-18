import { useState, useEffect, useRef } from 'react';
import { map } from '@/helpers/math';
import axios from 'axios';
const minOffsetConst = -20;
const maxOffsetConst = 20;
const offsetTypes = ['frequency', 'volume', 'duty'];

export default function VoiceFollower({ id, activeTick }) {
  const [triangleVal, setTriangleVal] = useState(0);
  const [sineVal, setSineVal] = useState(0);
  const [squareVal, setSquareVal] = useState(0);
  const [maxOffset, setMaxOffset] = useState(maxOffsetConst / 2);
  const [minOffset, setMinOffset] = useState(minOffsetConst / 2);
  const triangleValRef = useRef(0);
  const sineValRef = useRef(0);
  const squareValRef = useRef(0);
  const maxOffsetRef = useRef(maxOffsetConst / 2);
  const minOffsetRef = useRef(minOffsetConst / 2);
  const offsetCanvasRef = useRef(null);
  const offsetCtxRef = useRef(null);
  const activeTickRef = useRef(0);
  const waveArrRef = useRef([]);
  const [offsetType, setOffsetType] = useState('frequency');
  const offsetTypeRef = useRef('frequency');
  const [frequencyOffset, setFrequencyOffset] = useState(0);
  const frequencyOffsetRef = useRef(0);
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
        2 *
        Math.abs(mappedX / p - Math.floor(mappedX / p + 1 / 2)) *
        triangleValRef.current;
      let ySine = map(Math.sin(mappedX), -1, 1, 0, 1) * sineValRef.current;
      let ySquare = (mappedX < Math.PI ? 1 : 0) * squareValRef.current;
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
    if (offsetCtxRef.current) {
      const waveAmount =
        waveArrRef.current[
          Math.floor(activeTickRef.current * offsetCtxRef.current.canvas.width)
        ];
      const offsetShift = map(
        waveAmount,
        0,
        1,
        minOffsetRef.current,
        maxOffsetRef.current
      );
      console.log('we should send some shit', offsetShift);
      axios({
        method: 'post',
        url: `http://localhost:1337/${offsetTypeRef.current}/${id}/${offsetShift}`
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
    axios({
      method: 'post',
      url: `http://localhost:1337/frequency/${id}/${frequencyOffset}`
    })
      .then((res) => {
        console.log('got res', res);
      })
      .catch((err) => {
        console.log('ERROR', err);
      });
  }, [frequencyOffset]);
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
          <select
            name="offsetType"
            className="w-full text-black"
            onChange={(e) => {
              console.log(e.target.value);
              offsetTypeRef.current = e.target.value;
              setOffsetType(offsetTypeRef.current);
            }}
          >
            {offsetTypes.map((type) => {
              return (
                <option key={type} value={type}>
                  {type}
                </option>
              );
            })}
          </select>
          <label htmlFor="offsetType" className="mb-3">
            Offset Type
          </label>
          {(offsetType === 'volume' || offsetType === 'duty') && (
            <>
              <input
                type="range"
                name="frequencyOffset"
                min={minOffsetConst}
                max={maxOffsetConst}
                step="1"
                value={frequencyOffset}
                className="w-full"
                onChange={(e) => {
                  console.log('we should change...');
                  frequencyOffsetRef.current = parseInt(e.target.value);
                  setFrequencyOffset(frequencyOffsetRef.current);
                }}
              />
              <label htmlFor="offset" className="mb-3">
                Frequency Offset: {frequencyOffset}
              </label>
            </>
          )}
          <input
            type="range"
            name="offset"
            min={minOffsetConst}
            max={maxOffsetConst}
            step="1"
            value={maxOffset}
            className="w-full"
            onChange={(e) => {
              console.log('we should change...');
              maxOffsetRef.current = parseInt(e.target.value);
              setMaxOffset(maxOffsetRef.current);
            }}
          />
          <label htmlFor="offset" className="mb-3">
            Max Offset: {maxOffset}
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
              console.log('we should change...');
              minOffsetRef.current = parseInt(e.target.value);
              setMinOffset(minOffsetRef.current);
            }}
          />
          <label htmlFor="offset" className="mb-3">
            Min Offset: {minOffset}
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
