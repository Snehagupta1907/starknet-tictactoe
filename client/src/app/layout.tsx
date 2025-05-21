"use client";
import "./globals.css";
import { useEffect } from "react";
import Head from "next/head";

import { Toaster } from "react-hot-toast";
import Script from "next/script";
import { Navbar } from "../components/Navbar";
import { StarknetProvider } from "../context/StarknetProvider";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.title = "Starknet Arcade";
    document.head
      .querySelector("link[rel='icon']")
      ?.setAttribute("href", "/starknet.svg");
  }, []);

  return (
    <html lang="en">
      <Head>
        <title>Tic Tac Toe</title>
        <meta name="description" content="Play games on Starknet blockchain" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="/css/style.css" />
      </Head>
      <body className="min-h-screen ">
        <Script
          src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"
          strategy="beforeInteractive"
        />
        <Script src="/js/scripts.js" strategy="afterInteractive" />
        <StarknetProvider>
          <Navbar />
          <main className="w-full">{children}</main>
        </StarknetProvider>
        <Toaster />
      </body>
    </html>
  );
}
