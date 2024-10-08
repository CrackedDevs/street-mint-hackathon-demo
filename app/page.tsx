import { useState } from "react";
import { Menu, X, Wallet, ShoppingBag, ChevronRight, Cpu } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex justify-center p-6 lg:px-8" aria-label="Global">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">Street Mint</span>
            <Image
              src="/logo.svg"
              alt="Street mint logo"
              width={250}
              height={100}
              className="h-10 w-auto"
            />
          </a>
        </nav>
      </header>

      <main className="isolate">
        {/* Hero section */}
        <div className="relative pt-14">
          <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Digital Collectibles, Real-World Connections
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Create, mint, and share unique digital collectibles and IRLS
                  on Solana with the power of NFC technology.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <a
                    href="#"
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    Learn more <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* NFC Public Key Update Button */}
        <div className="mt-10 flex items-center justify-center"></div>

        {/* Feature section */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Revolutionize Collectibles
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to create and share digital collectibles
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Street Mint combines the power of Solana blockchain with NFC
              technology to bring your digital collectibles into the physical
              world.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {[
                {
                  title: "Easy Minting",
                  description:
                    "Create and mint your NFT collections on Solana with just a few clicks.",
                  icon: Wallet,
                },
                {
                  title: "NFC Integration",
                  description:
                    "Receive NFC chips linked to your digital collectibles for real-world interactions.",
                  icon: Cpu,
                },
                {
                  title: "Seamless Checkout",
                  description:
                    "Enable buyers to purchase and mint NFTs through a private, NFC-activated checkout.",
                  icon: ShoppingBag,
                },
                {
                  title: "Solana Powered",
                  description:
                    "Leverage the speed and efficiency of the Solana blockchain for your digital collectibles.",
                  icon: ChevronRight,
                },
              ].map((feature, index) => (
                <div key={index} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900">
                      <feature.icon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    {feature.title}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* How it works section */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Simple Process
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How Street Mint Works
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <ol className="space-y-8">
              {[
                {
                  title: "Create Your Collection",
                  description:
                    "Log in to Street Mint and create your unique NFT collection on the Solana blockchain.",
                },
                {
                  title: "Receive NFC Chips",
                  description:
                    "We'll send you NFC chips linked to your digital collectibles.",
                },
                {
                  title: "Share and Sell",
                  description:
                    "Distribute your NFC chips. When tapped, they lead to a private checkout for minting.",
                },
                {
                  title: "Instant Minting",
                  description:
                    "Buyers pay and receive their newly minted NFT directly on the Solana blockchain.",
                },
              ].map((step, index) => (
                <li key={index} className="flex gap-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold leading-7 text-gray-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-base leading-7 text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* CTA section */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to bring your digital collectibles to life?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Join Street Mint today and start creating unforgettable
              experiences with your NFTs and POAPs.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-gray-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              >
                Get started
              </a>
              <a
                href="#"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto mt-40 max-w-7xl overflow-hidden px-6 pb-20 sm:mt-64 sm:pb-24 lg:px-8">
        <nav
          className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
          aria-label="Footer"
        >
          {["About", "Blog", "Jobs", "Press", "Accessibility", "Partners"].map(
            (item) => (
              <div key={item} className="pb-6">
                <a
                  href="#"
                  className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                >
                  {item}
                </a>
              </div>
            )
          )}
        </nav>
        <p className="mt-10 text-center text-xs leading-5 text-gray-500">
          &copy; {new Date().getFullYear()} Street Mint, Inc. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
