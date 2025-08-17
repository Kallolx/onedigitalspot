import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { account } from '@/lib/appwrite';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const redirect = `${window.location.origin}/auth/reset-password`;
      await account.createRecovery(email, redirect);
      setMessage('If that email exists in our system, a recovery link has been sent. Check your inbox.');
      setEmail('');
    } catch (err: any) {
      setError(err?.message || 'Failed to send recovery email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <a href="/" className="inline-block mb-4">
            <img src="/assets/logo-av.avif" alt="logo" className="h-14 mx-auto" />
          </a>
          <h1 className="text-2xl font-pixel text-foreground">Forgot password</h1>
          <p className="text-sm text-muted-foreground mt-2">Enter your email and we'll send a recovery link.</p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            {/* optional header */}
          </CardHeader>
          <CardContent>
            {message && <div className="text-sm text-green-600 mb-3">{message}</div>}
            {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="you@domain.com" />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Send recovery email'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
