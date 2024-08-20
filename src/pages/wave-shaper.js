import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Voice from '@/components/wave-shaper/Voice';
import VoiceFollowerFreq from '@/components/wave-shaper/VoiceFollowerFreq';
import VoiceFollowerDuty from '@/components/wave-shaper/VoiceFollowerDuty';
import VoiceFollowerVolume from '@/components/wave-shaper/VoiceFollowerVolume';

const maxBpm = 60;
const totalTicks = 120;
const globalTickRate = 200;

export default function WaveShaper() {
  const [activeTick, setActiveTick] = useState(0);
  const [globalToggle, setGlobalToggle] = useState(false);
  const [bpm, setBpm] = useState(maxBpm / 2);
  const [globalMidi, setGlobalMidi] = useState(60);
  const transportRef = useRef(null);
  const activeTickRef = useRef(0);
  const bpmRef = useRef(maxBpm / 2);
  const incrementerRef = useRef(120 / (60 / maxBpm / 0.2));
  const [download, setDownload] = useState(false);
  const dlAnchorRef = useRef(null);
  const doDownload = () => {
    axios({
      method: 'post',
      url: `http://localhost:1337/download`,
      data: { reset: true }
    }).then((res) => {
      console.log('got a res', res);
      setDownload(true);
      setTimeout(() => {
        setDownload(false);
        axios({
          method: 'post',
          url: `http://localhost:1337/download`,
          data: { download: true }
        }).then((res) => {
          var dataStr =
            'data:text/json;charset=utf-8,' +
            encodeURIComponent(JSON.stringify(res.data.response));
          dlAnchorRef.current.setAttribute('href', dataStr);
          dlAnchorRef.current.setAttribute('download', 'sequence.json');
          dlAnchorRef.current.click();
        });
      }, 1000);
    });
  };
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
        <button className="p-3 bg-yellow-400 mx-3" onClick={doDownload}>
          Download
        </button>
      </section>
      <section className="flex flex-col">
        <Voice id={0} globalMidi={globalMidi} setGlobalMidi={setGlobalMidi} />
        <VoiceFollowerFreq
          id={0}
          download={download}
          activeTick={activeTick / totalTicks}
        />
        <VoiceFollowerDuty
          id={0}
          download={download}
          activeTick={activeTick / totalTicks}
        />
        {/* <VoiceFollowerVolume id={0} activeTick={activeTick / totalTicks} /> */}
        <VoiceFollowerFreq
          id={1}
          download={download}
          activeTick={activeTick / totalTicks}
        />
        <VoiceFollowerDuty
          id={1}
          download={download}
          activeTick={activeTick / totalTicks}
        />
        {/* <VoiceFollowerVolume id={1} activeTick={activeTick / totalTicks} /> */}
        <VoiceFollowerFreq
          id={2}
          download={download}
          activeTick={activeTick / totalTicks}
        />
        <VoiceFollowerDuty
          id={2}
          download={download}
          activeTick={activeTick / totalTicks}
        />
        {/* <VoiceFollowerVolume id={2} activeTick={activeTick / totalTicks} /> */}
      </section>
      <a href="" ref={dlAnchorRef} className="hidden">
        DL
      </a>
    </main>
  );
}
