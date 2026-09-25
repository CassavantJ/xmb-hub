import { useEffect, useMemo, useState } from 'react';

import { AboutPanel } from './components/AboutPanel/AboutPanel';
import { AppViewer } from './components/AppViewer/AppViewer';
import { Background } from './components/Background/Background';
import { BootIntro } from './components/BootIntro/BootIntro';
import { hasSeenIntro, markIntroSeen } from './components/BootIntro/introSeen';
import { Clock } from './components/Clock/Clock';
import { SettingsPanel } from './components/SettingsPanel/SettingsPanel';
import { Xmb } from './components/Xmb/Xmb';
import { apps } from './data/apps';
import { site } from './data/site';
import { InputProvider } from './input/InputProvider';
import { openLink } from './lib/links';
import { useReducedMotion } from './lib/motion';
import { useMonth } from './lib/useMonth';
import { defaultPosition, locateItem, menu } from './menu/menu';
import type { MenuAction } from './menu/types';
import { useRoute } from './router/useRoute';
import type { ChoiceSetting } from './settings/options';
import { usePreferences } from './settings/preferences';
import { resolveTheme, waveTint } from './theme/palette';
import { useThemeVariables } from './theme/useTheme';

type Panel = 'about' | ChoiceSetting;
type IntroPhase = 'playing' | 'revealing' | 'done';

/** Apps that can be opened at /app/<id>. */
function findEmbeddedApp(id: string) {
  return apps.find(
    (app) => app.id === id && app.openMode === 'embedded' && app.status !== 'coming-soon',
  );
}

export function App() {
  const { route, navigate, back } = useRoute();
  const preferences = usePreferences();
  const reducedMotion = useReducedMotion(preferences.motion);
  const month = useMonth();
  const theme = useMemo(() => resolveTheme(preferences.theme, month), [preferences.theme, month]);
  const tint = useMemo(() => waveTint(theme), [theme]);
  useThemeVariables(theme);

  const [panel, setPanel] = useState<Panel | null>(null);
  // The intro plays once, on a first visit to the menu itself (not a deep link), with motion on.
  const [intro, setIntro] = useState<IntroPhase>(() =>
    route.kind === 'home' && !reducedMotion && !hasSeenIntro() ? 'playing' : 'done',
  );
  // A deep link to /app/<id> preselects that app, so closing it lands on it in the menu.
  const [initialPosition] = useState(
    () => (route.kind === 'app' ? locateItem(menu, route.appId) : null) ?? defaultPosition,
  );
  const viewing = route.kind === 'app' ? findEmbeddedApp(route.appId) : undefined;

  useEffect(() => {
    // Unknown or non-embeddable app ids fall back to the menu. Phase 4 adds a real 404 page.
    if (route.kind === 'app' && !viewing) window.history.replaceState(null, '', '/');
  }, [route, viewing]);

  const open = (action: MenuAction) => {
    switch (action.kind) {
      case 'link':
        openLink(action.href, action.newTab);
        break;
      case 'embed':
        navigate(action.href);
        break;
      case 'panel':
        setPanel(action.panel);
        break;
      case 'setting':
        if (action.setting === 'intro') setIntro('playing');
        else setPanel(action.setting);
        break;
      case 'none':
        break;
    }
  };

  const closePanel = () => {
    setPanel(null);
  };

  return (
    <InputProvider>
      <Background waveTint={tint} animate={!reducedMotion} paused={viewing !== undefined} />
      <Clock />
      <main>
        <h1 className="sr-only">{site.name}: apps, games, tools and projects</h1>
        <p className="sr-only">
          Use the arrow keys to browse, Enter to open and Escape to go back. Game controllers work
          too.
        </p>
        <Xmb menu={menu} initial={initialPosition} onOpen={open} entering={intro === 'playing'} />
      </main>
      {panel === 'about' && <AboutPanel onClose={closePanel} />}
      {panel !== null && panel !== 'about' && (
        <SettingsPanel setting={panel} onClose={closePanel} />
      )}
      {viewing && (
        <AppViewer
          app={viewing}
          onClose={() => {
            back('/');
          }}
        />
      )}
      {intro !== 'done' && (
        <BootIntro
          onReveal={() => {
            setIntro('revealing');
          }}
          onDone={() => {
            markIntroSeen();
            setIntro('done');
          }}
        />
      )}
    </InputProvider>
  );
}
