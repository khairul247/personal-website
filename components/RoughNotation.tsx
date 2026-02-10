"use client";

import { useEffect, useRef } from "react";
import { annotate } from "rough-notation";

type RoughAnnotation = ReturnType<typeof annotate>;
type RoughAnnotationType = "underline" | "box" | "circle" | "highlight" | "strike-through" | "crossed-off" | "bracket";

interface RoughAnnotationProps {
  children: React.ReactNode;
  type: RoughAnnotationType;
  color?: string;
  strokeWidth?: number;
  padding?: number;
  animationDuration?: number;
  show?: boolean;
  className?: string;
}

function RoughAnnotationWrapper({
  children,
  type,
  color = "#F38A92",
  strokeWidth = 2,
  padding = 8,
  animationDuration = 400,
  show = false,
  className = "",
}: RoughAnnotationProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const annotationRef = useRef<RoughAnnotation | null>(null);

  useEffect(() => {
    if (elementRef.current && !annotationRef.current) {
      annotationRef.current = annotate(elementRef.current, {
        type,
        color,
        strokeWidth,
        padding,
        animationDuration,
      });
    }

    return () => {
      if (annotationRef.current) {
        annotationRef.current.remove();
        annotationRef.current = null;
      }
    };
  }, [type, color, strokeWidth, padding, animationDuration]);

  useEffect(() => {
    if (annotationRef.current) {
      show ? annotationRef.current.show() : annotationRef.current.hide();
    }
  }, [show]);

  return (
    <span ref={elementRef} className={className}>
      {children}
    </span>
  );
}

type RoughComponentProps = Omit<RoughAnnotationProps, "type">;

export function RoughCircle(props: RoughComponentProps) {
  return <RoughAnnotationWrapper {...props} type="circle" />;
}

export function RoughHighlight(props: RoughComponentProps) {
  return <RoughAnnotationWrapper {...props} type="highlight" />;
}

export function RoughUnderline(props: RoughComponentProps) {
  return <RoughAnnotationWrapper {...props} type="underline" />;
}

export function RoughBox(props: RoughComponentProps) {
  return <RoughAnnotationWrapper {...props} type="box" />;
}

export function RoughStrikeThrough(props: RoughComponentProps) {
  return <RoughAnnotationWrapper {...props} type="strike-through" />;
}
