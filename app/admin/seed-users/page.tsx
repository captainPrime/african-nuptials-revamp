"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { seedTestUsers } from "@/app/actions/seed-users"

export default function SeedUsersPage() {
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<{ success: string[]; errors: string[] } | null>(null)

    const handleSeed = async () => {
        setLoading(true)
        setResults(null)

        try {
            const data = await seedTestUsers()
            setResults(data)
        } catch (error) {
            setResults({
                success: [],
                errors: [error instanceof Error ? error.message : "Failed to seed users"],
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Seed Test Users</CardTitle>
                    <CardDescription>
                        Create test user accounts for development and testing purposes. This will create 8 test users (5 female, 3
                        male) with sample data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={handleSeed} disabled={loading} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "Creating Users..." : "Seed Test Users"}
                    </Button>

                    {results && (
                        <div className="space-y-4">
                            {results.success.length > 0 && (
                                <Alert className="border-green-200 bg-green-50">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">
                                        <div className="font-semibold mb-2">Successfully created {results.success.length} user(s):</div>
                                        <ul className="list-disc list-inside space-y-1">
                                            {results.success.map((email) => (
                                                <li key={email} className="text-sm">
                                                    {email}
                                                </li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {results.errors.length > 0 && (
                                <Alert className="border-red-200 bg-red-50">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                        <div className="font-semibold mb-2">{results.errors.length} error(s) occurred:</div>
                                        <ul className="list-disc list-inside space-y-1">
                                            {results.errors.map((error, index) => (
                                                <li key={index} className="text-sm">
                                                    {error}
                                                </li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Alert>
                                <AlertDescription>
                                    <div className="font-semibold mb-2">Test User Credentials:</div>
                                    <p className="text-sm">
                                        All test users have the password: <code className="bg-muted px-2 py-1 rounded">Test123456!</code>
                                    </p>
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
