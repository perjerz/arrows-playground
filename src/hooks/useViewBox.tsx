import {useCallback, useEffect} from 'react'
import useResizeObserver from "use-resize-observer";
import state from "../state";

export default function useViewBox<T extends HTMLElement = HTMLDivElement>() {
  // Resize Observer
  const { ref, width = 0, height = 0 } = useResizeObserver<T>();

  /**
   * Update the state when the element moves or resizes. Resizing is tracked automatically,
   * however you'll need to call `handleMove()` manually if you change the position of the
   * viewBox's element yourself. (Consider throttling or debouncing the call.)
   */
  const handleMove = useCallback(() => {
    const container = ref.current;
    if (!container) return;

    const bounds = container.getBoundingClientRect();

    state.send("UPDATED_VIEWBOX", {
      x: bounds.left,
      y: bounds.top,
      width,
      height,
    });
  }, [ref, width, height]);

  // Run handleMove automatically whenever the element resizes
  useEffect(handleMove, [ref, width, height, handleMove]);

  // Prevent the browser's built-in pinch zooming
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    function stopZoom(e: WheelEvent | TouchEvent) {
      if (e.ctrlKey) e.preventDefault();
    }

    container.addEventListener("wheel", stopZoom);
    container.addEventListener("touchmove", stopZoom);

    return () => {
      container.removeEventListener("wheel", stopZoom);
      container.removeEventListener("touchmove", stopZoom);
    };
  }, [ref]);

  return { ref, width, height, handleMove };
}
