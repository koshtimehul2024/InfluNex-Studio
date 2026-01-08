import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export function MagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || "ontouchstart" in window);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    if (isMobile) return;

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    /* ---------------------------
       CURSOR FOLLOW (SMOOTH)
    ---------------------------- */
    let mouseX = 0,
      mouseY = 0;
    let currX = 0,
      currY = 0;
    let dotX = 0,
      dotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animateCursor = () => {
      // Smooth Lerp Motion
      currX += (mouseX - currX) * 0.18;
      currY += (mouseY - currY) * 0.18;

      dotX += (mouseX - dotX) * 0.28;
      dotY += (mouseY - dotY) * 0.28;

      cursor.style.transform = `translate3d(${currX}px, ${currY}px, 0)`;
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;

      requestAnimationFrame(animateCursor);
    };

    window.addEventListener("mousemove", handleMouseMove);
    requestAnimationFrame(animateCursor);

    /* ---------------------------
       MAGNETIC HOVER EFFECT
    ---------------------------- */
    const items = document.querySelectorAll(
      "a, button, [role='button'], .magnetic"
    );

    const onEnter = () => {
      gsap.to(cursor, { scale: 1.25, duration: 0.25, ease: "power2.out" });
      gsap.to(dot, { scale: 0.5, duration: 0.25, ease: "power2.out" });
    };

    const onLeave = (el: HTMLElement) => {
      gsap.to(cursor, { scale: 1, duration: 0.25, ease: "power2.out" });
      gsap.to(dot, { scale: 1, duration: 0.25, ease: "power2.out" });
      gsap.to(el, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const onMagneticMove = (e: MouseEvent, el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);

      if (Math.abs(x) < 60 && Math.abs(y) < 60) {
        gsap.to(el, {
          x: x * 0.25,
          y: y * 0.25,
          scale: 1.03,
          duration: 0.25,
          ease: "power2.out",
        });
      }
    };

    items.forEach((el) => {
      const elem = el as HTMLElement;

      elem.addEventListener("mouseenter", onEnter);
      elem.addEventListener("mouseleave", () => onLeave(elem));
      elem.addEventListener("mousemove", (e) => onMagneticMove(e, elem));
    });

    /* ---------------------------
       CLEANUP
    ---------------------------- */
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", checkMobile);

      items.forEach((el) => {
        const elem = el as HTMLElement;
        elem.removeEventListener("mouseenter", onEnter);
        elem.removeEventListener("mouseleave", () => onLeave(elem));
        elem.removeEventListener("mousemove", (e) =>
          onMagneticMove(e as any, elem)
        );
      });
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      {/* Cursor Ring */}
      <div
        ref={cursorRef}
        className={cn(
          "fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999]",
          "border border-primary/50 rounded-full",
          "mix-blend-difference"
        )}
        style={{ transform: "translate(-50%, -50%)" }}
      />

      {/* Cursor Dot */}
      <div
        ref={dotRef}
        className={cn(
          "fixed top-0 left-0 w-2 h-2 pointer-events-none z-[10000]",
          "bg-primary rounded-full",
          "mix-blend-difference"
        )}
        style={{ transform: "translate(-50%, -50%)" }}
      />
    </>
  );
}
