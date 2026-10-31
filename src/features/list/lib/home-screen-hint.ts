// iOSのSafariは7日間使われないサイトのデータ (localStorage) を消すことがあるが、ホーム画面に追加したPWAは対象外。
// その条件 (iOSで、まだホーム画面から開いていない) のときだけ案内を出す
export type HomeScreenEnvironment = {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  isStandalone: boolean;
};

// iPadOSのSafariは既定で「デスクトップ用サイトを要求」が有効で、UAはiPadを名乗らずMacintoshになる。
// タッチ対応のMacは実在しないので、タッチ点数でiPadを見分ける
function isIos({ userAgent, platform, maxTouchPoints }: HomeScreenEnvironment): boolean {
  return /iPhone|iPad|iPod/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
}

export function isHomeScreenHintNeeded(environment: HomeScreenEnvironment): boolean {
  return isIos(environment) && !environment.isStandalone;
}

// ホーム画面から開いたかは、Safari独自のnavigator.standaloneと、標準のdisplay-modeの両方で見る
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
