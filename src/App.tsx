import { useEffect, useState } from 'react';

import { AboutPanel } from './components/AboutPanel/AboutPanel';
import { AppViewer } from './components/AppViewer/AppViewer';
import { Background } from './components/Background/Background';
import { Xmb } from './components/Xmb/Xmb';
import { apps } from './data/apps';
import { site } from './data/site';
import { InputProvider } from './input/InputProvider';
import { openLink } from './lib/links';
import { defaultPosition, locateItem, menu } from './menu/menu';
import type { MenuAction } from './menu/types';
import { useRoute } from './router/useRoute';

/** Apps that can be opened at /app/<id>. */
function findEmbeddedApp(id: string) {
  return apps.find(
    (app) => app.id === id && app.openMode === 'embedded' && app.status !== 'coming-soon',
  );
}

export function App() {
  const { route, navigate, back } = useRoute();
  const [panel, setPanel] = useState<'about' | null>(null);
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
      case 'setting': // Settings panels arrive with their features in Phase 3.
      case 'none':
        break;
    }
  };

  return (
    <InputProvider>
      <Background />
      <main>
        <h1 className="sr-only">{site.name}: apps, games, tools and projects</h1>
        <p className="sr-only">
          Use the arrow keys to browse, Enter to open and Escape to go back. Game controllers work
          too.
        </p>
        <Xmb menu={menu} initial={initialPosition} onOpen={open} />
      </main>
      {panel === 'about' && (
        <AboutPanel
          onClose={() => {
            setPanel(null);
          }}
        />
      )}
      {viewing && (
        <AppViewer
          app={viewing}
          onClose={() => {
            back('/');
          }}
        />
      )}
    </InputProvider>
  );
}
