import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus, X, Clock, Settings2, FileText } from 'lucide-react';
import { BASE_URL } from '@/config';
import { useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { usePollHistory } from '@/context/PollHistoryContext';
import styles from './CreatePoll.module.css';

interface PollData {
  name: string;
  question: string;
  answers: string[];
  multipleChoices: boolean;
  duration: number;
}

const MIN_ANSWERS = 2;
const MAX_ANSWERS = 10;
const MIN_DURATION = 1;
const MAX_DURATION = 720;

const CreatePoll: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addPoll } = usePollHistory();
  const [pollData, setPollData] = useState<PollData>({
    name: '',
    question: '',
    answers: ['', ''],
    multipleChoices: false,
    duration: 24,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validAnswers = useMemo(
    () => pollData.answers.filter((answer) => answer.trim().length > 0),
    [pollData.answers]
  );

  const canAddAnswer = useMemo(
    () => pollData.answers.length < MAX_ANSWERS,
    [pollData.answers.length]
  );

  const canRemoveAnswer = useMemo(
    () => pollData.answers.length > MIN_ANSWERS,
    [pollData.answers.length]
  );

  useEffect(() => {
    if (location.state) {
      const { name, question, answers, multipleChoices, duration } =
        location.state as Partial<PollData>;
      setPollData((prev) => ({
        ...prev,
        name: name || prev.name,
        question: question || prev.question,
        answers: answers || prev.answers,
        multipleChoices: multipleChoices || prev.multipleChoices,
        duration: duration || prev.duration,
      }));
    }
  }, [location.state]);

  const isFormValid = useMemo(() => {
    const nameValid = pollData.name.trim().length > 0;
    const questionValid = pollData.question.trim().length > 0;
    const answersValid = validAnswers.length >= MIN_ANSWERS;
    const durationValid = pollData.duration >= MIN_DURATION && pollData.duration <= MAX_DURATION;
    return nameValid && questionValid && answersValid && durationValid;
  }, [pollData.name, pollData.question, validAnswers.length, pollData.duration]);

  const addAnswer = useCallback(() => {
    if (canAddAnswer) {
      setPollData((prev) => ({
        ...prev,
        answers: [...prev.answers, ''],
      }));
    }
  }, [canAddAnswer]);

  const updateAnswer = useCallback((index: number, value: string) => {
    setPollData((prev) => {
      const newAnswers = [...prev.answers];
      newAnswers[index] = value;
      return { ...prev, answers: newAnswers };
    });
  }, []);

  const removeAnswer = useCallback(
    (index: number) => {
      if (canRemoveAnswer) {
        setPollData((prev) => ({
          ...prev,
          answers: prev.answers.filter((_, i) => i !== index),
        }));
      }
    },
    [canRemoveAnswer]
  );

  const handleDurationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseInt(e.target.value) || 0;
    if (hours >= MIN_DURATION && hours <= MAX_DURATION) {
      setPollData((prev) => ({ ...prev, duration: hours }));
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!isFormValid) {
        setError('Please fill in all required fields correctly');
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch(`${BASE_URL}/polls`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ...pollData,
            answers: validAnswers,
          }),
        });

        const data = await response.json();

        if (data.success) {
          addPoll({
            id: data.data.id,
            code: data.data.code,
            name: data.data.name,
            question: data.data.question,
            createdAt: new Date().toISOString(),
            totalVotes: 0,
            isActive: true,
            validTill: data.data.validTill,
          });

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
          toast.success('Poll created successfully!');
          navigate(`/poll/${data.data.code}`);
        } else {
          toast.error(data.message || 'Failed to create poll');
        }
      } catch (error) {
        console.error('Error creating poll:', error);
        toast.error('Failed to create poll. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [pollData, validAnswers, isFormValid, navigate, addPoll]
  );

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={styles.header}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={styles.titleSection}>
            <FileText size={32} className={styles.titleIcon} />
            <h1 className={styles.title}>Create a New Poll</h1>
          </div>
          <p className={styles.subtitle}>Set up your poll with questions, options, and settings</p>
        </motion.div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <motion.div
            className={styles.formGroup}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <label className={styles.label}>
              <FileText size={18} className={styles.labelIcon} />
              <span>Poll Name</span>
            </label>
            <input
              type="text"
              value={pollData.name}
              onChange={(e) => setPollData((prev) => ({ ...prev, name: e.target.value }))}
              className={styles.input}
              placeholder="Enter a name for your poll"
              maxLength={100}
              required
            />
          </motion.div>

          <motion.div
            className={styles.formGroup}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <label className={styles.label}>
              <Settings2 size={18} className={styles.labelIcon} />
              <span>Poll Question</span>
            </label>
            <input
              type="text"
              value={pollData.question}
              onChange={(e) => setPollData((prev) => ({ ...prev, question: e.target.value }))}
              className={styles.input}
              placeholder="What would you like to ask?"
              maxLength={500}
              required
            />
          </motion.div>

          <motion.div
            className={styles.formGroup}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <label className={styles.label}>
              <Plus size={18} className={styles.labelIcon} />
              <span>Answer Options</span>
              <span className={styles.optionCount}>
                {validAnswers.length}/{MAX_ANSWERS}
              </span>
            </label>
            <div className={styles.answersList}>
              {pollData.answers.map((answer, index) => (
                <motion.div
                  key={index}
                  className={styles.answerItem}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <div className={styles.answerNumber}>{index + 1}</div>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => updateAnswer(index, e.target.value)}
                    className={styles.input}
                    placeholder={`Option ${index + 1}`}
                    maxLength={200}
                    required={index < MIN_ANSWERS}
                  />
                  {canRemoveAnswer && (
                    <button
                      type="button"
                      onClick={() => removeAnswer(index)}
                      className={styles.removeButton}
                      aria-label={`Remove option ${index + 1}`}
                    >
                      <X size={16} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
            {canAddAnswer && (
              <motion.button
                type="button"
                onClick={addAnswer}
                className={styles.addButton}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={18} />
                Add Option
              </motion.button>
            )}
          </motion.div>

          <motion.div
            className={styles.settingsGroup}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <Settings2 size={20} className={styles.settingIcon} />
                <div>
                  <div className={styles.settingLabel}>Multiple Choices</div>
                  <div className={styles.settingDescription}>
                    Allow users to select multiple options
                  </div>
                </div>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={pollData.multipleChoices}
                  onChange={(e) =>
                    setPollData((prev) => ({
                      ...prev,
                      multipleChoices: e.target.checked,
                    }))
                  }
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <Clock size={20} className={styles.settingIcon} />
                <div>
                  <div className={styles.settingLabel}>Poll Duration</div>
                  <div className={styles.settingDescription}>
                    Set how long the poll should stay active (1-720 hours)
                  </div>
                </div>
              </div>
              <div className={styles.durationInputWrapper}>
                <input
                  type="number"
                  value={pollData.duration}
                  onChange={handleDurationChange}
                  className={styles.durationInput}
                  min={MIN_DURATION}
                  max={MAX_DURATION}
                />
                <span className={styles.durationUnit}>hours</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={styles.helpText}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <Clock size={16} />
            Poll will automatically expire after the selected duration
          </motion.div>

          <motion.button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className={styles.submitButton}
            whileHover={!isSubmitting && isFormValid ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting && isFormValid ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <>
                <div className={styles.spinner}></div>
                Creating Poll...
              </>
            ) : (
              'Create Poll'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreatePoll;
