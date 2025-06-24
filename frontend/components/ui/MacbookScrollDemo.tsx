import React from "react";
import { MacbookScroll } from "../ui/macbook-scroll";
import Link from "next/link";

export function MacbookScrollDemo() {
  return (
    <div className="overflow-hidden dark:bg-[#0a0a0a] rounded-xl bg-white w-full">
      <MacbookScroll
        badge={
          <Link target="_blank" href="https://github.com/sr2echa/CyberStrike">
            {/* <Badge /> */}
          </Link>
        }
        src={`/laptopImage.png`}
        showGradient={false}
      />
    </div>
  );
}
