import { Loader } from '@/components/ui/loader';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <Loader width={100} height={100} />
    </div>
  );
}
