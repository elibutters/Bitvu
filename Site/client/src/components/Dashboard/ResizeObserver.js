import { useEffect, useRef } from 'react';

const useResizeObserver = (callback) => {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        callback(entry.contentRect);
      }
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [callback]);

  return ref;
};

export default useResizeObserver;