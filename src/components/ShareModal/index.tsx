import React, { useState, useCallback, useMemo } from 'react';
import { X, Copy, Check, Share2, Twitter, Linkedin, Mail } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import styles from './ShareModal.module.css';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollCode: string;
  pollName: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, pollCode, pollName }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link');

  const pollUrl = useMemo(() => {
    return `${window.location.origin}/poll/${pollCode}`;
  }, [pollCode]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pollUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  }, [pollUrl]);

  const handleShare = useCallback(
    (platform: string) => {
      const text = `Vote on "${pollName}"!`;
      const url = pollUrl;
      let shareUrl = '';

      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
          break;
        case 'email':
          shareUrl = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n\nVote here: ${url}`)}`;
          break;
        default:
          return;
      }

      window.open(shareUrl, '_blank', 'width=600,height=400');
    },
    [pollName, pollUrl]
  );

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: pollName,
          text: `Vote on "${pollName}"!`,
          url: pollUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      handleCopyLink();
    }
  }, [pollName, pollUrl, handleCopyLink]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <Share2 size={20} className={styles.titleIcon} />
            Share Poll
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'link' ? styles.active : ''}`}
            onClick={() => setActiveTab('link')}
          >
            Link
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'qr' ? styles.active : ''}`}
            onClick={() => setActiveTab('qr')}
          >
            QR Code
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'link' ? (
            <>
              <div className={styles.linkSection}>
                <div className={styles.linkWrapper}>
                  <input type="text" value={pollUrl} readOnly className={styles.linkInput} />
                  <button onClick={handleCopyLink} className={styles.copyButton}>
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div className={styles.socialSection}>
                <p className={styles.socialLabel}>Share via</p>
                <div className={styles.socialButtons}>
                  <button
                    onClick={() => handleShare('twitter')}
                    className={styles.socialButton}
                    style={{ background: '#1DA1F2' }}
                  >
                    <Twitter size={18} />
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className={styles.socialButton}
                    style={{ background: '#0A66C2' }}
                  >
                    <Linkedin size={18} />
                  </button>
                  <button
                    onClick={() => handleShare('email')}
                    className={styles.socialButton}
                    style={{ background: '#EA4335' }}
                  >
                    <Mail size={18} />
                  </button>
                  {typeof navigator !== 'undefined' && navigator.share && (
                    <button
                      onClick={handleNativeShare}
                      className={styles.socialButton}
                      style={{ background: 'var(--primary-accent)' }}
                    >
                      <Share2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.qrSection}>
              <div className={styles.qrWrapper}>
                <QRCodeSVG
                  value={pollUrl}
                  size={200}
                  level="H"
                  includeMargin
                  className={styles.qrCode}
                />
              </div>
              <p className={styles.qrHint}>Scan QR code to vote</p>
              <button onClick={handleCopyLink} className={styles.qrCopyButton}>
                <Copy size={16} />
                Copy link instead
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
