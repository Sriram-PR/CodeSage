"use client";

import { useRef } from "react";
import Link from "next/link";
import { 
  RainbowButton,
  GoogleGeminiEffect,
} from "@/components/ui";
import { Shield, Zap, Lock, Cpu, ArrowRight, } from "lucide-react";
import Image from "next/image";
import { useScroll, useTransform} from "framer-motion"
import { FlipWordsDemo } from "@/components/ui/google-gemini-effect";

// import React from 'react'

// const page = () => {
//   return (
//     <div>page</div>
//   )
// }

// export default page

const LandingSection=()=>{

  return(
    <div>
      {/* <ModeToggle /> */}
      <div className="sm:hidden h-screen flex flex-col  items-center">
        <div className="flex sm:hidden w-full justify-center mb-8 mt-28">
          <Image className="hidden dark:block" src="/whiteFischerLogo.png" alt="Fischer Logo light" width={60} height={40}/>
          <Image className="dark:hidden" src="/blackFischerLogo.png" alt="Fischer Logo dark" width={60} height={40}/>  
        </div>
  
        <div className="mb-4 text-5xl sm:text-8xl font-semibold text-center">CodeSage</div>
          <FlipWordsDemo />        
          <Link className="flex justify-center mt-8 sm:mt-16" href={"/code-editor"}>
            <RainbowButton >Start your Analysis!</RainbowButton>
          </Link>
          <div className="mt-32 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="animate-bounce dark:fill-white" width="24" height="24" viewBox="0 0 24 24" id="chevron-force-down">
              <path d="M6.25753788,13.2424621 C5.84748737,12.8324116 5.84748737,12.1675884 6.25753788,11.7575379 C6.66758839,11.3474874 7.33241161,11.3474874 7.74246212,11.7575379 L12,16.0150758 L16.2575379,11.7575379 C16.6675884,11.3474874 17.3324116,11.3474874 17.7424621,11.7575379 C18.1525126,12.1675884 18.1525126,12.8324116 17.7424621,13.2424621 L12.7424621,18.2424621 C12.3324116,18.6525126 11.6675884,18.6525126 11.2575379,18.2424621 L6.25753788,13.2424621 Z M6.25753788,7.24246212 C5.84748737,6.83241161 5.84748737,6.16758839 6.25753788,5.75753788 C6.66758839,5.34748737 7.33241161,5.34748737 7.74246212,5.75753788 L12,10.0150758 L16.2575379,5.75753788 C16.6675884,5.34748737 17.3324116,5.34748737 17.7424621,5.75753788 C18.1525126,6.16758839 18.1525126,6.83241161 17.7424621,7.24246212 L12.7424621,12.2424621 C12.3324116,12.6525126 11.6675884,12.6525126 11.2575379,12.2424621 L6.25753788,7.24246212 Z"></path>
            </svg>  
          </div>      
        </div>
      <div className="hidden sm:flex w-full justify-center pt-16 my-16">
        <Image className="hidden dark:block" src="/whiteFischerLogo.png" alt="Fischer Logo light" width={100} height={40}/>
        <Image className="dark:hidden" src="/blackFischerLogo.png" alt="Fischer Logo dark" width={100} height={40}/>  
      </div>
      {/* <div className="sm:block hidden">
        <MacbookScrollDemo />
      </div> */}
      <GoogleGeminiEffectDemo />
      <div className="flex gap-4 mt-16 flex-col lg:items-stretch items-center lg:flex-row px-4 py-5">
        <CardGrid />
      </div>
      <div className="sm:px-32 px-8">
        <BigCard />
      </div>
      <div className="pt-6 pb-4">
        <p className="text-center font-mono lowercase pb-4">Made by <span className="font-extrabold ">Team Chained Together</span> <a className="underline" href="https://github.com/avinashv4">Avinash</a>, <a className="underline" href="https://github.com/avinashv4">Harshita</a>, <a className="underline" href="https://github.com/avinashv4">Sriram</a></p>
      </div>
    </div>
  )
}

function BigCard(){
  return(
    <div className="flex dark:bg-[#0a0a0a] w-full bg-white justify-center items-center flex-col gap-8 border-2 rounded-xl sm:px-48 sm:py-72 px-16 py-24">

      <div className="flex flex-col gap-4">
        <div className="text-5xl font-extrabold text-center">
          Are you ready?
        </div>
        <div className="text-xl text-center">
          Add pissaz.
        </div>
      </div>

      <Link href={"/code-editor"}>
        <RainbowButton>
          <div className="flex gap-2">
            <p>Get Started Now </p>
            <ArrowRight />
          </div>
        </RainbowButton>
      </Link>     

    </div>
  )
}

function CardGrid() {
  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
      {Things.map((item, idx) => (
        <div
          key={idx}
          className="relative group block p-18 h-full w-full"
        >
          <div className="relative z-10 p-12 rounded-xl bg-white dark:bg-zinc-900 h-full w-full transition-all duration-200 hover:scale-105">
            <div className="p-3">{item.icon}</div>
            <div className="text-2xl font-bold mt-3">{item.title}</div>
            <div className="text-base text-neutral-600 dark:text-neutral-400 mt-4 font-light">
              {item.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const Things = [
  {
    icon: <Shield className="w-10 h-10" />,
    title: "AI-Powered Code Review",
    description: "Enhance your code quality with real-time AI-driven feedback and best practices.",
  },
  {
    icon: <Zap className="w-10 h-10" />,
    title: "Intelligent Bug Detection",
    description: "Catch and fix bugs effortlessly with AI-assisted debugging and optimization.",
  },
  {
    icon: <Lock className="w-10 h-10" />,
    title: "Performance Optimization",
    description: "Write efficient and scalable code with AI-powered performance insights.",
  },
  {
    icon: <Cpu className="w-10 h-10" />,
    title: "Personalized Mentorship",
    description: "Accelerate your growth with AI-driven coding guidance and tailored learning paths.",
  },
];


function GoogleGeminiEffectDemo() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.0], [0.0, 0.0]);

  return (
    <div
      className="h-[80vh] sm:block hidden w-full rounded-md relative pt-20 overflow-clip"
      ref={ref}
    >
      <GoogleGeminiEffect
        pathLengths={[
          pathLengthFirst
        ]}
      />
      
    </div>
  );
}

export default LandingSection