import { Background } from './components/Background/Background';
import { Xmb } from './components/Xmb/Xmb';
import { site } from './data/site';
import { defaultCategoryIndex, menu } from './menu/menu';

export function App() {
  return (
    <>
      <Background />
      <main>
        <h1 className="sr-only">{site.name}: apps, games, tools and projects</h1>
        <Xmb menu={menu} initialCategory={defaultCategoryIndex} />
      </main>
    </>
  );
}
