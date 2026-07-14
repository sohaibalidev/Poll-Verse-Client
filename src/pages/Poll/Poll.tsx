import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePollHistory } from '@/context/PollHistoryContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Users,
  Check,
  Vote,
  ArrowLeft,
  BarChart3,
  Crown,
  AlertCircle,
  CheckCircle2,
  Share2,
  Home,
} from 'lucide-react';
import { BASE_URL } from '@/config';
import styles from './Poll.module.css';
import ShareModal from '@/components/ShareModal';

interface Poll {
  id: string;
  code: string;
  name: string;
  question: string;
  answers: string[];
  multipleChoices: boolean;
  validTill: string;
  isActive: boolean;
  voteCounts: number[];
  totalVotes: number;
  userVote: number[] | null;
}

const Poll: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { socket, isConnected, joinPoll, leavePoll } = useSocket();
  const { updatePoll } = usePollHistory();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const fetchPoll = useCallback(async () => {
    if (!code) return;

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${BASE_URL}/polls/${code}`, {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Poll not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPoll(data.data);
        if (data.data.userVote) {
          setSelectedOptions(data.data.userVote);
          setHasVoted(true);
        } else {
          setSelectedOptions([]);
          setHasVoted(false);
        }
      } else {
        setError(data.message || 'Failed to fetch poll');
      }
    } catch (error) {
      console.error('Error fetching poll:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch poll');
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    if (!code) {
      setError('No poll code provided');
      setLoading(false);
      return;
    }

    fetchPoll();

    if (socket && isConnected) {
      joinPoll(code);
    }

    return () => {
      if (socket && isConnected && code) {
        leavePoll(code);
      }
    };
  }, [code, socket, isConnected, joinPoll, leavePoll, fetchPoll]);

  useEffect(() => {
    if (!socket) return;

    const handleVoteUpdate = (data: { voteCounts: number[]; totalVotes: number }) => {
      setPoll((prev) =>
        prev
          ? {
              ...prev,
              voteCounts: data.voteCounts,
              totalVotes: data.totalVotes,
            }
          : null
      );
    };

    socket.on('voteUpdate', handleVoteUpdate);

    return () => {
      socket.off('voteUpdate', handleVoteUpdate);
    };
  }, [socket]);

  const handleOptionSelect = useCallback(
    (index: number) => {
      if (!poll || hasVoted || !poll.isActive) return;

      setSelectedOptions((prev) => {
        if (poll.multipleChoices) {
          return prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index];
        } else {
          return prev[0] === index ? [] : [index];
        }
      });
    },
    [poll, hasVoted]
  );

  const submitVote = useCallback(async () => {
    if (!poll || selectedOptions.length === 0 || !poll.isActive || hasVoted) return;

    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch(`${BASE_URL}/polls/${code}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          selected: selectedOptions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (poll) {
          updatePoll(poll.code, {
            totalVotes: data.data.totalVotes,
            isActive: new Date(poll.validTill) > new Date(),
          });
        }

        setPoll((prev) =>
          prev
            ? {
                ...prev,
                voteCounts: data.data.voteCounts,
                totalVotes: data.data.totalVotes,
                userVote: selectedOptions,
              }
            : null
        );
        setHasVoted(true);
      } else {
        setError(data.message || 'Failed to submit vote');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  }, [poll, selectedOptions, code, hasVoted]);

  const calculatePercentage = useCallback((votes: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  }, []);

  const getTimeRemaining = useCallback((validTill: string): string => {
    const now = new Date().getTime();
    const end = new Date(validTill).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  const getWinningOption = useCallback((): number => {
    if (!poll || poll.totalVotes === 0) return -1;

    const maxVotes = Math.max(...poll.voteCounts);
    const winningIndex = poll.voteCounts.findIndex((votes) => votes === maxVotes);

    const isTie = poll.voteCounts.filter((votes) => votes === maxVotes).length > 1;
    return isTie ? -1 : winningIndex;
  }, [poll]);

  const showResults = useMemo(() => hasVoted || !poll?.isActive, [hasVoted, poll?.isActive]);

  const isExpired = useMemo(
    () => (poll ? new Date(poll.validTill).getTime() <= Date.now() : false),
    [poll]
  );

  const winningOption = useMemo(() => getWinningOption(), [getWinningOption]);

  if (loading) {
    return (
      <motion.div
        className={styles.loadingContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.loadingContent}>
          <motion.div
            className={styles.loadingSpinner}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <div className={styles.spinner}></div>
          </motion.div>
          <p className={styles.loadingText}>Loading poll...</p>
          <div className={styles.loadingDots}>
            <motion.span
              className={styles.dot}
              animate={{ scale: [0, 1, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className={styles.dot}
              animate={{ scale: [0, 1, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
            />
            <motion.span
              className={styles.dot}
              animate={{ scale: [0, 1, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !poll) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <motion.div
            className={styles.errorState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AlertCircle size={48} className={styles.errorIcon} />
            <h2>{error || 'Poll not found'}</h2>
            <p>The poll you're looking for doesn't exist or has been removed.</p>
            <button onClick={() => navigate('/')} className={styles.backButton}>
              <ArrowLeft size={18} />
              Back to Home
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <motion.button
              onClick={() => navigate('/')}
              className={styles.homeButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home size={18} />
              Home
            </motion.button>
            <div className={styles.headerRight}>
              {!loading && poll && (
                <motion.button
                  onClick={() => setShareModalOpen(true)}
                  className={styles.shareButton}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 size={18} />
                  Share
                </motion.button>
              )}
            </div>
          </div>
          <motion.div
            className={styles.pollInfo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h1 className={styles.pollName}>{poll?.name}</h1>
            <div className={styles.pollMeta}>
              <div className={styles.pollCode}>
                <Vote size={16} />
                Code: <span>{poll?.code}</span>
              </div>
              <div className={`${styles.timer} ${isExpired ? styles.expired : ''}`}>
                <Clock size={16} />
                {poll && getTimeRemaining(poll.validTill)}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className={styles.questionSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className={styles.question}>{poll.question}</h2>
          {poll.multipleChoices && !showResults && (
            <div className={styles.multipleChoiceHint}>
              <Check size={16} />
              Multiple choices allowed
            </div>
          )}
          {!poll.isActive && (
            <div className={styles.pollInactive}>
              <AlertCircle size={16} />
              This poll is no longer accepting votes
            </div>
          )}
        </motion.div>

        <div className={styles.answers}>
          <AnimatePresence>
            {poll.answers.map((answer, index) => {
              const votes = poll.voteCounts[index] || 0;
              const percentage = calculatePercentage(votes, poll.totalVotes);
              const isSelected = selectedOptions.includes(index);
              const isUserVote = hasVoted && poll.userVote?.includes(index);
              const isWinning = showResults && winningOption === index;

              return (
                <motion.div
                  key={index}
                  className={`${styles.answer} ${showResults ? styles.results : ''} ${
                    isSelected ? styles.selected : ''
                  } ${isUserVote ? styles.userVote : ''} ${isWinning ? styles.winning : ''}`}
                  onClick={() => !showResults && handleOptionSelect(index)}
                  role="button"
                  tabIndex={!showResults ? 0 : -1}
                  aria-label={`${answer} - ${showResults ? `${percentage}%` : 'Click to select'}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      !showResults && handleOptionSelect(index);
                    }
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={
                    !showResults ? { scale: 1.02, borderColor: 'var(--primary-accent)' } : {}
                  }
                  whileTap={!showResults ? { scale: 0.98 } : {}}
                >
                  <div className={styles.answerHeader}>
                    <div className={styles.answerText}>
                      <span className={styles.answerLabel}>{answer}</span>
                      {showResults && (
                        <span className={styles.voteCount}>
                          {votes} {votes === 1 ? 'vote' : 'votes'}
                        </span>
                      )}
                    </div>

                    <div className={styles.answerIndicators}>
                      {isWinning && <Crown size={20} className={styles.winningIcon} />}
                      {isUserVote && <CheckCircle2 size={20} className={styles.userVoteIcon} />}
                      {!showResults && isSelected && (
                        <Check size={20} className={styles.selectedIcon} />
                      )}
                      {showResults && <div className={styles.percentage}>{percentage}%</div>}
                    </div>
                  </div>

                  {showResults && (
                    <div className={styles.progressContainer}>
                      <div className={styles.progressBar}>
                        <motion.div
                          className={styles.progressFill}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          role="progressbar"
                          aria-valuenow={percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></motion.div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {!showResults && (
          <motion.div
            className={styles.voteSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <motion.button
              onClick={submitVote}
              disabled={selectedOptions.length === 0 || isSubmitting || isExpired}
              className={styles.voteButton}
              aria-label="Submit vote"
              whileHover={
                !isSubmitting && selectedOptions.length > 0 && !isExpired ? { scale: 1.02 } : {}
              }
              whileTap={
                !isSubmitting && selectedOptions.length > 0 && !isExpired ? { scale: 0.98 } : {}
              }
            >
              {isSubmitting ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Vote size={20} />
                  <span>Vote</span>
                  {selectedOptions.length > 0 && ` (${selectedOptions.length} selected)`}
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {showResults && (
          <motion.div
            className={styles.resultsInfo}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className={styles.resultsHeader}>
              <BarChart3 size={24} className={styles.resultsIcon} />
              <h3>Poll Results</h3>
            </div>
            <div className={styles.resultsStats}>
              <div className={styles.totalVotes}>
                <Users size={18} />
                Total Votes: {poll.totalVotes}
              </div>
            </div>
          </motion.div>
        )}

        {shareModalOpen && poll && (
          <ShareModal
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            pollCode={poll.code}
            pollName={poll.name}
          />
        )}
      </motion.div>
    </div>
  );
};

export default Poll;
