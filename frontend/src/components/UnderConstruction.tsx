import React from 'react';
import { Icons } from './Icons';

export default function UnderConstruction({ pageTitle }: { pageTitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 mt-8 rounded-3xl bg-surface-container-lowest text-center shadow-sm min-h-[50vh]">
      <div className="w-24 h-24 mb-4 rounded-3xl bg-surface-container-low text-primary flex items-center justify-center shadow-inner">
        <Icons.Tool />
      </div>
      <h2 className="text-2xl font-bold text-on-surface mb-2">{pageTitle}</h2>
      <span className="px-4 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed text-sm font-bold">
        Tính năng đang xây dựng
      </span>
      <p className="mt-4 text-on-surface-variant text-base max-w-md">
        Màn hình này đang trong quá trình phát triển và sẽ được cập nhật ở các phiên bản tiếp theo.
      </p>
    </div>
  );
}