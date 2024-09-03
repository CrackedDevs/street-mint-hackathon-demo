'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserCircle2Icon, UploadIcon, XIcon, InstagramIcon, ImageIcon } from "lucide-react"
import X from "@/components/x"

export default function ProfileForm() {
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    email: "",
    avatar: "",
    X: "",
    instagram: "",
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Here you would typically send the data to your backend
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create Your Profile</CardTitle>
        <CardDescription className="text-center">
          Fill out the form below to set up your profile and connect your social media accounts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center space-y-2">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-dashed border-gray-300 group-hover:border-primary transition-colors duration-200">
                  {formData.avatar ? (
                    <AvatarImage src={formData.avatar} alt="Avatar" />
                  ) : (
                    <AvatarFallback className="bg-background">
                      <svg
                        className="w-12 h-12 text-gray-300 group-hover:text-primary transition-colors duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                  <UploadIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      setFormData((prev) => ({
                        ...prev,
                        avatar: event.target?.result as string,
                      }))
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("avatar-upload")?.click()}
              >
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                500x500px, 2.5MB max
              </p>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <Label htmlFor="username" className="text-sm font-medium">
                  Username <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="bg-background"
                  placeholder="michael"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Not shown on profile. For important notifications only.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="bio" className="text-sm font-medium">
              Bio <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="bg-background h-24"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {1500 - formData.bio.length} characters remaining
            </p>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Connect Your Socials</CardTitle>
              <CardDescription className="text-sm">
                Connect social accounts to verify your identity as a creator.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <X className='h-4 w-4' />
                <Input
                  id="X"
                  name="X"
                  value={formData.X}
                  onChange={handleInputChange}
                  className="bg-background"
                  placeholder="X username"
                />
              </div>
              <div className="flex items-center space-x-2">
                <InstagramIcon className="h-4 w-4 text-pink-500" />
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  className="bg-background"
                  placeholder="Instagram username"
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          Create Profile
        </Button>
      </CardFooter>
    </Card>
  )
}