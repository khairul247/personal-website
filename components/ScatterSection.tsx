"use client";

import { useState } from "react";
import Image from "next/image";
import { RoughHighlight } from "./RoughNotation";
import type { PortfolioItem } from "@/data/content";

const TAPE_PATH =
  "M0 4 L4 0 L8 3 L12 1 L16 4 L20 0 L24 3 L28 1 L28 66 L24 70 L20 67 L16 69 L12 66 L8 70 L4 67 L0 69 Z";

function Tape() {
  return (
    <svg
      className="absolute -top-6 left-1/2 -translate-x-1/2 z-10"
      width="28"
      height="70"
      viewBox="0 0 28 70"
      fill="none"
    >
      <path
        d={TAPE_PATH}
        fill="rgba(252, 211, 77, 0.6)"
        stroke="rgba(200, 160, 50, 0.3)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

function PortfolioCard({
  item,
  index,
  isHovered,
  onHover,
}: {
  item: PortfolioItem;
  index: number;
  isHovered: boolean;
  onHover: (i: number | null) => void;
}) {
  const card = (
    <div
      className={`relative bg-white [box-shadow:#00000033_0px_12px_13px] p-4 cursor-pointer ${isHovered ? "giggle" : ""}`}
    >
      <Tape />
      <div className="relative h-75 w-126 overflow-hidden">
        {item.src ? (
          <Image
            src={item.src}
            alt={item.alt}
            fill
            className="object-cover object-center"
            priority={index < 2}
          />
        ) : (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
            <span className="font-(family-name:--font-gochi-hand) text-2xl text-gray-400">
              Ongoing
            </span>
          </div>
        )}
      </div>
      <p className="mt-3 text-sm text-black font-(family-name:--font-gochi-hand)">
        {item.caption}
      </p>
    </div>
  );

  return (
    <div
      className="flex justify-center relative"
      style={{ zIndex: isHovered ? 100 : index }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {item.link ? (
        <a href={item.link} target="_blank" rel="noopener noreferrer">
          {card}
        </a>
      ) : (
        card
      )}
    </div>
  );
}

interface ScatterSectionProps {
  title: string;
  items: PortfolioItem[];
}

export default function ScatterSection({ title, items }: ScatterSectionProps) {
  const [titleHovered, setTitleHovered] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section className="flex flex-col">
      {/* Portfolio Title */}
      <div className="mt-24 pb-20 text-center">
        <span
          className="inline-block cursor-pointer"
          onMouseEnter={() => setTitleHovered(true)}
          onMouseLeave={() => setTitleHovered(false)}
        >
          <RoughHighlight
            show={titleHovered}
            color="rgba(255, 255, 0, 0.5)"
            strokeWidth={20}
            padding={10}
            animationDuration={800}
          >
            <h2 className="font-(family-name:--font-gochi-hand) text-5xl font-bold text-black">
              {title}
            </h2>
          </RoughHighlight>
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-wrap justify-center gap-10">
        {items.map((item, i) => (
          <PortfolioCard
            key={i}
            item={item}
            index={i}
            isHovered={hoveredCard === i}
            onHover={setHoveredCard}
          />
        ))}
      </div>
    </section>
  );
}
