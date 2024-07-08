import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Voice from '@/components/sequencer/Voice';
import VoiceFollower from '@/components/sequencer/VoiceFollower';

const maxBpm = 1080;

const wait = (timeout) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, timeout);
  });
};

export default function Sequencer() {
  const [activeTick, setActiveTick] = useState(0);
  const [globalToggle, setGlobalToggle] = useState(false);
  const [bpm, setBpm] = useState(maxBpm / 2);
  const [globalMidi, setGlobalMidi] = useState(60);
  const transportRef = useRef(null);
  const activeTickRef = useRef(0);
  const bpmRef = useRef(maxBpm / 2);
  useEffect(() => {
    bpmRef.current = bpm;
    if (globalToggle) {
      clearInterval(transportRef.current);
      // Start up the sequencer...
      transportRef.current = setInterval(() => {
        activeTickRef.current = (activeTickRef.current + 1) % 16;
        setActiveTick(activeTickRef.current);
      }, (60 / bpmRef.current) * 1000);
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
    if (globalToggle) {
      // Start up the sequencer...
      transportRef.current = setInterval(() => {
        activeTickRef.current = (activeTickRef.current + 1) % 16;
        setActiveTick(activeTickRef.current);
      }, (60 / bpmRef.current) * 1000);
    } else {
      // stop the sequencer...
      clearInterval(transportRef.current);
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
          min="1"
          className="w-full"
          max={maxBpm}
          onChange={(e) => {
            setBpm(parseInt(e.target.value));
          }}
        />
        <label htmlFor="bpm" className="mb-3">
          BPM: {bpm}
        </label>
      </section>
      <section className="flex flex-col">
        <Voice id={0} globalMidi={globalMidi} setGlobalMidi={setGlobalMidi} />
        <VoiceFollower id={1} activeTick={activeTick} />
        <VoiceFollower id={2} activeTick={activeTick} />
      </section>
    </main>
  );
}
