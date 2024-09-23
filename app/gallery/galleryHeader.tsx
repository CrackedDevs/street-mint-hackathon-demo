import ConnectedWalletWidget from "@/components/connectedWalletWidget";
import Image from "next/image";
import Link from "next/link";

export const GalleryHeader = () => {
    return (
        <header className="w-full py-4 px-6 border-b border-gray-200 bg-white z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="w-1/3">
            {/* Left placeholder */}
          </div>
          <div className="w-1/3 flex justify-center">
            <Link href="/dashboard">
              <Image
                src="/logo.svg"
                alt="Street mint logo"
                width={250}
                height={100}
                className="h-10 w-auto"
              />
            </Link>
          </div>
          <div className="w-1/3 flex justify-end">
            <ConnectedWalletWidget />
          </div>
        </div>
      </header>
    );
};