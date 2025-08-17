import React, { useEffect, useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { account } from '@/lib/appwrite';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get('userId') || '';
  const secret = searchParams.get('secret') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !secret) {
      setError('Invalid recovery link.');
    }
  }, [userId, secret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 8) return setError('Password must be at least 8 characters');

    setLoading(true);
    try {
  // Appwrite client expects (userId, secret, password)
  await account.updateRecovery(userId, secret, password);
      setMessage('Password updated. Redirecting to login...');
      setTimeout(() => navigate('/auth/login'), 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password');
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
          <h1 className="text-2xl font-pixel text-foreground">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-2">Set a new password for your account.</p>
        </div>

        <Card>
          <CardHeader className="pb-2"></CardHeader>
          <CardContent>
            {message && <div className="text-sm text-green-600 mb-3">{message}</div>}
            {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input id="password" type={show ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Confirm password</label>
                <Input id="confirm" type={show ? 'text' : 'password'} required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Saving...' : 'Save new password'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
