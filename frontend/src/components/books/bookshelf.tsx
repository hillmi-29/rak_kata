'use client';

import { Bookend, DecorativeStack, ShelfPlant, Spine } from './spine';
import { cn } from '@/lib/format';
import type { Book } from '@/lib/types';

interface ShelfGroup {
  label: string;
  books: Book[];
}

interface BookshelfProps {
  groups: ShelfGroup[];
  onSelect: (book: Book) => void;
  className?: string;
}

export function Bookshelf({ groups, onSelect, className }: BookshelfProps) {
  const visibleGroups = groups.filter(group => group.books.length > 0);

  return (
    <div className={cn('shelf-scene', className)}>
      <div className="shelf-cabinet">
        {visibleGroups.map((group, groupIndex) => (
          <div className="shelf-row" key={`${group.label}-${groupIndex}`}>
            <div className="shelf-books">
              {group.books.map((book, index) => (
                <Spine
                  key={book.id}
                  book={book}
                  index={index}
                  onClick={() => onSelect(book)}
                  lean={groupIndex === 1 && index === group.books.length - 1 && group.books.length > 3}
                />
              ))}
              {groupIndex === 0 && (
                <>
                  <Bookend />
                  <ShelfPlant />
                </>
              )}
              {groupIndex === 1 && <DecorativeStack />}
              {groupIndex === 2 && <DecorativeStack colors={['#D9A404', '#5E3A5D']} />}
            </div>
            <div className="shelf-plank" />
            <span className="shelf-label">{group.label}</span>
          </div>
        ))}
        <div className="shelf-dust" />
      </div>
    </div>
  );
}
