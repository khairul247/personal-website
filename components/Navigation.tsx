"use client";

import { useState } from "react";
import { RoughCircle } from "./RoughNotation";
import type { NavItem } from "@/data/content";

interface NavigationProps {
  items: NavItem[];
}

export default function Navigation({ items }: NavigationProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <nav className="flex flex-wrap justify-center gap-24 mt-16 md:mt-20">
      {items.map((item, index) => (
        <a
          key={item.label}
          href={item.href}
          className="no-underline text-black"
          onClick={(e) => {
            e.preventDefault();
            const target = document.querySelector(item.href);
            target?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <RoughCircle
            show={hoveredIndex === index}
            color="red"
            strokeWidth={5}
            padding={25}
            animationDuration={450}
          >
            <span className="block font-(family-name:--font-gochi-hand) text-xl md:text-2xl py-1.5 px-3 md:py-2 md:px-4 cursor-pointer">
              {item.label}
            </span>
          </RoughCircle>
        </a>
      ))}
    </nav>
  );
}
