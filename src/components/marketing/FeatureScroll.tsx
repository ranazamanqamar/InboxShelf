"use client";

import { useEffect, useRef, useState } from "react";
import { WorkflowStepPreview } from "./WorkflowStepPreview";

export type FeatureScrollStep = {
  title: string;
  body: string;
};

/** Vertical gap between right-stack slides so the next card peeks (Kinso-style). */
const SLIDE_GAP = 128;

/** Nearest panel stays sharp; others blur until their turn. */
function slideFocusStyle(index: number, slidePos: number) {
  const nearest = Math.round(slidePos);
  if (index === nearest) {
    return { filter: undefined, opacity: 1 };
  }
  return { filter: "blur(8px)", opacity: 0.78 };
}

function StepCopy({
  step,
  index,
  total,
}: {
  step: FeatureScrollStep;
  index: number;
  total: number;
}) {
  const words = step.title.split(" ");
  return (
    <div className="max-w-md">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-400">
        STEP {index + 1} / {total}
      </p>
      <h3 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.5rem] md:leading-tight">
        <span className="text-brand">{words[0]}</span>
        {words.length > 1 ? (
          <>
            {" "}
            <span className="text-zinc-900">{words.slice(1).join(" ")}</span>
          </>
        ) : null}
      </h3>
      <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg">
        {step.body}
      </p>
    </div>
  );
}

export function FeatureScroll({
  steps,
  reducedMotion = false,
}: {
  steps: readonly FeatureScrollStep[];
  reducedMotion?: boolean;
}) {
  const [active, setActive] = useState(0);
  /** Continuous 0 … total-1 for Kinso-style upward slide motion */
  const [slidePos, setSlidePos] = useState(0);
  const [frameH, setFrameH] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const total = steps.length;

  useEffect(() => {
    if (reducedMotion) return;

    const mq = window.matchMedia("(min-width: 1024px)");

    const measure = () => {
      if (frameRef.current) setFrameH(frameRef.current.clientHeight);
    };

    const updateFromScroll = () => {
      if (!mq.matches) return;
      const track = trackRef.current;
      if (!track) return;

      measure();

      const rect = track.getBoundingClientRect();
      const trackTop = window.scrollY + rect.top;
      const scrollable = Math.max(track.offsetHeight - window.innerHeight, 1);
      const progress = (window.scrollY - trackTop) / scrollable;
      const clamped = Math.min(Math.max(progress, 0), 1);
      const pos = clamped * (total - 1);
      const next = Math.min(total - 1, Math.round(pos));

      setSlidePos(pos);
      setActive((prev) => (prev === next ? prev : next));
    };

    measure();
    updateFromScroll();
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("resize", updateFromScroll);
    mq.addEventListener("change", updateFromScroll);
    return () => {
      window.removeEventListener("scroll", updateFromScroll);
      window.removeEventListener("resize", updateFromScroll);
      mq.removeEventListener("change", updateFromScroll);
    };
  }, [reducedMotion, total]);

  const step = steps[Math.min(active, total - 1)]!;

  if (reducedMotion) {
    return (
      <div className="mt-12 space-y-8">
        <div className="flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-pressed={i === active}
              onClick={() => setActive(i)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                i === active
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
              }`}
            >
              {i + 1}. {s.title.split(" ")[0]}
            </button>
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <StepCopy step={step} index={active} total={total} />
          </div>
          <div className="lg:col-span-7">
            <WorkflowStepPreview activeStep={active} reducedMotion />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      {/* Mobile: stacked slides */}
      <div className="space-y-14 lg:hidden">
        {steps.map((s, i) => (
          <div key={s.title} className="scroll-mt-28">
            <StepCopy step={s} index={i} total={total} />
            <div className="mt-6">
              <WorkflowStepPreview activeStep={i} reducedMotion />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: sticky left copy + right stack that moves up (Kinso-style) */}
      <div
        ref={trackRef}
        className="feature-scroll-desktop relative hidden lg:block"
        style={{ height: `${total * 100}vh` }}
      >
        <div className="sticky top-28 flex h-[calc(100vh-7rem)] items-start">
          <div className="grid h-full w-full grid-cols-12 items-stretch gap-10">
            <div className="col-span-5 self-start pt-12">
              <div key={active} className="workflow-scene-enter">
                <StepCopy step={step} index={active} total={total} />
              </div>
            </div>

            <div className="col-span-7 h-full min-h-0 py-2">
              <div
                ref={frameRef}
                className="feature-slide-frame relative h-full overflow-hidden"
              >
                <div
                  className="feature-slide-stack will-change-transform"
                  style={{
                    gap: SLIDE_GAP,
                    transform:
                      frameH > 0
                        ? `translate3d(0, ${-slidePos * (frameH + SLIDE_GAP)}px, 0)`
                        : undefined,
                  }}
                >
                  {steps.map((s, i) => (
                    <div
                      key={s.title}
                      className="feature-slide-panel w-full shrink-0"
                      style={{
                        height: frameH > 0 ? frameH : "100%",
                        ...slideFocusStyle(i, slidePos),
                      }}
                      aria-hidden={i !== active}
                    >
                      <WorkflowStepPreview activeStep={i} reducedMotion />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
