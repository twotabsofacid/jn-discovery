import { useState, useEffect, useRef } from 'react';
import { map } from '@/helpers/math';
import axios from 'axios';

export default function VoiceFollower({ id, activeTick }) {
  const [maxFreq, setMaxFreq] = useState(50);
  const [minFreq, setMinFreq] = useState(-50);
  const [checkboxes, setCheckboxes] = useState([]);
  const checkboxesRef = useRef([]);
  const maxFreqRef = useRef(50);
  const minFreqRef = useRef(-50);
  /**
   * Turn a box on or off
   *
   * @param {int} x x pos
   * @param {int} y y pos
   */
  const toggleBox = (x, y) => {
    checkboxesRef.current[x][y].on = !checkboxesRef.current[x][y].on;
    setCheckboxes([...checkboxesRef.current]);
  };
  /**
   * Create boxes
   */
  useEffect(() => {
    let checks = [];
    for (let i = 0; i < 16; i++) {
      checks[i] = [];
      for (let j = 0; j < 6; j++) {
        checks[i][j] = { value: `${i},${j}`, row: j, column: i, on: false };
      }
    }
    checkboxesRef.current = checks;
    setCheckboxes(checkboxesRef.current);
  }, []);
  /**
   * Every time we get a tick, send a POST request with
   * appropriate data in order to update our soundz
   */
  useEffect(() => {
    let box = checkboxesRef.current[activeTick].filter((elem) => elem.on);
    if (box.length) {
      // Freq to send back...
      const freqShift = Math.round(
        map(box[0].row, 5, 0, minFreqRef.current, maxFreqRef.current)
      );
      axios({
        method: 'post',
        url: `http://localhost:1337/offset/${id}/${freqShift}`
      })
        .then((res) => {
          console.log('got res', res);
        })
        .catch((err) => {
          console.log('ERROR', err);
        });
    }
  }, [activeTick]);
  return (
    <main className="h-auto flex flex-col m-3 p-3 border border-black">
      <div className="w-full flex justify-items-between pb-1 mb-6 border-b border-black">
        <h1 className="text-xl font-bold">voice {id}</h1>
      </div>
      <div className="flex w-full">
        <div className="w-[20%] px-3 flex flex-col justify-items-center items-center">
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
            Max Freq: {minFreq}
          </label>
        </div>
        <div className="w-[80%] flex mx-auto justify-between">
          {checkboxes.map((boxRow, index) => {
            return (
              <div
                key={index}
                className={`flex flex-col justify-between tick-col ${
                  activeTick === index ? 'bg-blue-400' : ''
                }`}
              >
                <>
                  {boxRow.map((box) => {
                    return (
                      <input
                        key={box.value}
                        type="checkbox"
                        value={box.value}
                        checked={box.on}
                        className={`tick ${
                          activeTick === index ? 'bg-blue-400' : 'bg-white'
                        }`}
                        onChange={(e) => {
                          toggleBox(
                            box.value.split(',')[0],
                            box.value.split(',')[1]
                          );
                        }}
                      ></input>
                    );
                  })}
                </>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
