import { ShieldCheck, Mail, Phone, IdCard, CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function VerificationStatus({ profile }) {
  const handleVerifyClick = (type) => {
    toast.info(`${type} verification flow will be available soon.`);
  };

  const isEmailVerified = !!profile?.email_verified;
  const isPhoneVerified = !!profile?.phone_verified;
  const idStatus = profile?.id_verification_status || 'unverified'; // 'unverified' | 'pending' | 'verified' | 'rejected'

  return (
    <Card className="glass-card border-sand bg-white/95 shadow-subtle rounded-2xl overflow-hidden mb-4">
      <CardHeader className="border-b border-sand/30 bg-sand-light/10 p-6 flex flex-row items-center gap-3 space-y-0">
        <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center border border-success/20">
          <ShieldCheck className="h-5 w-5 text-success" />
        </div>
        <div>
          <CardTitle className="text-base text-slate font-bold">Verification Status</CardTitle>
          <CardDescription className="text-xs text-gray-500">Manage your identity and contact verification</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-6 divide-y divide-sand/20 space-y-5 *:pt-5 first:*:pt-0">
        {/* Email Verification */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-sand-light flex items-center justify-center border border-sand text-slate/75">
              <Mail className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate">Email Address</p>
              <p className="text-xs text-gray-400 mt-0.5">{profile?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEmailVerified ? (
              <Badge className="bg-success/10 text-success border border-success/20 gap-1 rounded-full font-semibold px-2.5" variant="outline">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
              </Badge>
            ) : (
              <>
                <Badge className="bg-alert/10 text-alert border border-alert/20 gap-1 rounded-full font-semibold px-2.5" variant="outline">
                  <AlertCircle className="h-3.5 w-3.5" /> Unverified
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-sand hover:bg-sand-light text-slate hover:text-terracotta text-xs font-semibold h-8 rounded-lg shadow-subtle px-3 transition-all"
                  onClick={() => handleVerifyClick('Email')}
                >
                  Verify
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Phone Verification */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-sand-light flex items-center justify-center border border-sand text-slate/75">
              <Phone className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate">Phone Number</p>
              <p className="text-xs text-gray-400 mt-0.5">{profile?.phone_number || 'No phone number provided'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isPhoneVerified ? (
              <Badge className="bg-success/10 text-success border border-success/20 gap-1 rounded-full font-semibold px-2.5" variant="outline">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
              </Badge>
            ) : (
              <>
                <Badge className="bg-alert/10 text-alert border border-alert/20 gap-1 rounded-full font-semibold px-2.5" variant="outline">
                  <AlertCircle className="h-3.5 w-3.5" /> Unverified
                </Badge>
                {profile?.phone_number && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-sand hover:bg-sand-light text-slate hover:text-terracotta text-xs font-semibold h-8 rounded-lg shadow-subtle px-3 transition-all"
                    onClick={() => handleVerifyClick('Phone')}
                  >
                    Verify
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* ID Verification */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-sand-light flex items-center justify-center border border-sand text-slate/75">
              <IdCard className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate">Identity Verification</p>
              <p className="text-xs text-gray-400 mt-0.5">Government issued ID verification</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {idStatus === 'verified' && (
              <Badge className="bg-success/10 text-success border border-success/20 gap-1 rounded-full font-semibold px-2.5" variant="outline">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
              </Badge>
            )}
            {idStatus === 'pending' && (
              <Badge className="bg-sand text-slate border border-sand-dark/20 gap-1 rounded-full font-semibold px-2.5" variant="outline">
                <Clock className="h-3.5 w-3.5" /> Pending
              </Badge>
            )}
            {idStatus === 'rejected' && (
              <>
                <Badge className="bg-danger/10 text-danger border border-danger/20 gap-1 rounded-full font-semibold px-2.5" variant="outline">
                  <XCircle className="h-3.5 w-3.5" /> Rejected
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-danger/30 hover:border-danger hover:bg-danger/5 text-danger text-xs font-semibold h-8 rounded-lg px-3 transition-all"
                  onClick={() => handleVerifyClick('ID')}
                >
                  Retry
                </Button>
              </>
            )}
            {idStatus === 'unverified' && (
              <>
                <Badge className="bg-alert/10 text-alert border border-alert/20 gap-1 rounded-full font-semibold px-2.5" variant="outline">
                  <AlertCircle className="h-3.5 w-3.5" /> Unverified
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-sand hover:bg-sand-light text-slate hover:text-terracotta text-xs font-semibold h-8 rounded-lg shadow-subtle px-3 transition-all"
                  onClick={() => handleVerifyClick('ID')}
                >
                  Verify
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
