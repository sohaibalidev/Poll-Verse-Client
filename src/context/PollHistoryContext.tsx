import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface PollHistoryItem {
  id: string;
  code: string;
  name: string;
  question: string;
  createdAt: string;
  totalVotes: number;
  isActive: boolean;
  validTill: string;
}

interface PollHistoryContextType {
  polls: PollHistoryItem[];
  addPoll: (poll: PollHistoryItem) => void;
  updatePoll: (code: string, data: Partial<PollHistoryItem>) => void;
  removePoll: (code: string) => void;
  clearHistory: () => void;
  getPoll: (code: string) => PollHistoryItem | undefined;
}

const PollHistoryContext = createContext<PollHistoryContextType>({
  polls: [],
  addPoll: () => {},
  updatePoll: () => {},
  removePoll: () => {},
  clearHistory: () => {},
  getPoll: () => undefined,
});

export const usePollHistory = () => useContext(PollHistoryContext);

export const PollHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [polls, setPolls] = useState<PollHistoryItem[]>(() => {
    const saved = localStorage.getItem('pollHistory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pollHistory', JSON.stringify(polls));
  }, [polls]);

  const addPoll = useCallback((poll: PollHistoryItem) => {
    setPolls((prev) => {
      const exists = prev.some((p) => p.code === poll.code);
      if (exists) return prev;
      return [poll, ...prev];
    });
  }, []);

  const updatePoll = useCallback((code: string, data: Partial<PollHistoryItem>) => {
    setPolls((prev) => prev.map((poll) => (poll.code === code ? { ...poll, ...data } : poll)));
  }, []);

  const removePoll = useCallback((code: string) => {
    setPolls((prev) => prev.filter((poll) => poll.code !== code));
  }, []);

  const clearHistory = useCallback(() => {
    setPolls([]);
  }, []);

  const getPoll = useCallback(
    (code: string) => {
      return polls.find((poll) => poll.code === code);
    },
    [polls]
  );

  return (
    <PollHistoryContext.Provider
      value={{ polls, addPoll, updatePoll, removePoll, clearHistory, getPoll }}
    >
      {children}
    </PollHistoryContext.Provider>
  );
};
