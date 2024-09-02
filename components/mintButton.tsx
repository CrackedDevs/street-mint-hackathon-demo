import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { WalletIcon, CreditCardIcon } from "lucide-react"
import ShimmerButton from './magicui/shimmer-button'

export default function MintButton() {
  const [isOpen, setIsOpen] = useState(false)

  const handleWalletPayment = () => {
    console.log("Connecting to Solana wallet...")
    // Implement your wallet connection logic here
    setIsOpen(false)
  }

  const handleCardPayment = () => {
    console.log("Proceeding to card payment...")
    // Implement your card payment logic here
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
      <ShimmerButton borderRadius='6px' className="w-full mb-4 bg-black text-white hover:bg-gray-800 h-[40px] rounded font-bold">MINT NOW</ShimmerButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] w-11/12 max-w-[90vw] rounded-md">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Choose Payment Method</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Select how you&apos;d like to pay for your NFT.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 sm:h-32 hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={handleWalletPayment}
          >
            <WalletIcon className="mb-2 h-6 w-6 sm:h-8 sm:w-8" />
            <span className="text-sm sm:text-base">Pay with Solana Wallet</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 sm:h-32 hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={handleCardPayment}
          >
            <CreditCardIcon className="mb-2 h-6 w-6 sm:h-8 sm:w-8" />
            <span className="text-sm sm:text-base">Pay with Card</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}