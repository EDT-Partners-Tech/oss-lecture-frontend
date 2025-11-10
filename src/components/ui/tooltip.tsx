import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';

const Tooltip: React.FC<{
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  className?: string;
}> = ({ content, children, position = 'auto', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const [offsetX, setOffsetX] = useState(0);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const calculateBestPosition = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate available space in each direction
    const spaceAbove = container.top;
    const spaceBelow = viewportHeight - container.bottom;
    const spaceLeft = container.left;
    const spaceRight = viewportWidth - container.right;

    // Tooltip dimensions (aprox)
    const tooltipWidth = 220; // Maximum width
    const tooltipHeight = 60; // Approximate

    let bestPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

    if (position === 'auto') {
      // Check if there's enough space in each direction
      const canFitTop = spaceAbove >= tooltipHeight + 8;
      const canFitBottom = spaceBelow >= tooltipHeight + 8;
      const canFitLeft = spaceLeft >= tooltipWidth + 8;
      const canFitRight = spaceRight >= tooltipWidth + 8;

      // Priority order: top, bottom, right, left
      if (canFitTop) {
        bestPosition = 'top';
      } else if (canFitBottom) {
        bestPosition = 'bottom';
      } else if (canFitRight) {
        bestPosition = 'right';
      } else if (canFitLeft) {
        bestPosition = 'left';
      } else {
        // If it doesn't fit in any direction, choose the one with more space
        const spaces = [
          { pos: 'top', space: spaceAbove },
          { pos: 'bottom', space: spaceBelow },
          { pos: 'left', space: spaceLeft },
          { pos: 'right', space: spaceRight }
        ];
        spaces.sort((a, b) => b.space - a.space);
        bestPosition = spaces[0].pos as 'top' | 'bottom' | 'left' | 'right';
      }
    } else {
      bestPosition = position;
    }

    setCalculatedPosition(bestPosition);
  }, [position]);

  // Adjust the horizontal offset so that the tooltip never goes out of the viewport
  useLayoutEffect(() => {
    if (isVisible && tooltipRef.current && containerRef.current) {
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const container = containerRef.current.getBoundingClientRect();
      let newOffsetX = 0;
      // Only for top/bottom (centered)
      if (calculatedPosition === 'top' || calculatedPosition === 'bottom') {
        const left = container.left + container.width / 2 - tooltip.width / 2;
        const right = left + tooltip.width;
        if (left < 8) {
          newOffsetX = 8 - left;
        } else if (right > window.innerWidth - 8) {
          newOffsetX = window.innerWidth - 8 - right;
        }
      }
      setOffsetX(newOffsetX);
    }
  }, [isVisible, calculatedPosition, content]);

  useEffect(() => {
    if (isVisible) {
      calculateBestPosition();
    }
  }, [isVisible, position, calculateBestPosition]);

  const getPositionClasses = () => {
    switch (calculatedPosition) {
      case 'bottom':
        return 'top-full mt-2';
      case 'left':
        return 'right-full mr-2';
      case 'right':
        return 'left-full ml-2';
      default:
        return 'bottom-full mb-2';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            absolute bg-black text-white text-xs px-3 py-1
            rounded-lg shadow-lg border border-gray-700 z-50
            transition-opacity duration-200 ease-in-out
            min-w-40 whitespace-normal break-words
            ${isVisible ? 'opacity-100' : 'opacity-0'}
            ${getPositionClasses()}
            ${className}
          `}
          style={{ left: calculatedPosition === 'top' || calculatedPosition === 'bottom' ? '50%' : undefined, transform: (calculatedPosition === 'top' || calculatedPosition === 'bottom') ? `translateX(-50%) translateX(${offsetX}px)` : undefined }}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
