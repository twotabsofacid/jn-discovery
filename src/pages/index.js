import Link from 'next/link';

export default function Home() {
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
      <Link href="morpher" className="text-xl underline py-4">
        Morpher
      </Link>
    </main>
  );
}
