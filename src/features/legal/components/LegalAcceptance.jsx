import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText, CheckCircle2, XCircle, Shield, Eye, ArrowLeft,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { legalApi } from '../api/legalApi';
import { formatDate } from '../../../utils/format';
import { toast } from 'sonner';

export default function LegalAcceptance() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [viewDoc, setViewDoc] = useState(null);

  const { data: terms, isLoading: termsLoading } = useQuery({
    queryKey: ['legal-terms'],
    queryFn: () => legalApi.getTerms().then((r) => r.data.data || r.data).catch(() => null),
  });

  const { data: privacy, isLoading: privacyLoading } = useQuery({
    queryKey: ['legal-privacy'],
    queryFn: () => legalApi.getPrivacy().then((r) => r.data.data || r.data).catch(() => null),
  });

  const { data: status } = useQuery({
    queryKey: ['legal-status'],
    queryFn: () => legalApi.getAcceptanceStatus().then((r) => r.data.data || r.data),
  });

  const acceptMutation = useMutation({
    mutationFn: (documentId) => legalApi.acceptDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-status'] });
      toast.success('Document accepted');
    },
    onError: () => toast.error('Failed to accept document'),
  });

  if (viewDoc) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost" size="sm"
          onClick={() => setViewDoc(null)}
          className="text-xs text-gray-500 hover:text-slate"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to documents
        </Button>
        <Card className="border-sand bg-white shadow-subtle rounded-2xl">
          <CardHeader className="pb-3 border-b border-sand/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate">{viewDoc.title}</CardTitle>
              <Badge className="text-[10px] bg-sand-light text-slate border-0 rounded-full">
                v{viewDoc.version}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Effective from {formatDate(viewDoc.effective_from)}
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="prose prose-sm max-w-none text-sm text-slate leading-relaxed whitespace-pre-wrap">
              {viewDoc.content}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (termsLoading || privacyLoading) {
    return <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>;
  }

  const docs = [
    {
      title: 'Terms & Conditions',
      doc: terms,
      accepted: status?.terms_accepted,
      key: 'terms',
    },
    {
      title: 'Privacy Policy',
      doc: privacy,
      accepted: status?.privacy_accepted,
      key: 'privacy',
    },
  ].filter((d) => d.doc);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate">Legal Documents</h1>
        <p className="text-sm text-gray-500 mt-1">
          {status?.all_accepted
            ? 'All documents accepted'
            : 'Review and accept our legal documents to continue using the platform'}
        </p>
      </div>

      {docs.map(({ title, doc, accepted, key }) => (
        <Card key={key} className={`border-sand bg-white shadow-subtle rounded-2xl ${accepted ? 'border-l-success border-l-4' : 'border-l-alert border-l-4'}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${accepted ? 'bg-success/10' : 'bg-alert/10'}`}>
                  {accepted ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <FileText className="h-5 w-5 text-alert" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate">{title}</p>
                  <p className="text-xs text-gray-400">Version {doc.version} &middot; {formatDate(doc.effective_from)}</p>
                </div>
              </div>
              <Badge className={`text-[10px] font-semibold rounded-full border-0 ${accepted ? 'bg-success/10 text-success' : 'bg-alert/10 text-alert'}`}>
                {accepted ? 'Accepted' : 'Pending'}
              </Badge>
            </div>
            {doc.summary && (
              <p className="text-xs text-gray-500 mb-3 bg-sand-light/50 rounded-xl p-3">{doc.summary}</p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm"
                onClick={() => setViewDoc(doc)}
                className="border-sand/40 text-slate text-xs"
              >
                <Eye className="h-3.5 w-3.5 mr-1" /> View
              </Button>
              {!accepted && (
                <Button
                  size="sm"
                  onClick={() => acceptMutation.mutate(doc.id)}
                  disabled={acceptMutation.isPending}
                  className="bg-terracotta text-white hover:bg-clay text-xs"
                >
                  <Shield className="h-3.5 w-3.5 mr-1" /> Accept
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {docs.length === 0 && (
        <Card className="border-sand bg-sand-light/30 rounded-2xl">
          <CardContent className="p-8 text-center">
            <FileText className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No legal documents published yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}