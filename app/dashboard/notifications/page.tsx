"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Heart, MessageSquare, Users, Eye, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link: string | null
    is_read: boolean
    created_at: string
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = getSupabaseBrowserClient()
    const router = useRouter()

    useEffect(() => {
        const fetchNotifications = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(50)

            if (data) {
                setNotifications(data)
            }
            setLoading(false)
        }

        fetchNotifications()

        // Subscribe to real-time notifications
        const channel = supabase
            .channel("notifications")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                },
                (payload) => {
                    setNotifications((prev) => [payload.new as Notification, ...prev])
                },
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const markAsRead = async (notificationId: string) => {
        await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
    }

    const markAllAsRead = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false)

        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    }

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id)
        if (notification.link) {
            router.push(notification.link)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "message":
                return <MessageSquare className="h-5 w-5 text-blue-500" />
            case "interest_request":
                return <Heart className="h-5 w-5 text-pink-500" />
            case "interest_accepted":
                return <Users className="h-5 w-5 text-green-500" />
            case "like":
                return <Heart className="h-5 w-5 text-red-500" />
            case "profile_view":
                return <Eye className="h-5 w-5 text-purple-500" />
            default:
                return <Bell className="h-5 w-5 text-gray-500" />
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        )
    }

    const unreadCount = notifications.filter((n) => !n.is_read).length

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold">Notifications</h1>
                    {unreadCount > 0 && (
                        <p className="text-sm text-muted-foreground">
                            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                        <Check className="mr-2 h-4 w-4" />
                        Mark all as read
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No notifications yet</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${!notification.is_read ? "border-l-4 border-l-primary bg-primary/5" : ""
                                }`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <CardContent className="flex items-start gap-4 p-4">
                                <div className="mt-1">{getIcon(notification.type)}</div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-semibold">{notification.title}</h3>
                                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                                        </div>
                                        {!notification.is_read && (
                                            <Badge variant="default" className="shrink-0">
                                                New
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
