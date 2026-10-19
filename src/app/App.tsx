import { BrowserRouter, Route, Routes } from 'react-router';

import { DetailScreen } from '@/features/detail';
import { EditScreen } from '@/features/edit';
import { ListScreen } from '@/features/list';
import { NotationScreen } from '@/features/notation';
import { SettingsScreen } from '@/features/settings';

// Pages のサブパス配信では Vite の base が basename になる。末尾の / は React Router 側で付くので外す
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<ListScreen />} />
        <Route path="/p/new" element={<EditScreen />} />
        <Route path="/p/:id" element={<DetailScreen />} />
        <Route path="/p/:id/edit" element={<EditScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/notation" element={<NotationScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
