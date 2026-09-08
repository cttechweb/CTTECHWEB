import React, { useRef, useState, useEffect } from "react";
import { CategoryColorTheme } from "../utils/categoryColors";

interface ScrollingTagBadgeProps {
  tag: string;
  theme: CategoryColorTheme;
  icon?: React.ReactNode;
  className?: string;
  maxWidthClass?: string;
}

export const ScrollingTagBadge: React.FC<ScrollingTagBadgeProps> = ({
  tag,
  theme,
  icon,
  className = "",
  maxWidthClass = "max-w-[170px] sm:max-w-[195px]",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const check = () => {
      if (textRef.current && containerRef.current) {
        const textWidth = textRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        const available = icon ? containerWidth - 28 : containerWidth - 16;
        setIsOverflowing(textWidth > available || tag.length > 20);
      } else {
        setIsOverflowing(tag.length > 20);
      }
    };

    const frame = requestAnimationFrame(check);
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", check);
    };
  }, [tag, icon]);

  return (
    <div
      ref={containerRef}
      title={tag}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border h-[22px] overflow-hidden select-none shrink-0 ${maxWidthClass} ${theme.badge} ${className}`}
    >
      {icon && <span className="shrink-0 mr-1.5 flex items-center">{icon}</span>}

      {/* Hidden measure element for unconstrained text length */}
      <span ref={textRef} className="sr-only" aria-hidden="true">
        {tag}
      </span>

      {isOverflowing ? (
        <div className="overflow-hidden relative w-full flex items-center [mask-image:linear-gradient(to_right,transparent,black_4px,black_calc(100%-4px),transparent)]">
          <div
            className="flex items-center gap-3 w-max whitespace-nowrap hover:[animation-play-state:paused]"
            style={{
              animation: "marquee 12s linear infinite",
            }}
          >
            <span>{tag}</span>
            <span className="opacity-40 text-[8px]">•</span>
            <span>{tag}</span>
            <span className="opacity-40 text-[8px]">•</span>
          </div>
        </div>
      ) : (
        <span className="truncate whitespace-nowrap">
          {tag}
        </span>
      )}
    </div>
  );
};

export default ScrollingTagBadge;
