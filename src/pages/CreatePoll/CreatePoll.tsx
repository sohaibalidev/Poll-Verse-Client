import React, { useState } from 'react';
import { Plus, X, Clock, Settings2, FileText } from 'lucide-react';
import { BASE_URL } from '@/config';
import { useNavigate } from 'react-router-dom';
import styles from './CreatePoll.module.css';

interface PollData {
  name: string;
  question: string;
  answers: string[];
  multipleChoices: boolean;
  duration: number;
}

const CreatePoll: React.FC = () => {
  const navigate = useNavigate();
  const [pollData, setPollData] = useState<PollData>({
    name: '',
    question: '', 
    answers: ['', ''],
    multipleChoices: false,
    duration: 24,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addAnswer = () => {
    if (pollData.answers.length < 10) {
      setPollData({
        ...pollData,
        answers: [...pollData.answers, ''],
      });
    }
  };

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...pollData.answers];
    newAnswers[index] = value;
    setPollData({ ...pollData, answers: newAnswers });
  };

  const removeAnswer = (index: number) => {
    if (pollData.answers.length > 2) {
      const newAnswers = pollData.answers.filter((_, i) => i !== index);
      setPollData({ ...pollData, answers: newAnswers });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validAnswers = pollData.answers.filter((answer) => answer.trim());

      if (validAnswers.length < 2) {
        alert('Please provide at least 2 answers');
        return;
      }

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
        navigate(`/poll/${data.data.code}`);
      } else {
        alert(data.message || 'Failed to create poll');
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Failed to create poll');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <FileText size={32} className={styles.titleIcon} />
            <h1 className={styles.title}>Create a New Poll</h1>
          </div>
          <p className={styles.subtitle}>Set up your poll with questions, options, and settings</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FileText size={18} className={styles.labelIcon} />
              <span>Poll Name</span>
            </label>
            <input
              type="text"
              value={pollData.name}
              onChange={(e) => setPollData({ ...pollData, name: e.target.value })}
              className={styles.input}
              placeholder="Enter a name for your poll"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Settings2 size={18} className={styles.labelIcon} />
              <span>Poll Question</span>
            </label>
            <input
              type="text"
              value={pollData.question}
              onChange={(e) => setPollData({ ...pollData, question: e.target.value })}
              className={styles.input}
              placeholder="What would you like to ask?"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Plus size={18} className={styles.labelIcon} />
              <span>Answer Options</span>
              <span className={styles.optionCount}>
                {pollData.answers.filter((a) => a.trim()).length}/10
              </span>
            </label>
            <div className={styles.answersList}>
              {pollData.answers.map((answer, index) => (
                <div key={index} className={styles.answerItem}>
                  <div className={styles.answerNumber}>{index + 1}</div>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => updateAnswer(index, e.target.value)}
                    className={styles.input}
                    placeholder={`Option ${index + 1}`}
                    required={index < 2}
                  />
                  {pollData.answers.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeAnswer(index)}
                      className={styles.removeButton}
                      title="Remove option"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {pollData.answers.length < 10 && (
              <button
                type="button"
                onClick={addAnswer}
                className={styles.addButton}
                disabled={pollData.answers.length >= 10}
              >
                <Plus size={18} />
                Add Option
              </button>
            )}
          </div>

          <div className={styles.settingsGroup}>
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
                    setPollData({
                      ...pollData,
                      multipleChoices: e.target.checked,
                    })
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
                    Set how long the poll should stay active
                  </div>
                </div>
              </div>
              <div className={styles.durationInputWrapper}>
                <input
                  type="number"
                  value={pollData.duration}
                  onChange={(e) => {
                    const hours = parseInt(e.target.value) || 0;
                    if (hours >= 1 && hours <= 24) {
                      setPollData({ ...pollData, duration: hours });
                    }
                  }}
                  className={styles.durationInput}
                  min="1"
                  max="24"
                  placeholder="24"
                />
                <span className={styles.durationUnit}>hours</span>
              </div>
            </div>
          </div>

          <div className={styles.helpText}>
            <Clock size={16} />
            Poll will automatically expire after the selected duration
          </div>

          <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
            {isSubmitting ? (
              <>
                <div className={styles.spinner}></div>
                Creating Poll...
              </>
            ) : (
              'Create Poll'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePoll;
