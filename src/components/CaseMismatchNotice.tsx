import { cn } from '@/lib/utils';

type CaseMismatchNoticeProps = {
  id?: string;
  message: string;
  className?: string;
};

// 手順がパターンを揃えないときの知らせ。詳細・編集・再生シートで見た目と読み上げ (遅れて現れるのでstatus) を揃える
export function CaseMismatchNotice({ id, message, className }: CaseMismatchNoticeProps) {
  return (
    <p id={id} role="status" className={cn('text-label leading-normal text-danger', className)}>
      {message}
    </p>
  );
}
