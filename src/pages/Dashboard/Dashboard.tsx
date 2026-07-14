import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Clock,
  Users,
  Trash2,
  Copy,
  Share2,
  Search,
  Calendar,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePollHistory } from '@/context/PollHistoryContext';
import ShareModal from '../../components/ShareModal';
import toast from 'react-hot-toast';
import { BASE_URL } from '@/config';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { polls, removePoll, clearHistory, updatePoll } = usePollHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<{ code: string; name: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refreshPollStatus = useCallback(async () => {
    setRefreshing(true);
    let updatedCount = 0;

    try {
      const fetchPromises = polls.map(async (poll) => {
        try {
          const response = await fetch(`${BASE_URL}/polls/${poll.code}`, {
            credentials: 'include',
            headers: {
              Accept: 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              updatePoll(poll.code, {
                totalVotes: data.data.totalVotes || 0,
                isActive: data.data.isActive || false,
              });
              updatedCount++;
            }
          }
        } catch (error) {
          console.error(`Failed to fetch poll ${poll.code}:`, error);
        }
      });

      await Promise.all(fetchPromises);

      if (updatedCount > 0) {
        toast.success(`Updated ${updatedCount} poll${updatedCount > 1 ? 's' : ''}`);
      } else {
        toast('No updates available');
      }
    } catch (error) {
      toast.error('Failed to refresh polls');
    } finally {
      setRefreshing(false);
    }
  }, [polls, updatePoll]);

  useEffect(() => {
    if (polls.length === 0) return;

    const interval = setInterval(() => {
      refreshPollStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [polls.length, refreshPollStatus]);

  const filteredPolls = useMemo(() => {
    let result = polls;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (poll) =>
          poll.name.toLowerCase().includes(term) ||
          poll.question.toLowerCase().includes(term) ||
          poll.code.toLowerCase().includes(term)
      );
    }

    if (filter === 'active') {
      result = result.filter((poll) => poll.isActive);
    } else if (filter === 'expired') {
      result = result.filter((poll) => !poll.isActive);
    }

    return result;
  }, [polls, searchTerm, filter]);

  const totalPolls = polls.length;
  const activePolls = polls.filter((p) => p.isActive).length;
  const totalVotes = polls.reduce((sum, p) => sum + p.totalVotes, 0);

  const handleViewPoll = useCallback(
    (code: string) => {
      navigate(`/poll/${code}`);
    },
    [navigate]
  );

  const handleShare = useCallback((code: string, name: string) => {
    setSelectedPoll({ code, name });
    setShareModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    (code: string) => {
      if (window.confirm('Are you sure you want to delete this poll from history?')) {
        removePoll(code);
        toast.success('Poll removed from history');
      }
    },
    [removePoll]
  );

  const handleDuplicate = useCallback(
    (poll: any) => {
      navigate('/create', {
        state: {
          name: `${poll.name} (Copy)`,
          question: poll.question,
          answers: poll.answers || ['', ''],
          multipleChoices: poll.multipleChoices || false,
          duration: 24,
        },
      });
    },
    [navigate]
  );

  const getStatusBadge = useCallback((isActive: boolean, validTill: string) => {
    const isExpired = new Date(validTill).getTime() <= Date.now();
    if (isActive && !isExpired) {
      return <span className={styles.badgeActive}>Active</span>;
    }
    return <span className={styles.badgeExpired}>Expired</span>;
  }, []);

  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.dashboard}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.headerLeft}>
            <div>
              <h1 onClick={() => navigate('/')} className={styles.title}>
                Poll Verse
              </h1>
              <p className={styles.subtitle}>Manage and track all your created polls</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <motion.button
              onClick={refreshPollStatus}
              disabled={refreshing}
              className={styles.refreshButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw size={18} className={refreshing ? styles.spinning : ''} />
              Refresh
            </motion.button>
            <motion.button
              onClick={() => navigate('/create')}
              className={styles.createButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              + New Poll
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className={styles.stats}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.div
            className={styles.statCard}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className={styles.statIcon} style={{ background: 'var(--primary-accent)' }}>
              <BarChart3 size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{totalPolls}</div>
              <div className={styles.statLabel}>Total Polls</div>
            </div>
          </motion.div>
          <motion.div
            className={styles.statCard}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className={styles.statIcon} style={{ background: 'var(--success)' }}>
              <Clock size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{activePolls}</div>
              <div className={styles.statLabel}>Active</div>
            </div>
          </motion.div>
          <motion.div
            className={styles.statCard}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className={styles.statIcon} style={{ background: 'var(--error)' }}>
              <Users size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{totalVotes}</div>
              <div className={styles.statLabel}>Total Votes</div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.controls}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search polls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`${styles.filterButton} ${filter === 'active' ? styles.active : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              className={`${styles.filterButton} ${filter === 'expired' ? styles.active : ''}`}
              onClick={() => setFilter('expired')}
            >
              Expired
            </button>
          </div>
          {polls.length > 0 && (
            <button onClick={clearHistory} className={styles.clearButton}>
              <Trash2 size={16} />
              Clear All
            </button>
          )}
        </motion.div>

        <AnimatePresence>
          {filteredPolls.length === 0 ? (
            <motion.div
              className={styles.emptyState}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {polls.length === 0 ? (
                <>
                  <BarChart3 size={48} className={styles.emptyIcon} />
                  <h3>No polls created yet</h3>
                  <p>Create your first poll and it will appear here</p>
                  <button onClick={() => navigate('/create')} className={styles.emptyButton}>
                    Create a Poll
                  </button>
                </>
              ) : (
                <>
                  <Search size={48} className={styles.emptyIcon} />
                  <h3>No polls found</h3>
                  <p>Try adjusting your search or filter</p>
                </>
              )}
            </motion.div>
          ) : (
            <div className={styles.pollList}>
              {filteredPolls.map((poll, index) => (
                <motion.div
                  key={poll.code}
                  className={styles.pollItem}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{
                    borderColor: 'var(--primary-accent)',
                    boxShadow: 'var(--shadow-hover)',
                    transition: { duration: 0.2 },
                  }}
                >
                  <div className={styles.pollInfo}>
                    <div className={styles.pollHeader}>
                      <h3 className={styles.pollName}>{poll.name}</h3>
                      {getStatusBadge(poll.isActive, poll.validTill)}
                    </div>
                    <p className={styles.pollQuestion}>{poll.question}</p>
                    <div className={styles.pollMeta}>
                      <span className={styles.metaItem}>
                        <Calendar size={14} />
                        {formatDate(poll.createdAt)}
                      </span>
                      <span className={styles.metaItem}>
                        <Users size={14} />
                        {poll.totalVotes} votes
                      </span>
                      <span className={styles.metaItem}>
                        <span className={styles.code}>#{poll.code}</span>
                      </span>
                    </div>
                  </div>
                  <div className={styles.pollActions}>
                    <motion.button
                      onClick={() => handleViewPoll(poll.code)}
                      className={styles.actionButton}
                      title="View Poll"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Eye size={18} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleShare(poll.code, poll.name)}
                      className={styles.actionButton}
                      title="Share Poll"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share2 size={18} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDuplicate(poll)}
                      className={styles.actionButton}
                      title="Duplicate Poll"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Copy size={18} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(poll.code)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      title="Delete from history"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {selectedPoll && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedPoll(null);
          }}
          pollCode={selectedPoll.code}
          pollName={selectedPoll.name}
        />
      )}
    </div>
  );
};

export default Dashboard;
