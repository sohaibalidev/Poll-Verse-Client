import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Clock, ArrowRight } from 'lucide-react';
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
        <div className={styles.content}>
          <div className={styles.logoSection}>
            <div className={styles.logoIcon}>
              <Zap size={48} className={styles.logoSpark} />
            </div>
            <h1 className={styles.title}>Poll verse</h1>
          </div>
          <p className={styles.subtitle}>
            Create instant polls and get real-time results. Perfect for meetings, classrooms, and
            social gatherings.
          </p>

          <div className={styles.actions}>
            <Link to="/create" className={styles.primaryButton}>
              Create a Poll
              <ArrowRight size={20} className={styles.buttonIcon} />
            </Link>

            <div className={styles.joinSection}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="Enter poll code"
                  value={joinCode}
                  onChange={handleCodeChange}
                  onKeyDown={handleKeyDown}
                  className={styles.codeInput}
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
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <Zap size={32} className={styles.icon} />
            </div>
            <h3>Instant Results</h3>
            <p>See live updates as votes come in</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <Clock size={32} className={styles.icon} />
            </div>
            <h3>Time Limited</h3>
            <p>Polls automatically expire after 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
