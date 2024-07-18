import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Voice from '@/components/wave-shaper/Voice';
import VoiceFollower from '@/components/wave-shaper/VoiceFollower';

const maxBpm = 10;
const totalTicks = 120;

export default function WaveShaper() {
  const [activeTick, setActiveTick] = useState(0);
  const [globalToggle, setGlobalToggle] = useState(false);
  const [bpm, setBpm] = useState(maxBpm / 2);
  const [globalMidi, setGlobalMidi] = useState(60);
  const transportRef = useRef(null);
  const activeTickRef = useRef(0);
  const bpmRef = useRef(maxBpm / 2);
  const incrementerRef = useRef(120 / (60 / maxBpm / 2 / 0.05));
  // not bpm but... blocks per minute
  // 1 block per minute means it goes through one whole block in a minute
  // 60 blocks per minute means it goes through 60 blocks in a minute
  // so the interval stays constant
  // what changes is the modulus... or how much ur increasing
  // the active tick by (e.g. for 1 blocks per minute
  // you either have the modulus be 1000, or increase by 0.01)
  useEffect(() => {
    bpmRef.current = bpm;
    incrementerRef.current = 120 / (60 / bpm / 0.05);
    console.log(incrementerRef.current);
    if (globalToggle) {
      clearInterval(transportRef.current);
      // Start up the sequencer...
      transportRef.current = setInterval(() => {
        activeTickRef.current =
          (activeTickRef.current + incrementerRef.current) % totalTicks;
        setActiveTick(activeTickRef.current);
      }, 50);
    }
  }, [bpm]);
  useEffect(() => {
    console.log('got some global midi', globalMidi);
    axios({
      method: 'post',
      url: `http://localhost:1337/note_on/0/${globalMidi}`
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
              url: `http://localhost:1337/note_on/2/${globalMidi}`
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
      }, 50);
    }
  }, [globalToggle]);
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
      </section>
      <section className="flex flex-col">
        <Voice id={0} globalMidi={globalMidi} setGlobalMidi={setGlobalMidi} />
        <VoiceFollower id={1} activeTick={activeTick / totalTicks} />
        <VoiceFollower id={2} activeTick={activeTick / totalTicks} />
      </section>
    </main>
  );
}
