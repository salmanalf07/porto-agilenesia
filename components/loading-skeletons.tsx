import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function ProjectCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden animate-pulse">
      <div className="relative">
        <div className="w-full h-48 bg-muted rounded-t-lg"></div>
      </div>
      <CardHeader className="p-4">
        <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
          <div className="h-4 bg-muted rounded w-4/6"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="h-4 bg-muted rounded w-20"></div>
            <div className="h-3 bg-muted rounded w-16"></div>
          </div>
          <div className="h-8 bg-muted rounded w-20"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProjectDetailSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 md:mb-12 text-center md:text-left">
        <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-muted rounded w-1/4"></div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Image Skeleton */}
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="w-full aspect-[16/9] bg-muted rounded-lg"></div>
            </CardContent>
          </Card>

          {/* Content Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-8 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
              <div className="space-y-3">
                <div className="h-6 bg-muted rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-2/3"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-2/3"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden animate-pulse">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="h-16 bg-muted rounded w-full"></div>
              <div className="h-16 bg-muted rounded w-3/4"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
            <div className="h-12 bg-muted rounded w-48"></div>
          </div>
          <div className="hidden md:block">
            <div className="w-full h-[450px] bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
