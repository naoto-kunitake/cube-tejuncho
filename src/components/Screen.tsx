import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { IconLink } from './IconButton';

// 画面の題と操作を1行に。高さと上の余白は端末で変える (スマホ・タブレットは52 / 4、PCは64 / 16。pt-barを参照)。
// 下8 (見出し → 内容)。右端は9で、36pxの丸ボタンの中の22pxの記号が端から16に揃う
function TopBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-13 items-center gap-1.5 pt-bar pr-2.25 pb-2 pl-4 pointer-fine:min-h-16">{children}</div>
  );
}

type TitleProps = {
  title: string;
  canWrap: boolean;
};

function Title({ title, canWrap }: TitleProps) {
  return (
    <h1
      className={cn(
        'flex-1 text-title font-bold tracking-title text-ink-strong',
        canWrap ? 'text-balance' : 'min-w-0 truncate',
      )}
    >
      {title}
    </h1>
  );
}

type ScreenProps = {
  label: string;
  // 一覧だけ広い (タイルの列を増やせる)
  isWide?: boolean;
  children: ReactNode;
};

// 画面の器。中央に置き、幅の上限で止める
export function Screen({ label, isWide = false, children }: ScreenProps) {
  return (
    <section aria-label={label} className={cn('mx-auto flex w-full flex-col', isWide ? 'max-w-186' : 'max-w-140')}>
      {children}
    </section>
  );
}

type ScreenHeaderProps = {
  title: string;
  // 左の戻る / 閉じる。一覧と、編集の「見つかりません」では置かない
  // (詳細の「見つかりません」は一覧に戻れるよう戻るを残す)
  leading?: ReactNode;
  // 右の操作 (切り替え、ピン留め、鉛筆、保存)
  trailing?: ReactNode;
  // 一覧の題だけは折り返して全部見せる (ほかはパターンの名前なので省略する)
  canWrapTitle?: boolean;
};

export function ScreenHeader({ title, leading, trailing, canWrapTitle = false }: ScreenHeaderProps) {
  return (
    <TopBar>
      {leading === undefined ? (
        <Title title={title} canWrap={canWrapTitle} />
      ) : (
        // 戻ると題の間は10
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {leading}
          <Title title={title} canWrap={canWrapTitle} />
        </div>
      )}
      {trailing}
    </TopBar>
  );
}

type BackLinkProps = {
  to: string;
  label: string;
};

// 戻る。記号の左端を画面の余白16に揃えるため7引く
export function BackLink({ to, label }: BackLinkProps) {
  return (
    <IconLink to={to} label={label} className="-ml-1.75">
      <ChevronLeft size={22} strokeWidth={1.8} aria-hidden="true" />
    </IconLink>
  );
}

type ScreenBodyProps = {
  className?: string;
  children: ReactNode;
};

// 区画を縦に積む画面の内容 (設定・回転記号・このアプリについて・編集)。
// 一覧と詳細は区画の間が16で、タブや図から始まるので自分で持つ
export function ScreenBody({ className, children }: ScreenBodyProps) {
  return <div className={cn('flex flex-col gap-6 px-4 pt-2 pb-6', className)}>{children}</div>;
}
