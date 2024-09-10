import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { pluralize } from "@/lib/plural"

export default function CollectionCard({ collection }: { collection: {
    id: string
    name: string
    description: string
    collectible_image_urls: string[]
} }) {
  const imagesToShow = collection.collectible_image_urls.length >= 9 ? 9 :
                       collection.collectible_image_urls.length >= 4 ? 4 : 1;

  return (
    <Card className="overflow-hidden h-[280px] flex flex-col justify-between z-20">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="mb-4">
          <div className={`grid gap-1 ${imagesToShow === 9 ? 'grid-cols-3' : 'grid-cols-2'} w-32`}>
            {collection.collectible_image_urls.slice(0, imagesToShow).map((url, index) => (
              <div key={index} className="aspect-square overflow-hidden">
                <Image
                  src={url}
                  alt={`Collectible ${index + 1}`}
                  width={60}
                  height={60}
                  className="rounded-md object-cover object-center w-full h-full"
                />
              </div>
            ))}
            {collection.collectible_image_urls.length > imagesToShow && (
              <div className="flex items-center justify-center rounded-md bg-muted text-xs font-medium aspect-square">
                +{collection.collectible_image_urls.length - imagesToShow}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-xl font-semibold leading-tight">{collection.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3">{collection.description}</p>
          <p className="text-sm text-muted-foreground line-clamp-3">Total collectibles: {collection.collectible_image_urls.length}</p>
        </div>
        <div className="mt-4">
          <Link href={`/dashboard/collection/${collection.id}`}>
            <Button variant="secondary" size="sm" className="w-full">
              View Collection
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}