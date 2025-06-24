"use client";
import { cn } from "@/lib/utils";
import { motion, MotionValue } from "framer-motion";
import Link from "next/link";
import React from "react";
import { RainbowButton } from "./rainbow-button";
import { FlipWords } from "./flip-words";


export const GoogleGeminiEffect = ({
  className,
}: {
  pathLengths: MotionValue[];
  className?: string;
}) => {
  return (
    <div className={cn("sticky top-80", className)}>
      <p className="text-5xl md:text-7xl dark:text-white font-bold text-black pb-4 text-center">
      CodeSage
      </p>
      <div className="text-centera mx-w-lg mx-auto">
        <FlipWordsDemo />
      </div>
      <div className="w-full h-[890px] -top-60 md:-top-40  flex items-center justify-center bg-red-transparent absolute ">
        <Link href={"/code-editor"} className="font-bold rounded-full  md:py-2 px-2 py-1 md:mt-32 mt-8 z-30 md:text-base text-black text-xs  w-fit mx-auto ">
          <RainbowButton>
            Start Analysis
          </RainbowButton>
        </Link>
      </div>
      
    </div>
  );
};

export function FlipWordsDemo() {
  const words = ["Smarter", "Faster", "Stronger"];
 
  return (
    <div className="text-center font-semibold flex justify-center items-center px-4">
      <div className="sm:text-3xl text-lg mx-auto font-normal text-neutral-600 dark:text-neutral-400">
        Write Code 
        <FlipWords words={words} /> <br />
        with AI-Powered Precision
      </div>
    </div>
  );
}
