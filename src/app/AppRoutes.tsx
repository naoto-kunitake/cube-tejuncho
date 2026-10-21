import { Route, Routes } from 'react-router';

import { DetailScreen } from '@/features/detail';
import { EditScreen } from '@/features/edit';
import { ListScreen } from '@/features/list';
import { NotationScreen } from '@/features/notation';
import { SettingsScreen } from '@/features/settings';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ListScreen />} />
      <Route path="/p/new" element={<EditScreen />} />
      <Route path="/p/:id" element={<DetailScreen />} />
      <Route path="/p/:id/edit" element={<EditScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
      <Route path="/notation" element={<NotationScreen />} />
    </Routes>
  );
}
