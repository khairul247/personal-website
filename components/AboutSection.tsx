"use client";

import { useState } from "react";
import { RoughUnderline } from "./RoughNotation";
import type { AboutContent } from "@/data/content";

export default function AboutSection({ title, paragraphs }: AboutContent) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section id="about" className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-8">
        <div className="bg-white/90 backdrop-blur-sm p-10 [box-shadow:#00000033_0px_12px_13px]">
          <h2
            className="font-(family-name:--font-gochi-hand) text-5xl font-bold text-black mb-8 inline-block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <RoughUnderline
              show={isHovered}
              color="#ff1900"
              strokeWidth={3}
              padding={2}
              animationDuration={600}
            >
              {title}
            </RoughUnderline>
          </h2>

          <div className="space-y-6 text-gray-700 font-(family-name:--font-gochi-hand) text-xl leading-relaxed">
            {paragraphs.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
