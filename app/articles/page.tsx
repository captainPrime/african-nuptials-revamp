"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface Article {
    id: string
    title: string
    slug: string
    excerpt: string
    cover_image: string | null
    category: string | null
    published_at: string
}

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchArticles()
    }, [])

    const fetchArticles = async () => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from("articles")
            .select("id, title, slug, excerpt, cover_image, category, published_at")
            .eq("is_published", true)
            .order("published_at", { ascending: false })
            .limit(12)

        if (!error && data) {
            setArticles(data)
        }
        setLoading(false)
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header onSignUpClick={() => { }} onLoginClick={() => { }} />

            <main className="flex-1">
                <section className="bg-primary py-20 text-primary-foreground">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="mb-4 font-serif text-4xl font-bold md:text-5xl">Articles & Insights</h1>
                        <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80">
                            Discover tips, stories, and advice for your journey to finding love
                        </p>
                    </div>
                </section>

                <section className="bg-background py-20">
                    <div className="container mx-auto px-4">
                        {loading ? (
                            <div className="text-center">Loading articles...</div>
                        ) : articles.length === 0 ? (
                            <div className="text-center text-muted-foreground">No articles available yet</div>
                        ) : (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {articles.map((article) => (
                                    <Link key={article.id} href={`/articles/${article.slug}`}>
                                        <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                                            {article.cover_image && (
                                                <div className="aspect-video overflow-hidden">
                                                    <img
                                                        src={article.cover_image || "/placeholder.svg"}
                                                        alt={article.title}
                                                        className="h-full w-full object-cover transition-transform hover:scale-105"
                                                    />
                                                </div>
                                            )}
                                            <CardContent className="p-6">
                                                {article.category && (
                                                    <Badge variant="secondary" className="mb-3">
                                                        {article.category}
                                                    </Badge>
                                                )}
                                                <h3 className="mb-2 font-serif text-xl font-bold line-clamp-2">{article.title}</h3>
                                                <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
