import Link from 'next/link';

export default function WaveShaper() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24`}
    >
      <Link href="sequencer" className="text-xl underline py-4">
        Sequencer
      </Link>
      <Link href="wave-shaper" className="text-xl underline py-4">
        Wave Shaper
      </Link>
    </main>
  );
}
