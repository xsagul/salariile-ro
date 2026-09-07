"use client";

import { useEffect } from "react";

export default function EmbedAutoResize() {
  useEffect(() => {
    let raf = 0;

    const sendHeight = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        const height = Math.ceil(
          Math.max(
            document.documentElement.scrollHeight,
            document.body?.scrollHeight || 0,
          ),
        );
        window.parent?.postMessage({ type: "salariile:height", height }, "*");
      });
    };

    sendHeight();
    const timer = window.setTimeout(sendHeight, 250);
    const observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(sendHeight)
      : null;

    observer?.observe(document.documentElement);
    if (document.body) observer?.observe(document.body);
    window.addEventListener("load", sendHeight);
    window.addEventListener("resize", sendHeight);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      observer?.disconnect();
      window.removeEventListener("load", sendHeight);
      window.removeEventListener("resize", sendHeight);
    };
  }, []);

  return null;
}
