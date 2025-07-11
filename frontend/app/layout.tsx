import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ModeToggle, ThemeProvider } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CodeSage",
  description: "Your AI Code Editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="fixed top-0 left-0 right-0 z-[1000]">
            <div className="dark:bg-[#0a0a0a]/50 border flex w-full items-center justify-between backdrop-blur-sm bg-white/50 px-16 py-4">
              <Link href="/">
                <Image
                  className="hidden dark:block"
                  src="/whiteFischerLogo.png"
                  alt="Fischer Logo light"
                  width={25}
                  height={40}
                />
                <Image
                  className="dark:hidden"
                  src="/blackFischerLogo.png"
                  alt="Fischer Logo dark"
                  width={25}
                  height={40}
                />
              </Link>
              <div className="flex gap-4 items-center">
                <a target="_blank" href="https://github.com/avinashv4" className="p-2 rounded-md border ">
                  <GitHubLogoIcon width={20} height={20} />
                </a>
                <div className="dark:text-[#262626] text-[#e5e5e5]">{"|"}</div>
                <ModeToggle />
              </div>
            </div>
          </header>
          <main className="flex-grow pt-[72px]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
