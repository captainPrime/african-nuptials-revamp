import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function MatchCardSkeleton() {
    return (
        <Card className="overflow-hidden border-none shadow-sm">
            <div className="relative aspect-[3/5] w-full">
                <Skeleton className="h-full w-full rounded-xl" />
            </div>
        </Card>
    )
}

export function InterestRequestSkeleton() {
    return (
        <Card className="border shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </CardContent>
        </Card>
    )
}

export function ChatListSkeleton() {
    return (
        <div className="flex items-center gap-3 rounded-lg p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    )
}

export function ProfileCompletionSkeleton() {
    return (
        <Card className="border-none shadow-sm">
            <CardContent className="p-6">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-2 w-full" />
                    <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function PlanDetailsSkeleton() {
    return (
        <Card className="border-none shadow-sm">
            <CardContent className="p-6">
                <Skeleton className="mb-6 h-6 w-32" />
                <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    )
}
