import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

interface VirtualProductGridProps<T> {
  items: T[];
  itemHeight?: number;
  gap?: number;
  overscanRows?: number;
  renderItem: (item: T) => ReactNode;
}

export const VirtualProductGrid = memo(<T,>({
  items,
  itemHeight = 172,
  gap = 16,
  overscanRows = 3,
  renderItem,
}: VirtualProductGridProps<T>) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [width, setWidth] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ startRow: 0, endRow: 0 });

  const columns = width >= 768 ? 2 : 1;
  const totalRows = Math.ceil(items.length / columns);
  const rowHeight = itemHeight + gap;
  const totalHeight = Math.max(totalRows * rowHeight - gap, 0);
  const columnWidth = width > 0 ? (width - gap * (columns - 1)) / columns : 0;

  const recalculateVisibleRows = useCallback(() => {
    const node = containerRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const topInContainer = Math.max(0, -rect.top);
    const bottomInContainer = Math.min(totalHeight, viewportHeight - rect.top);

    const startRow = Math.max(0, Math.floor(topInContainer / rowHeight) - overscanRows);
    const endRow = Math.min(totalRows - 1, Math.ceil(bottomInContainer / rowHeight) + overscanRows);

    setVisibleRange((prev) =>
      prev.startRow !== startRow || prev.endRow !== endRow
        ? { startRow, endRow }
        : prev,
    );
  }, [overscanRows, rowHeight, totalHeight, totalRows]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });

    resizeObserver.observe(node);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const onScrollOrResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(recalculateVisibleRows);
    };

    onScrollOrResize();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [recalculateVisibleRows]);

  const visibleItems = useMemo(() => {
    if (items.length === 0 || totalRows === 0 || width === 0) return [];

    const nodes: ReactNode[] = [];

    for (let row = visibleRange.startRow; row <= visibleRange.endRow; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        const index = row * columns + col;
        if (index >= items.length) continue;

        nodes.push(
          <div
            key={index}
            style={{
              position: "absolute",
              top: row * rowHeight,
              left: col * (columnWidth + gap),
              width: columnWidth,
              height: itemHeight,
            }}
          >
            {renderItem(items[index])}
          </div>,
        );
      }
    }

    return nodes;
  }, [items, totalRows, width, visibleRange.startRow, visibleRange.endRow, columns, rowHeight, columnWidth, gap, itemHeight, renderItem]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: totalHeight }}>
      {visibleItems}
    </div>
  );
});

VirtualProductGrid.displayName = "VirtualProductGrid";
