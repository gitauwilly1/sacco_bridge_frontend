import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { RefreshCw, User, CheckCircle2, XCircle, Eye, Mail, Phone, Clock, FileText, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatDate } from '../../../utils/format';
import DataTable from './DataTable';
import { KYC_COLORS, getStatusColor } from '../../../utils/statusMapping';

const DOC_TYPE_LABELS = {
  NATIONAL_ID_FRONT: 'National ID (Front)',
  NATIONAL_ID_BACK: 'National ID (Back)',
  PASSPORT: 'Passport',
  DRIVERS_LICENSE: "Driver's License",
  SELFIE: 'Selfie Photo',
  UTILITY_BILL: 'Utility Bill',
};

export default function AdminKYCList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('pending');
  const [viewingDocs, setViewingDocs] = useState(null);

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () =>
      adminApi
        .getUsers({
          page,
          page_size: 20,
          ...(search && { search }),
        })
        .then((r) => r.data),
  });

  const manageMutation = useMutation({
    mutationFn: ({ userId, action }) => adminApi.manageUser(userId, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('KYC status updated');
    },
    onError: () => toast.error('Action failed'),
  });

  const allUsers = usersData?.results || usersData?.data || [];
  const filteredUsers = kycFilter === 'all'
    ? allUsers
    : allUsers.filter((u) => (u.kyc_status || 'unverified') === kycFilter);
  const total = usersData?.pagination?.count ?? usersData?.count ?? allUsers.length;

  const columns = [
    {
      key: 'full_name',
      header: 'User',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-sand-light border border-sand/30 flex items-center justify-center flex-shrink-0 shadow-subtle">
            <User className="h-4 w-4 text-terracotta/60" />
          </div>
          <div>
            <p className="font-bold text-slate text-xs">
              {row.first_name || ''} {row.last_name || ''}
            </p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5 flex items-center gap-1">
              <Mail className="h-2.5 w-2.5" /> {row.email || '—'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone_number',
      header: 'Phone',
      render: (value) => (
        <span className="text-[11px] text-gray-405 font-medium flex items-center gap-1">
          <Phone className="h-3 w-3" /> {value || '—'}
        </span>
      ),
    },
    {
      key: 'kyc_status',
      header: 'KYC Status',
      render: (value) => (
        <Badge
          className={`text-[10px] font-extrabold rounded-full px-2 py-0.5 shadow-none ${getStatusColor(value, KYC_COLORS)}`}
          variant="outline"
        >
          {value || 'unverified'}
        </Badge>
      ),
    },
    {
      key: 'email_verified',
      header: 'Email',
      render: (value) => (
        value
          ? <Badge className="bg-success/10 text-success border-success/20 text-[9px] font-bold rounded-full px-1.5 py-0" variant="outline"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Verified</Badge>
          : <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-[9px] font-bold rounded-full px-1.5 py-0" variant="outline">No</Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (value) => (
        <span className="text-[11px] text-gray-405 font-medium font-numbers flex items-center gap-1">
          <Clock className="h-3 w-3" /> {value ? formatDate(value) : '—'}
        </span>
      ),
    },
  ];

  const rowActions = (row) => {
    const status = row.kyc_status || 'unverified';
    return (
      <div className="flex items-center gap-1.5 justify-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setViewingDocs(row)}
          className="text-slate/75 hover:text-terracotta hover:bg-sand-light/50 h-8 rounded-lg text-xs font-semibold px-2 cursor-pointer transition-all"
        >
          <Eye className="h-3.5 w-3.5 mr-1" /> Docs
        </Button>
        {(status === 'pending' || status === 'unverified') && (
          <Button
            size="sm"
            variant="ghost"
            className="text-success hover:bg-success/10 hover:text-success h-8 rounded-lg text-xs font-semibold px-2 cursor-pointer transition-all"
            onClick={() => {
              if (window.confirm(`Verify identity for ${row.first_name || row.email}?`)) {
                manageMutation.mutate({ userId: row.id, action: 'verify_identity' });
              }
            }}
            disabled={manageMutation.isPending}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verify
          </Button>
        )}
        {(status === 'pending' || status === 'verified') && (
          <Button
            size="sm"
            variant="ghost"
            className="text-danger hover:bg-danger/10 hover:text-danger h-8 rounded-lg text-xs font-semibold px-2 cursor-pointer transition-all"
            onClick={() => {
              if (window.confirm(`Reject identity for ${row.first_name || row.email}?`)) {
                manageMutation.mutate({ userId: row.id, action: 'reject_identity' });
              }
            }}
            disabled={manageMutation.isPending}
          >
            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">KYC Verification</h1>
          <p className="text-sm text-gray-500">{total} total users</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={kycFilter}
            onChange={(e) => {
              setKycFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-sand-dark/30 rounded-xl px-2.5 py-1.5 bg-white text-slate font-bold cursor-pointer focus:ring-1 focus:ring-terracotta"
          >
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="border-sand hover:bg-sand-light text-slate cursor-pointer h-8 w-8 p-0 rounded-lg">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        totalCount={filteredUsers.length}
        page={page}
        onPageChange={setPage}
        pageSize={20}
        searchValue={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        emptyMessage="No users match the filter"
        rowActions={rowActions}
      />

      {viewingDocs && <KYCDocumentDialog user={viewingDocs} onClose={() => setViewingDocs(null)} />}
    </div>
  );
}

function KYCDocumentDialog({ user, onClose }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-kyc-docs', user.id],
    queryFn: () => adminApi.getAdminKYCDocuments(user.id).then((r) => r.data?.data || r.data),
  });

  const docs = data?.documents || [];
  const status = data?.id_verification_status || user.kyc_status || 'unverified';

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate">
            {user.first_name || ''} {user.last_name || ''} — KYC Documents
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            {user.email} · Status: <Badge className={`text-[10px] font-extrabold rounded-full px-2 py-0.5 shadow-none ${getStatusColor(status, KYC_COLORS)}`} variant="outline">{status}</Badge>
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-shimmer h-20 w-full rounded-xl" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-danger text-center py-6">Failed to load documents</p>
        )}

        {!isLoading && !error && docs.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No documents uploaded yet</p>
          </div>
        )}

        {!isLoading && !error && docs.length > 0 && (
          <div className="space-y-3 py-2">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-sand/40 bg-sand-light/20">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-terracotta/10 flex items-center justify-center border border-terracotta/20">
                    <FileText className="h-4 w-4 text-terracotta" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate">{DOC_TYPE_LABELS[doc.document_type] || doc.document_type}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(doc.uploaded_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.is_verified ? (
                    <Badge className="bg-success/10 text-success border-success/20 text-[9px] font-bold rounded-full px-1.5 py-0" variant="outline">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Verified
                    </Badge>
                  ) : doc.rejection_reason ? (
                    <Badge className="bg-danger/10 text-danger border-danger/20 text-[9px] font-bold rounded-full px-1.5 py-0" variant="outline">
                      <XCircle className="h-2.5 w-2.5 mr-0.5" /> Rejected
                    </Badge>
                  ) : (
                    <Badge className="bg-alert/10 text-alert border-alert/20 text-[9px] font-bold rounded-full px-1.5 py-0" variant="outline">
                      Pending
                    </Badge>
                  )}
                  {doc.file && (
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-terracotta hover:text-terracotta-dark transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
