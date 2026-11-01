import { BrowserRouter } from 'react-router';

import { StorageIssueNotice } from '@/components/StorageIssueNotice';
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
      {/* 読み上げの「主要な領域へ」の移動先。知らせと確認は画面の外側なのでmainに入れない */}
      <main>
        <AppRoutes />
      </main>
      <StorageIssueNotice />
      <Toast />
    </BrowserRouter>
  );
}
