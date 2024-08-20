import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { map } from '@/helpers/math';

const maxBpm = 20;
const totalTicks = 120;
const globalTickRate = 200;
const minMidi = 21;
const maxMidi = 127;

export default function Morpher() {
  const [activeTick, setActiveTick] = useState(0);
  const [globalToggle, setGlobalToggle] = useState(false);
  const [bpm, setBpm] = useState(maxBpm / 2);
  const [globalMidi, setGlobalMidi] = useState(60);
  const transportRef = useRef(null);
  const activeTickRef = useRef(0);
  const bpmRef = useRef(maxBpm / 2);
  const incrementerRef = useRef(120 / (60 / maxBpm / 2 / 0.2));
  const sequences = useRef([]);
  const [morph, setMorph] = useState(0);
  const morphRef = useRef(0);
  useEffect(() => {
    bpmRef.current = bpm;
    incrementerRef.current = 120 / (60 / bpm / 0.2);
    console.log(incrementerRef.current);
    if (globalToggle) {
      clearInterval(transportRef.current);
      // Start up the sequencer...
      transportRef.current = setInterval(() => {
        activeTickRef.current =
          (activeTickRef.current + incrementerRef.current) % totalTicks;
        setActiveTick(activeTickRef.current);
      }, globalTickRate);
    }
  }, [bpm]);
  useEffect(() => {
    console.log('got some global midi', globalMidi);
    axios({
      method: 'post',
      url: `http://localhost:1337/note_on/0/${globalMidi - 12}`
    })
      .then((res) => {
        console.log('got res', res);
        axios({
          method: 'post',
          url: `http://localhost:1337/note_on/1/${globalMidi}`
        })
          .then((res) => {
            console.log('got res', res);
            axios({
              method: 'post',
              url: `http://localhost:1337/note_on/2/${globalMidi + 24}`
            })
              .then((res) => {
                console.log('got res', res);
              })
              .catch((err) => {
                console.log('ERROR', err);
              });
          })
          .catch((err) => {
            console.log('ERROR', err);
          });
      })
      .catch((err) => {
        console.log('ERROR', err);
      });
  }, [globalMidi]);
  useEffect(() => {
    console.log(globalToggle);
    clearInterval(transportRef.current);
    if (globalToggle) {
      // Start up the sequencer...
      transportRef.current = setInterval(() => {
        activeTickRef.current =
          (activeTickRef.current + incrementerRef.current) % totalTicks;
        setActiveTick(activeTickRef.current);
      }, globalTickRate);
    }
  }, [globalToggle]);
  useEffect(() => {
    if (sequences.current.length) {
      // console.log(activeTick / totalTicks);
      const percentage = activeTick / totalTicks;
      const arrLocation = Math.round(map(percentage, 0, 1, 0, 512));
      // get freq and duty for all three voices
      for (let i = 0; i < 3; i++) {
        const freq = map(
          morphRef.current,
          0,
          1,
          sequences.current[0][i].freq[arrLocation],
          sequences.current[1][i].freq[arrLocation]
        );
        const duty = map(
          morphRef.current,
          0,
          1,
          sequences.current[0][i].duty[arrLocation],
          sequences.current[1][i].duty[arrLocation]
        );
        axios({
          method: 'post',
          url: `http://localhost:1337/frequency/${i}/${freq}`
        })
          .then((res) => {
            // console.log('got res', res);
          })
          .catch((err) => {
            console.log('ERROR', err);
          });
        axios({
          method: 'post',
          url: `http://localhost:1337/duty/${i}/${duty}`
        })
          .then((res) => {
            // console.log('got res', res);
          })
          .catch((err) => {
            console.log('ERROR', err);
          });
      }
    }
  }, [activeTick]);
  return (
    <main className="flex flex-col">
      <section className="flex m-3 items-center justify-center">
        <button
          className="p-3 bg-green-400 mx-3"
          onClick={() => {
            setGlobalToggle(true);
          }}
        >
          Start All
        </button>
        <button
          className="p-3 bg-red-400 mx-3"
          onClick={() => {
            setGlobalToggle(false);
          }}
        >
          Stop All
        </button>
        <section className="w-[60%]">
          <input
            type="range"
            name="bpm"
            min="0.01"
            step="0.01"
            className="w-full"
            max={maxBpm}
            onChange={(e) => {
              setBpm(parseFloat(e.target.value));
            }}
          />
          <label htmlFor="bpm" className="mb-3">
            Blocks Per Minute: {bpm}
          </label>
          <h3>
            Duration per block: {Math.floor(60 / bpm / 60)}:
            {
              ((60 / bpm / 60 - Math.floor(60 / bpm / 60)) * 0.6)
                .toFixed(2)
                .toString()
                .split('.')[1]
            }
          </h3>
        </section>
      </section>
      <section className="w-[80vw] mx-auto my-3">
        <input
          type="range"
          name="midi"
          id="midi"
          min={minMidi}
          max={maxMidi}
          value={globalMidi}
          className="w-full"
          onChange={(e) => {
            setGlobalMidi(parseInt(e.target.value));
          }}
        />
        <label htmlFor="midi" className="mb-3">
          Midi: {globalMidi}
        </label>
      </section>
      <section className="flex flex-col">
        <input
          type="file"
          name="sequence-1"
          accept="application/JSON"
          className="my-3 w-[80vw] mx-auto"
          onChange={(e) => {
            console.log('what the fuck bro', e.target.files[0]);
            const fr = new FileReader();
            fr.onload = (e) => {
              console.log(JSON.parse(e.target.result));
              sequences.current[0] = JSON.parse(e.target.result);
            };
            fr.readAsText(e.target.files[0]);
          }}
        />
        <input
          type="file"
          name="sequence-2"
          accept="application/JSON"
          className="my-3 w-[80vw] mx-auto"
          onChange={(e) => {
            console.log('what the fuck bro', e.target.files[0]);
            const fr = new FileReader();
            fr.onload = (e) => {
              console.log(JSON.parse(e.target.result));
              sequences.current[1] = JSON.parse(e.target.result);
            };
            fr.readAsText(e.target.files[0]);
          }}
        />
        <div className="w-[80vw] h-[14px] border-2 my-3 mx-auto relative">
          <div
            className="absolute w-[4px] h-[10px] left-0 top-0 bg-orange-600"
            style={{
              width: `${(activeTick / totalTicks) * 80}vw`
            }}
          ></div>
        </div>
        <div className="w-[80vw] my-6 mx-auto">
          <input
            type="range"
            name="bpm"
            min="0"
            step="0.01"
            className="w-full"
            max={1}
            value={morph}
            onChange={(e) => {
              morphRef.current = parseFloat(e.target.value);
              setMorph(morphRef.current);
            }}
          />
          <label htmlFor="bpm" className="mb-3">
            Morph: {morph}
          </label>
        </div>
      </section>
    </main>
  );
}
