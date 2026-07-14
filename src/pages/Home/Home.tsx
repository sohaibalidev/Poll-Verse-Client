import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Sparkles, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = useCallback(() => {
    const trimmedCode = joinCode.trim().toUpperCase();
    if (trimmedCode.length === 8 && /^[A-Z0-9]{8}$/.test(trimmedCode)) {
      navigate(`/poll/${trimmedCode}`);
    } else {
      setError('Please enter a valid 8-character poll code');
      setTimeout(() => setError(''), 3000);
    }
  }, [joinCode, navigate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleJoin();
      }
    },
    [handleJoin]
  );

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      setJoinCode(value);
      if (error) setError('');
    },
    [error]
  );

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className={styles.logoSection}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className={styles.logoIcon}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Zap size={48} className={styles.logoSpark} />
            </motion.div>
            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              PollVerse
            </motion.h1>
          </motion.div>

          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Create instant polls and get real-time results. Perfect for meetings, classrooms, and
            social gatherings. <span className={styles.highlight}>No sign-up required.</span>
          </motion.p>

          <motion.div
            className={styles.actions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/create" className={styles.primaryButton}>
                <Sparkles size={20} />
                Create a Poll
                <ArrowRight size={20} className={styles.buttonIcon} />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/dashboard" className={styles.dashboardLink}>
                <BarChart3 size={18} />
                View My Polls
              </Link>
            </motion.div>

            <div className={styles.divider}>
              <span>or join existing poll</span>
            </div>

            <motion.div
              className={styles.joinSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="Enter poll code"
                  value={joinCode}
                  onChange={handleCodeChange}
                  onKeyDown={handleKeyDown}
                  className={`${styles.codeInput} ${error ? styles.error : ''}`}
                  maxLength={8}
                  aria-label="Poll code"
                  aria-invalid={!!error}
                />
                <div className={styles.inputGlow}></div>
                {error && <div className={styles.errorMessage}>{error}</div>}
              </div>
              <motion.button
                onClick={handleJoin}
                disabled={joinCode.length !== 8}
                className={`${styles.secondaryButton} ${joinCode.length !== 8 ? styles.disabled : ''}`}
                aria-label="Join poll"
                whileHover={joinCode.length === 8 ? { scale: 1.02 } : {}}
                whileTap={joinCode.length === 8 ? { scale: 0.98 } : {}}
              >
                Join Poll
                <ArrowRight size={18} className={styles.buttonIcon} />
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className={styles.footerContent}>
            <span>© {new Date().getFullYear()} PollVerse</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
