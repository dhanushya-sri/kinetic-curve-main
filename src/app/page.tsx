import { KineticCurve } from '@/components/kinetic-curve';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl font-headline">
          Kinetic Curve
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          An interactive cubic Bézier curve reacting to your mouse movement.
        </p>
      </div>
      <div className="w-full max-w-6xl aspect-video rounded-lg shadow-2xl overflow-hidden border bg-white">
        <KineticCurve />
      </div>
    </main>
  );
}
