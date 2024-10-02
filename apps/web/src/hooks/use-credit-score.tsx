import { useState, useCallback, useEffect } from 'react';

export interface CreditScore {
  score: number;
  lastScore: number;
  date: Date;
  range: {
    min: 300;
    max: 850;
  };
  factors: string[];
  source: string;
}

const INITIAL_CREDIT_SCORE: CreditScore = {
  score: 300,
  lastScore: 300,
  date: new Date(),
  range: { min: 300, max: 850 },
  factors: [],
  source: 'FICO',
};

export function useCreditScore(initialScore: CreditScore = INITIAL_CREDIT_SCORE) {
  const [creditScore, setCreditScore] = useState<CreditScore>(initialScore);
  const [billsPaid, setBillsPaid] = useState(false);

  const calculateScore = (paidBills: number, totalBills: number, timeLeft: number, totalDuration: number): number => {
    const baseScore = 300;
    const maxScore = 850;
    const scoreRange = maxScore - baseScore;

    // Proportion of bills paid
    const billsPaidRatio = paidBills / totalBills;

    // Coefficient based on how quickly the user pays their bills
    const timeCoefficient = (totalDuration - timeLeft) / totalDuration;

    // Calculate the score increment
    const scoreIncrement = billsPaidRatio * timeCoefficient * scoreRange;

    const score = baseScore + scoreIncrement;

    return Math.round(Math.min(maxScore, Math.max(baseScore, score)));
  };

  const updateCreditScore = useCallback((paidBills: number, totalBills: number, timeLeft: number, totalDuration: number) => {
    if (billsPaid) return; // Prevent further updates once bills are paid

    const newScore = calculateScore(paidBills, totalBills, timeLeft, totalDuration);

    const updatedCreditScore: CreditScore = {
      score: newScore,
      lastScore: creditScore.score,
      date: new Date(),
      range: { min: 300, max: 850 },
      factors: [],
      source: 'FICO',
    };

    setCreditScore(updatedCreditScore);
    setBillsPaid(true); // Mark bills as paid
    sessionStorage.setItem('creditScore', JSON.stringify(updatedCreditScore));
    // toast.success('Credit score updated successfully');
  }, [creditScore, billsPaid]);

  useEffect(() => {
    console.log('Updated creditScore:', creditScore);
  }, [creditScore]);

  return { creditScore, updateCreditScore };
}