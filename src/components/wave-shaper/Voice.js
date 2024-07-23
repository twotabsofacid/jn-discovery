import { useState, useEffect, useRef } from 'react';
const minMidi = 21;
const maxMidi = 127;

export default function Voice({ id, globalMidi, setGlobalMidi }) {
  const globalMidiRef = useRef(globalMidi);
  return (
    <main className="h-auto flex flex-col m-3 p-3 border border-black">
      <div className="w-full flex justify-items-between pb-1 mb-6 border-b border-black">
        <h1 className="text-xl font-bold">voice {id}</h1>
      </div>
      <div className="flex w-full">
        <div className="w-[20%] px-3 flex flex-col justify-items-center items-center">
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
        </div>
      </div>
    </main>
  );
}
