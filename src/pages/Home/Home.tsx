import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, ArrowRight } from 'lucide-react';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const [joinCode, setJoinCode] = useState('');

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
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className={styles.codeInput}
                  maxLength={8}
                />
                <div className={styles.inputGlow}></div>
              </div>
              <Link
                to={joinCode ? `/poll/${joinCode}` : '#'}
                className={`${styles.secondaryButton} ${!joinCode ? styles.disabled : ''}`}
              >
                Join Poll
                <ArrowRight size={18} className={styles.buttonIcon} />
              </Link>
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
