import { BrowserRouter } from 'react-router';

import { Toast } from '@/components/toast/Toast';

import { useAppearance } from './appearance';
import { AppRoutes } from './AppRoutes';
import { ScrollToTop } from './ScrollToTop';

// Pagesのサブパス配信ではViteのbaseがbasenameになる。末尾の / はReact Router側で付くので外す
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export function App() {
  useAppearance();
  return (
    <BrowserRouter basename={basename}>
      <ScrollToTop />
      <AppRoutes />
      <Toast />
    </BrowserRouter>
  );
}
