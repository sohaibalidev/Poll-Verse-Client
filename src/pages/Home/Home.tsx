import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
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
      <div className={styles.themeWrapper}>
        <ThemeToggle />
      </div>

      <div className={styles.hero}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.logoSection}>
            <motion.div
              className={styles.logoIcon}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Zap size={48} className={styles.logoSpark} />
            </motion.div>
            <h1 className={styles.title}>PollVerse</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className={styles.subtitle}>
              Create instant polls and get real-time results. Perfect for meetings, classrooms, and
              social gatherings. <span className={styles.highlight}>No sign-up required.</span>
            </p>
          </motion.div>

          <motion.div
            className={styles.actions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/create" className={styles.primaryButton}>
              <Sparkles size={20} />
              Create a Poll
              <ArrowRight size={20} className={styles.buttonIcon} />
            </Link>

            <div className={styles.divider}>
              <span>or join existing poll</span>
            </div>

            <div className={styles.joinSection}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="Enter poll code (e.g. ABC12345)"
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
              <button
                onClick={handleJoin}
                disabled={joinCode.length !== 8}
                className={`${styles.secondaryButton} ${joinCode.length !== 8 ? styles.disabled : ''}`}
                aria-label="Join poll"
              >
                Join Poll
                <ArrowRight size={18} className={styles.buttonIcon} />
              </button>
            </div>
          </motion.div>
        </motion.div>

        <div className={styles.footer}>
          <div className={styles.footerContent}>
            <span>© 2024 PollVerse</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
