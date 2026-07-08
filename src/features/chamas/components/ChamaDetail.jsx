import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Users, Wallet, Scale, TrendingUp, Calendar,
  Vote, Plus, HandCoins, Share2, RefreshCw, Settings, Archive, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose, DialogTrigger,
} from '@/components/ui/dialog';
import { PageSpinner } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { chamaApi } from '../api/chamaApi';
import { formatKES, formatDate } from '../../../utils/format';
import MembersList from './MembersList';
import ContributionsList from './ContributionsList';
import LoansList from './LoansList';
import MeetingsList from './MeetingsList';
import PollsList from './PollsList';
import ChamaAnalytics from './ChamaAnalytics';
import UserProfileScore from '../../profile/components/UserProfileScore';
import { toast } from 'sonner';
import useAuthStore from '../../../stores/authStore';

const gradeColors = {
  'A+': 'bg-success text-white',
  'A': 'bg-success text-white',
  'B': 'bg-blue-500 text-white',
  'C': 'bg-alert text-white',
  'D': 'bg-orange-500 text-white',
  'F': 'bg-danger text-white',
};

export default function ChamaDetail({ defaultTab = 'overview' }) {
  const { chamaId } = useParams({ strict: false });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);


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

  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: membersData } = useQuery({
    queryKey: ['chama-members', chamaId],
    queryFn: () => chamaApi.getMembers(chamaId).then((r) => r.data),
    enabled: !!chamaId,
  });
  const members = membersData?.data || membersData?.results || [];
  const currentMember = members.find((m) => m.user_id === user?.id || m.user?.id === user?.id);
  const isAdmin = currentMember && ['CHAIRPERSON', 'TREASURER', 'SECRETARY', 'VICE_CHAIRPERSON'].includes(currentMember.role);

  const archiveMutation = useMutation({
    mutationFn: () => chamaApi.updateChama(chamaId, { status: 'ARCHIVED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['myChamasList'] });
      toast.success('Chama archived');
      navigate({ to: '/chamas' });
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Failed to archive chama'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => chamaApi.deleteChama(chamaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myChamasList'] });
      toast.success('Chama deleted');
      navigate({ to: '/chamas' });
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Failed to delete chama'),
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load chama" onRetry={refetch} />;
  if (!chama) return <ErrorState message="Chama not found" />;

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/chamas' })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors"
            aria-label="Back to chamas"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold font-heading text-slate leading-tight">{chama.chama_name}</h1>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">{chama.chama_type}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-sand hover:bg-sand-light text-slate hover:text-terracotta transition-colors"
            onClick={() => {
              if (inviteData?.invite_code) {
                navigator.clipboard.writeText(inviteData.invite_code);
              }
            }}
          >
            <Share2 className="h-4 w-4 mr-1" /> Invite
          </Button>
        </div>
      </div>

      {/* Health Score */}
      {chama.health?.grade && (
        <div className="px-4 py-3 bg-sand-light/50 border-b border-sand">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate">Chama Health Grade</span>
            <Badge className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border-0 ${gradeColors[chama.health.grade] || 'bg-gray-400'}`}>
              {chama.health.grade} · {chama.health.score}/100
            </Badge>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 p-4">
        <Card className="border-sand bg-white shadow-subtle card-lift">
          <CardContent className="p-4 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta/10">
              <Users className="h-5 w-5 text-terracotta" />
            </div>
            <p className="text-2xl font-bold font-numbers text-slate leading-none mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {chama.total_members}
            </p>
            <p className="text-xs text-gray-400 font-medium">Members</p>
          </CardContent>
        </Card>
        <Card className="border-sand bg-white shadow-subtle card-lift">
          <CardContent className="p-4 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-success/10">
              <Wallet className="h-5 w-5 text-success" />
            </div>
            <p className="text-lg font-bold font-numbers text-slate leading-none mb-1 truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {formatKES(chama.total_savings)}
            </p>
            <p className="text-xs text-gray-400 font-medium">Savings</p>
          </CardContent>
        </Card>
        <Card className="border-sand bg-white shadow-subtle card-lift">
          <CardContent className="p-4 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-alert/10">
              <Scale className="h-5 w-5 text-alert" />
            </div>
            <p className="text-lg font-bold font-numbers text-slate leading-none mb-1 truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {formatKES(chama.outstanding_loans)}
            </p>
            <p className="text-xs text-gray-400 font-medium">Outstanding</p>
          </CardContent>
        </Card>
        <Card className="border-sand bg-white shadow-subtle card-lift">
          <CardContent className="p-4 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-lg font-bold font-numbers text-slate leading-none mb-1 truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {formatKES(chama.available_balance)}
            </p>
            <p className="text-xs text-gray-400 font-medium">Available</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4 flex gap-3 mb-6">
        <Button
          size="sm"
          className="flex-1 bg-terracotta hover:bg-clay text-white shadow-sm transition-all"
          onClick={() => navigate({ to: `/chamas/${chamaId}/contribute` })}
        >
          <Plus className="h-4 w-4 mr-1.5" /> Contribute
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-sand hover:bg-sand-light text-slate hover:text-terracotta transition-all"
          onClick={() => navigate({ to: `/chamas/${chamaId}/loan` })}
        >
          <HandCoins className="h-4 w-4 mr-1.5" /> Request Loan
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-sand hover:bg-sand-light transition-all px-2.5"
          onClick={() => refetch()}
        >
          <RefreshCw className="h-4 w-4 text-gray-400" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="w-full justify-start overflow-x-auto flex gap-1 bg-sand/40 p-1 rounded-full border border-sand">
          <TabsTrigger
            value="overview"
            className="rounded-full text-xs font-semibold px-3 py-1.5 transition-all data-[state=active]:bg-terracotta data-[state=active]:text-white data-[state=active]:shadow-sm cursor-pointer"
          >
            <Calendar className="h-3.5 w-3.5 mr-1" /> Recent
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="rounded-full text-xs font-semibold px-3 py-1.5 transition-all data-[state=active]:bg-terracotta data-[state=active]:text-white data-[state=active]:shadow-sm cursor-pointer"
          >
            <Users className="h-3.5 w-3.5 mr-1" /> Members
          </TabsTrigger>
          <TabsTrigger
            value="contributions"
            className="rounded-full text-xs font-semibold px-3 py-1.5 transition-all data-[state=active]:bg-terracotta data-[state=active]:text-white data-[state=active]:shadow-sm cursor-pointer"
          >
            Contributions
          </TabsTrigger>
          <TabsTrigger
            value="loans"
            className="rounded-full text-xs font-semibold px-3 py-1.5 transition-all data-[state=active]:bg-terracotta data-[state=active]:text-white data-[state=active]:shadow-sm cursor-pointer"
          >
            Loans
          </TabsTrigger>
          <TabsTrigger
            value="meetings"
            className="rounded-full text-xs font-semibold px-3 py-1.5 transition-all data-[state=active]:bg-terracotta data-[state=active]:text-white data-[state=active]:shadow-sm cursor-pointer"
          >
            Meetings
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-full text-xs font-semibold px-3 py-1.5 transition-all data-[state=active]:bg-terracotta data-[state=active]:text-white data-[state=active]:shadow-sm cursor-pointer"
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1" /> Analytics
          </TabsTrigger>
          <TabsTrigger
            value="polls"
            className="rounded-full text-xs font-semibold px-3 py-1.5 transition-all data-[state=active]:bg-terracotta data-[state=active]:text-white data-[state=active]:shadow-sm cursor-pointer"
          >
            <Vote className="h-3.5 w-3.5 mr-1" /> Polls
            {chama.active_polls > 0 && (
              <Badge className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-danger text-white rounded-full border-0">
                {chama.active_polls}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-full text-xs font-semibold px-3 py-1.5 transition-all data-[state=active]:bg-terracotta data-[state=active]:text-white data-[state=active]:shadow-sm cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 mr-1" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4 outline-none">
          <div className="space-y-4">
            <UserProfileScore chamaId={chamaId} />
            {chama.recent_contributions?.length > 0 && (
              <Card className="border-sand shadow-subtle overflow-hidden">
                <CardHeader className="pb-3 pt-4 border-b border-sand bg-sand-light/30">
                  <CardTitle className="text-sm font-semibold text-slate">Recent Contributions</CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-sand">
                  {chama.recent_contributions.map((c) => (
                    <div key={c.id} className="flex items-center justify-between px-4 py-3 hover:bg-sand-light/25 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-slate-dark">{c.member_name}</p>
                        <p className="text-xs text-gray-400 font-medium">{formatDate(c.created_at)}</p>
                      </div>
                      <p className="text-sm font-semibold font-numbers text-success" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatKES(c.amount)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {chama.upcoming_meetings?.length > 0 && (
              <Card className="border-sand shadow-subtle overflow-hidden">
                <CardHeader className="pb-3 pt-4 border-b border-sand bg-sand-light/30">
                  <CardTitle className="text-sm font-semibold text-slate">Upcoming Meetings</CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-sand">
                  {chama.upcoming_meetings.map((m) => (
                    <div key={m.id} className="px-4 py-3 hover:bg-sand-light/25 transition-colors">
                      <p className="text-sm font-medium text-slate-dark">{m.title}</p>
                      <p className="text-xs text-gray-400 font-medium mt-1">
                        {formatDate(m.date)} at {m.start_time?.slice(0, 5)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-4 outline-none">
          <MembersList chamaId={chamaId} />
        </TabsContent>

        <TabsContent value="contributions" className="mt-4 outline-none">
          <ContributionsList chamaId={chamaId} />
        </TabsContent>

        <TabsContent value="loans" className="mt-4 outline-none">
          <LoansList chamaId={chamaId} />
        </TabsContent>

        <TabsContent value="meetings" className="mt-4 outline-none">
          <MeetingsList chamaId={chamaId} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 outline-none">
          <ChamaAnalytics chamaId={chamaId} />
        </TabsContent>
        <TabsContent value="polls" className="mt-4 outline-none">
          <PollsList chamaId={chamaId} />
        </TabsContent>
        <TabsContent value="settings" className="mt-4 outline-none">
          <div className="space-y-4 p-1">
            <Card className="border-danger/20 bg-white shadow-subtle">
              <CardHeader className="pb-3 pt-4 border-b border-danger/10 bg-danger/5">
                <CardTitle className="text-sm font-bold text-danger flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {!isAdmin && (
                  <p className="text-xs text-gray-400 font-medium">Only chama officials can access these settings.</p>
                )}

                {isAdmin && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate">Archive Chama</p>
                        <p className="text-xs text-gray-400 mt-0.5">Mark as archived. Members can still view data.</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm"
                            className="border-alert/30 text-alert hover:bg-alert/5 text-xs font-bold">
                            <Archive className="h-3.5 w-3.5 mr-1" /> Archive
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Archive Chama</DialogTitle>
                            <DialogDescription>
                              Archive {chama.chama_name}? Members will retain read-only access.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline" className="border-sand text-slate">Cancel</Button>
                            </DialogClose>
                            <Button onClick={() => archiveMutation.mutate()}
                              disabled={archiveMutation.isPending}
                              className="bg-alert hover:bg-alert/90 text-white">
                              {archiveMutation.isPending ? 'Archiving...' : 'Archive'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-sand/30">
                      <div>
                        <p className="text-sm font-semibold text-slate">Delete Chama</p>
                        <p className="text-xs text-gray-400 mt-0.5">Permanently delete this chama and all data.</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm"
                            className="border-danger/30 text-danger hover:bg-danger/5 text-xs font-bold">
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Chama</DialogTitle>
                            <DialogDescription>
                              Permanently delete {chama.chama_name} and all associated data? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline" className="border-sand text-slate">Cancel</Button>
                            </DialogClose>
                            <Button onClick={() => deleteMutation.mutate()}
                              disabled={deleteMutation.isPending}
                              className="bg-danger hover:bg-danger/90 text-white">
                              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}