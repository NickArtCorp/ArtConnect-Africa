import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useLanguageStore, useReferenceStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, XCircle, Eye, Mail, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { translateSector, translateDomain } from '@/lib/utils';
import axios from 'axios';

function AdminApproval() {
  const { t, language } = useLanguageStore();
  const { token } = useAuthStore();
  const { sectors, domains } = useReferenceStore();
  const navigate = useNavigate();

  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  // Fetch pending approvals
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/pending-approvals`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        setPendingUsers(response.data);
      } catch (error) {
        console.error('Error fetching pending approvals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchPendingApprovals();
    } else {
      navigate('/login');
    }
  }, [token, navigate, API_BASE_URL]);

  const handleApprove = async () => {
    if (!selectedUser) return;

    setIsProcessing(true);
    try {
      await axios.post(`${API_BASE_URL}/admin/approve-user`, {
        user_id: selectedUser.id,
        status: 'approved',
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setSuccessMessage(t.admin.approvedSuccess);
      setSelectedUser(null);
      setRejectionReason('');
      setShowDetails(false);

      // Refresh list
      setPendingUsers(pendingUsers.filter(u => u.id !== selectedUser.id));

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error approving user:', error);
      alert(t.common.error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectionReason.trim()) {
      alert(t.admin.rejectionReason);
      return;
    }

    setIsProcessing(true);
    try {
      await axios.post(`${API_BASE_URL}/admin/approve-user`, {
        user_id: selectedUser.id,
        status: 'rejected',
        rejection_reason: rejectionReason,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setSuccessMessage(t.admin.rejectedSuccess);
      setSelectedUser(null);
      setRejectionReason('');
      setShowDetails(false);

      // Refresh list
      setPendingUsers(pendingUsers.filter(u => u.id !== selectedUser.id));

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert(t.common.error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Mail className="w-8 h-8" />
              {t.admin.userApprovals}
            </h1>
            <p className="text-muted-foreground">
              {t.admin.reviewRegistrations}
            </p>
          </div>
          <Button onClick={() => navigate('/admin/create-partner')} className="rounded-full gap-2">
            <Plus className="w-4 h-4" />
            {t.admin.createPartner}
          </Button>
        </div>

        {successMessage && (
          <div className="p-4 mb-6 rounded-lg bg-green-50 text-green-800 border border-green-200">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Users List */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">
                {t.admin.pendingUsers} ({pendingUsers.length})
              </h2>

              {pendingUsers.length === 0 ? (
                <p className="text-muted-foreground text-sm">{t.admin.noPending}</p>
              ) : (
                <div className="space-y-2">
                  {pendingUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDetails(true);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedUser?.id === user.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-accent border-border'
                      }`}
                    >
                      <p className="font-medium text-sm">
                        {user.organization_name || `${user.first_name} ${user.last_name}`}
                      </p>
                      <p className="text-xs opacity-75">{user.email}</p>
                      <p className="text-xs opacity-75 mt-1 capitalize">
                        {user.role} • {user.country}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Details & Actions */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-xl border border-border p-6 space-y-6"
              >
                {/* User Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t.admin.userInfo}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedUser.organization_name ? (
                      <div>
                        <p className="text-muted-foreground">{t.auth.organizationName}</p>
                        <p className="font-medium">{selectedUser.organization_name}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted-foreground">{t.auth.firstName} & {t.auth.lastName}</p>
                        <p className="font-medium">
                          {selectedUser.first_name} {selectedUser.last_name}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">{t.auth.email}</p>
                      <p className="font-medium break-all">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Role</p>
                      <p className="font-medium capitalize">{selectedUser.role}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t.auth.profileTag}</p>
                      <p className="font-medium capitalize">
                        {selectedUser.profile_tag || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t.auth.country}</p>
                      <p className="font-medium">{selectedUser.country}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t.auth.subregion}</p>
                      <p className="font-medium">{selectedUser.subregion || 'N/A'}</p>
                    </div>
                    {selectedUser.sector && (
                      <div>
                        <p className="text-muted-foreground">{t.auth.sector}</p>
                        <p className="font-medium">{translateSector(selectedUser.sector, sectors, language)}</p>
                      </div>
                    )}
                    {selectedUser.domain && (
                      <div>
                        <p className="text-muted-foreground">{t.auth.domain}</p>
                        <p className="font-medium">{translateDomain(selectedUser.domain, domains, selectedUser.sector, language)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {selectedUser.bio && (
                  <div>
                    <h4 className="font-medium mb-2">
                      {selectedUser.role === 'partenaire' || selectedUser.role === 'personne_morale' || (selectedUser.role === 'visitor' && selectedUser.visitor_type === 'organisation')
                        ? t.auth.presentationOrg
                        : (selectedUser.profile_tag === 'artist' ? t.auth.biographyArtist : t.auth.presentationIndividual)}
                    </h4>
                    <p className="text-sm text-muted-foreground">{selectedUser.bio}</p>
                  </div>
                )}

                {/* Additional Info */}
                {selectedUser.additional_info && (
                  <div>
                    <h4 className="font-medium mb-2">{t.auth.additionalInfo}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.additional_info}
                    </p>
                  </div>
                )}

                {/* Rejection Reason Input (visible only when rejecting) */}
                {showDetails && (
                  <div>
                    <Label htmlFor="rejection-reason" className="mb-2 block">
                      {t.admin.rejectionReason}
                    </Label>
                    <Textarea
                      id="rejection-reason"
                      placeholder={t.admin.rejectionPlaceholder}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="resize-none h-24"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    {t.admin.approve}
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={isProcessing || !rejectionReason.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    {t.admin.reject}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {t.admin.selectUser}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminApproval;
