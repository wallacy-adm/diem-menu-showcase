import { RefObject, useEffect, useState } from "react";

export function useOnScreen(ref: RefObject<Element>, threshold = 0.01, rootMargin = "220px 0px") {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, visible]);

  return visible;
}
