'use client';

import { useState } from 'react';
import { coverTheme, coverVariantClass, titleSize } from '@/lib/cover';
import { cn } from '@/lib/format';

interface BookCoverProps {
  title: string;
  author?: string | null;
  coverImage?: string | null;
  coverColor?: string | null;
  publisher?: string | null;
  category?: string | null;
  className?: string;
  compact?: boolean;
  subtitle?: string;
}

export function BookCover({
  title,
  author,
  coverImage,
  coverColor,
  publisher,
  category,
  className,
  compact = false,
  subtitle,
}: BookCoverProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const theme = coverTheme(title, coverColor);
  const showImage = Boolean(coverImage) && !imageFailed;

  return (
    <div
      className={cn('cover-art', className)}
      style={theme.style}
      role="img"
      aria-label={`Sampul buku ${title}${author ? ` oleh ${author}` : ''}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImage as string}
          alt={`Sampul ${title}`}
          className="absolute inset-0 z-0 h-full w-full object-cover"
          onError={() => setImageFailed(true)}
          loading="lazy"
        />
      ) : (
        <>
          <span className={coverVariantClass(theme.variant)} aria-hidden />
          <span className="cover-frame" aria-hidden />
          <span className="cover-mark" aria-hidden>
            RK
          </span>
          <div className="cover-content">
            <div className="cover-top">
              <span>{publisher || 'Rak Kata'}</span>
              <span>{category || 'Edisi Indonesia'}</span>
            </div>
            <div className={compact ? 'my-1' : 'my-2'}>
              <h3 className="cover-title" style={{ fontSize: titleSize(title) }}>
                {title}
              </h3>
              {subtitle && (
                <p className="mt-[2cqw] text-[7cqw] font-medium leading-tight opacity-70">{subtitle}</p>
              )}
            </div>
            <div>
              <div className="mb-[4cqw] h-[1px] w-12 bg-current opacity-30" />
              <p className="cover-author">{author || 'Penulis Indonesia'}</p>
              <p className="cover-publisher mt-1">Rak Kata · Buku Pilihan</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
