import { BrowserRouter } from 'react-router';

import { AppRoutes } from './AppRoutes';

// Pages のサブパス配信では Vite の base が basename になる。末尾の / は React Router 側で付くので外す
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export function App() {
  return (
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  );
}
