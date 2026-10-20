import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Library の自動クリーンアップは globals の afterEach を前提にしている。globals を使わないので自分で呼ぶ
afterEach(cleanup);
