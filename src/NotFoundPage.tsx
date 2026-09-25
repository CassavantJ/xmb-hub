import { Background } from './components/Background/Background';
import { Clock } from './components/Clock/Clock';
import { NotFound } from './components/NotFound/NotFound';
import { InputProvider } from './input/InputProvider';
import { useAppearance } from './theme/useAppearance';

/** The standalone 404.html page, served with a real 404 status for unknown addresses. */
export function NotFoundPage() {
  const { reducedMotion, waveTint } = useAppearance();
  return (
    <InputProvider>
      <Background waveTint={waveTint} animate={!reducedMotion} paused={false} />
      <Clock />
      <NotFound />
    </InputProvider>
  );
}
