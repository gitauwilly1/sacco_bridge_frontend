import { useEffect } from 'react';
import { Link, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useAuthStore from '../../../stores/authStore';
import { toast } from 'sonner';

export default function ConnectedAccounts({ profile }) {
  const { googleLogin } = useAuthStore();

  // Google status check:
  // Usually checks profile.google_connected or profile.google_email
  const isGoogleConnected = !!(profile?.google_connected || profile?.google_email || profile?.social_accounts?.google);
  const googleEmail = profile?.google_email || profile?.email;

  const handleGoogleCredentialResponse = async (response) => {
    try {
      toast.loading('Linking Google account...');
      await googleLogin(response.credential);
      toast.dismiss();
      toast.success('Google account connected successfully!');
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Google connection failed');
    }
  };

  useEffect(() => {
    let intervalId;
    
    const initGoogleBtn = () => {
      if (window.google && !isGoogleConnected) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '134711840304-ockr8g82imvcnfhk387oodp1uikno8pc.apps.googleusercontent.com',
            callback: handleGoogleCredentialResponse,
          });
          
          const container = document.getElementById("google-connect-btn-container");
          if (container) {
            window.google.accounts.id.renderButton(container, {
              theme: "outline",
              size: "medium",
              text: "signup_with",
            });
          }
          if (intervalId) clearInterval(intervalId);
        } catch (err) {
          console.error("Google Client SDK init failed:", err);
        }
      }
    };

    initGoogleBtn();
    if (!window.google && !isGoogleConnected) {
      intervalId = setInterval(initGoogleBtn, 300);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isGoogleConnected]);


  return (
    <Card className="glass-card border-sand bg-white/95 shadow-subtle rounded-2xl overflow-hidden mb-4">
      <CardHeader className="border-b border-sand/30 bg-sand-light/10 p-6 flex flex-row items-center gap-3 space-y-0">
        <div className="h-10 w-10 rounded-xl bg-terracotta/10 flex items-center justify-center border border-terracotta/20">
          <Link className="h-5 w-5 text-terracotta" />
        </div>
        <div>
          <CardTitle className="text-base text-slate font-bold">Connected Accounts</CardTitle>
          <CardDescription className="text-xs text-gray-500">Connect third-party services for faster login</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Google inline SVG brand logo */}
            <div className="h-9 w-9 rounded-lg bg-sand-light flex items-center justify-center border border-sand text-slate/75">
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate">Google</p>
              {isGoogleConnected ? (
                <p className="text-xs text-gray-400 mt-0.5">{googleEmail}</p>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5">Connect your Google account to sign in faster</p>
              )}
            </div>
          </div>

          <div>
            {isGoogleConnected ? (
              <div className="flex items-center gap-3">
                <Badge className="bg-success/10 text-success border border-success/20 rounded-full font-semibold px-2.5" variant="outline">
                  Connected
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="border-sand text-gray-300 bg-gray-50/50 cursor-not-allowed text-xs font-semibold h-8 rounded-lg px-3"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-sand hover:bg-sand-light text-slate hover:text-terracotta text-xs font-semibold h-8 rounded-lg shadow-subtle px-3 transition-all flex items-center gap-1.5"
                  type="button"
                >
                  Connect <ExternalLink className="h-3 w-3" />
                </Button>
                <div
                  id="google-connect-btn-container"
                  className="absolute inset-0 opacity-0 overflow-hidden cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
