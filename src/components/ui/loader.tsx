import { Logo } from './logo';

export function Loader({ width = 180, height = 180 }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Logo width={width} height={height} />
      <p className="text-body font-bold">
        Carregando
        <span className="text-4xl animate-pulse"> .</span>
        <span className="text-4xl animate-pulse [animation-delay:0.2s]">.</span>
        <span className="text-4xl animate-pulse [animation-delay:0.4s]">.</span>
      </p>
    </div>
  );
}
