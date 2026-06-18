import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Users, Wallet, Scale, TrendingUp, Calendar,
  Vote, Plus, HandCoins, Share2, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PageSpinner } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { chamaApi } from '../api/chamaApi';
import { formatKES, formatDate, formatPhone } from '../../../utils/format';
import MembersList from './MembersList';
import ContributionsList from './ContributionsList';
import LoansList from './LoansList';
import MeetingsList from './MeetingsList';
import PollsList from './PollsList';

const gradeColors = {
  'A+': 'bg-success text-white',
  'A': 'bg-success text-white',
  'B': 'bg-blue-500 text-white',
  'C': 'bg-alert text-white',
  'D': 'bg-orange-500 text-white',
  'F': 'bg-danger text-white',
};

export default function ChamaDetail() {
  const { chamaId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const {
    data: chama,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['chama', chamaId],
    queryFn: () => chamaApi.getChamaDashboard(chamaId).then((r) => r.data.data),
    enabled: !!chamaId,
  });

  const { data: inviteData } = useQuery({
    queryKey: ['chama-invite', chamaId],
    queryFn: () => chamaApi.getInviteLink(chamaId).then((r) => r.data.data),
    enabled: !!chamaId,
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load chama" onRetry={refetch} />;
  if (!chama) return <ErrorState message="Chama not found" />;

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/chamas' })}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate">{chama.chama_name}</h1>
            <p className="text-xs text-gray-500">{chama.chama_type}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => {
            if (inviteData?.invite_code) {
              navigator.clipboard.writeText(inviteData.invite_code);
            }
          }}>
            <Share2 className="h-4 w-4 mr-1" /> Invite
          </Button>
        </div>
      </div>

      {/* Health Score */}
      {chama.health?.grade && (
        <div className="px-4 py-3 bg-white border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate">Health Score</span>
            <Badge className={gradeColors[chama.health.grade] || 'bg-gray-400'}>
              {chama.health.grade} · {chama.health.score}/100
            </Badge>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 p-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-terracotta mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate">{chama.total_members}</p>
            <p className="text-xs text-gray-500">Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Wallet className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate">{formatKES(chama.total_savings)}</p>
            <p className="text-xs text-gray-500">Savings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Scale className="h-5 w-5 text-alert mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate">{formatKES(chama.outstanding_loans)}</p>
            <p className="text-xs text-gray-500">Outstanding</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate">{formatKES(chama.available_balance)}</p>
            <p className="text-xs text-gray-500">Available</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4 flex gap-2 mb-4">
        <Button
          size="sm"
          className="flex-1"
          onClick={() => navigate({ to: `/chamas/${chamaId}/contribute` })}
        >
          <Plus className="h-4 w-4 mr-1" /> Contribute
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => navigate({ to: `/chamas/${chamaId}/loan` })}
        >
          <HandCoins className="h-4 w-4 mr-1" /> Loan
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">
            <Calendar className="h-4 w-4 mr-1" /> Recent
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-1" /> Members
          </TabsTrigger>
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="polls">
            <Vote className="h-4 w-4 mr-1" />
            {chama.active_polls > 0 && (
              <Badge className="ml-1 h-4 w-4 p-0 text-[10px] bg-danger">
                {chama.active_polls}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="space-y-4">
            {chama.recent_contributions?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Recent Contributions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {chama.recent_contributions.map((c) => (
                    <div key={c.id} className="flex items-center justify-between px-4 py-2 border-t">
                      <div>
                        <p className="text-sm font-medium">{c.member_name}</p>
                        <p className="text-xs text-gray-500">{formatDate(c.created_at)}</p>
                      </div>
                      <p className="text-sm font-semibold text-success">{formatKES(c.amount)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {chama.upcoming_meetings?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Upcoming Meetings</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {chama.upcoming_meetings.map((m) => (
                    <div key={m.id} className="px-4 py-2 border-t">
                      <p className="text-sm font-medium">{m.title}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(m.date)} at {m.start_time?.slice(0, 5)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <MembersList chamaId={chamaId} />
        </TabsContent>

        <TabsContent value="contributions" className="mt-4">
          <ContributionsList chamaId={chamaId} />
        </TabsContent>

        <TabsContent value="loans" className="mt-4">
          <LoansList chamaId={chamaId} />
        </TabsContent>

        <TabsContent value="meetings" className="mt-4">
          <MeetingsList chamaId={chamaId} />
        </TabsContent>

        <TabsContent value="polls" className="mt-4">
          <PollsList chamaId={chamaId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}