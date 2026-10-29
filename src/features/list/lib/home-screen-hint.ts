// iOS の Safari は 7 日間使われないサイトのデータ (localStorage) を消すことがあるが、ホーム画面に追加した PWA は対象外。
// その条件 (iOS で、まだホーム画面から開いていない) のときだけ案内を出す
export type HomeScreenEnvironment = {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  isStandalone: boolean;
};

// iPadOS の Safari は既定で「デスクトップ用サイトを要求」が有効で、UA は iPad を名乗らず Macintosh になる。
// タッチ対応の Mac は実在しないので、タッチ点数で iPad を見分ける
function isIos({ userAgent, platform, maxTouchPoints }: HomeScreenEnvironment): boolean {
  return /iPhone|iPad|iPod/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
}

export function isHomeScreenHintNeeded(environment: HomeScreenEnvironment): boolean {
  return isIos(environment) && !environment.isStandalone;
}

// ホーム画面から開いたかは、Safari 独自の navigator.standalone と、標準の display-mode の両方で見る
export function homeScreenEnvironmentOf(window: Window): HomeScreenEnvironment {
  const { navigator } = window;
  const isStandalone =
    ('standalone' in navigator && navigator.standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches;
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    isStandalone,
  };
}
