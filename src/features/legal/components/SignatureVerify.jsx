import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, ShieldX, FileSignature, User, Calendar, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { profileApi } from '../../profile/api/profileApi';

export default function SignatureVerify() {
  const { hash } = useParams({ strict: false });

  const { data, isLoading, error } = useQuery({
    queryKey: ['signature-verify', hash],
    queryFn: () =>
      profileApi.verifySignature(hash).then((r) => {
        const d = r.data.data || r.data;
        return d;
      }),
    enabled: !!hash,
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    </div>
  );

  const isValid = data?.is_valid && !error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md border-sand bg-white shadow-subtle rounded-3xl overflow-hidden">
        <div className={`p-6 text-center ${isValid ? 'bg-success/5' : 'bg-danger/5'}`}>
          <div className={`mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center ${
            isValid ? 'bg-success/10' : 'bg-danger/10'
          }`}>
            {isValid ? (
              <ShieldCheck className="h-8 w-8 text-success" />
            ) : (
              <ShieldX className="h-8 w-8 text-danger" />
            )}
          </div>
          <Badge className={`text-sm font-bold px-4 py-1.5 rounded-full border-0 ${
            isValid ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}>
            {isValid ? '✓ Signature Verified' : '✗ Invalid Signature'}
          </Badge>
          {!isValid && (
            <p className="text-sm text-gray-500 mt-3">
              This signature could not be verified. The certificate hash may be invalid or the document has not been signed.
            </p>
          )}
        </div>

        {isValid && data && (
          <CardContent className="p-6 space-y-4">
            <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider text-center">
              Signature Details
            </CardTitle>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-sand-light/50">
                <User className="h-5 w-5 text-terracotta flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Signed By</p>
                  <p className="text-sm font-semibold text-slate">{data.signer_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-sand-light/50">
                <FileSignature className="h-5 w-5 text-terracotta flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Document</p>
                  <p className="text-sm font-semibold text-slate">{data.document_title}</p>
                  <p className="text-xs text-gray-400">{data.document_type}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-sand-light/50">
                <Calendar className="h-5 w-5 text-terracotta flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Signed At</p>
                  <p className="text-sm font-semibold text-slate">
                    {new Date(data.signed_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {data.ip_address && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-sand-light/50">
                  <Globe className="h-5 w-5 text-terracotta flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">IP Address</p>
                    <p className="text-sm font-semibold text-slate">{data.ip_address}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}