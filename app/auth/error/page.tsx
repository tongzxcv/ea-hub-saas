import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Something went wrong
            </CardTitle>
            <CardDescription>
              We could not complete the authentication flow. Please try
              signing in again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/auth/login"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
