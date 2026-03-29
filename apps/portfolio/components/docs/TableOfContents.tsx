'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({
  headings: providedHeadings,
  selector = 'article h2, article h3, article h4',
}: {
  headings?: Heading[];
  selector?: string;
}) {
  const [domHeadings, setDomHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const headings = providedHeadings && providedHeadings.length > 0 ? providedHeadings : domHeadings;

  useEffect(() => {
    if (providedHeadings && providedHeadings.length > 0) {
      return;
    }

    const nodes = Array.from(document.querySelectorAll(selector));
    const headingElements = nodes.map((el) => ({
      id: el.id || el.textContent?.toLowerCase().replace(/\s+/g, '-') || '',
      text: el.textContent || '',
      level: parseInt(el.tagName.charAt(1)),
    }));

    // Add IDs to headings if they don't have them
    headingElements.forEach((heading, index) => {
      const element = nodes[index];
      if (element && !element.id) {
        element.id = heading.id;
      }
    });

    queueMicrotask(() => setDomHeadings(headingElements));

    // Intersection Observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -35% 0%' }
    );

    headingElements.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [providedHeadings, selector]);

  if (headings.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold text-white uppercase tracking-wide mb-4">
        ON THIS PAGE
      </h3>
      <nav className="space-y-0.5">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const indentClass = heading.level === 3 ? 'pl-3' : heading.level === 4 ? 'pl-6' : '';
          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`
                relative flex items-center text-sm transition-colors group py-1
                ${indentClass}
                ${isActive
                    ? 'text-green-400'
                    : 'text-gray-400 hover:text-gray-300'
                }
              `}
            >
              {/* Vertical line indicator - always visible, brighter when active */}
              <div
                className={`
                  absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-200
                  ${isActive 
                    ? 'bg-green-400' 
                    : 'bg-gray-600/40'
                  }
                `}
              />
              <span className="pl-3">{heading.text}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}



