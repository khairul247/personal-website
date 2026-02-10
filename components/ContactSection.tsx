"use client";

import { useState } from "react";
import { RoughBox } from "./RoughNotation";
import type { ContactContent } from "@/data/content";

export default function ContactSection({ title, subtitle, links }: ContactContent) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <section id="contact" className="pb-40 flex items-center justify-center">
      <div className="max-w-xl mx-auto px-8 text-center">
        <h2 className="font-(family-name:--font-gochi-hand) text-5xl font-bold text-black mb-8">
          {title}
        </h2>

        <p className="font-(family-name:--font-gochi-hand) text-xl text-gray-700 mb-12">
          {subtitle}
        </p>

        <div className="flex justify-center gap-8 flex-wrap">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline text-black"
              onMouseEnter={() => setHoveredItem(link.label)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <RoughBox
                show={hoveredItem === link.label}
                color="#ff1900"
                strokeWidth={2}
                padding={12}
                animationDuration={400}
              >
                <div className="w-28 h-28 bg-white/90 backdrop-blur-sm rounded-lg [box-shadow:#00000033_0px_8px_10px] flex flex-col items-center justify-center">
                  <span className="text-2xl block mb-2">{link.icon}</span>
                  <span className="font-(family-name:--font-gochi-hand) text-lg">
                    {link.label}
                  </span>
                </div>
              </RoughBox>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
