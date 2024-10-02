'use client';

import { Card, CardContent, CardHeader } from '@ibiri/components';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useCreditScore } from '../../../hooks/use-credit-score';
import { CreditScore } from '@ibiri/db';

const creditOptions = [
  {
    id: 1,
    title: 'Credit Card',
    description:
      'Start with a basic credit card, make on-time payments, and keep your utilization low to build your credit score over time.',
    imageSrc: '/images/credit-card.jpg',
    link: '#',
    minScore: 0,
  },
  {
    id: 2,
    title: 'Loans',
    description:
      'Consider taking a personal loan to diversify your credit portfolio and demonstrate responsible loan repayment behavior.',
    imageSrc: '/images/loans.jpg',
    link: '#',
    minScore: 0,
  },
  {
    id: 3,
    title: 'Premium Credit Card',
    description:
      "Once you've established a solid credit history, apply for premium cards to earn rewards and access exclusive benefits.",
    imageSrc: '/images/premium-credit-card.jpg',
    link: '#',
    minScore: 500,
  },
  {
    id: 4,
    title: 'Mortgage',
    description:
      'If applicable, consider purchasing a home or financing a vehicle responsibly to add an installment loan to your credit mix.',
    imageSrc: '/images/house.jpg',
    link: '#',
    minScore: 600,
  },
];

const Credit = () => {
  const { creditScore } = useCreditScore();
  const [storedCreditScore, setStoredCreditScore] = useState<CreditScore | null>(null);

  useEffect(() => {
    const storedCredit = sessionStorage.getItem('creditScore');
    if (storedCredit) {
      setStoredCreditScore(JSON.parse(storedCredit));
    }
  }, []);

  const effectiveCreditScore = storedCreditScore ? storedCreditScore.score : creditScore.score;

  return (
    <div>
      <Card className="mt-6">
        <CardHeader className="text-xl font-semibold">
          Credit Accounts
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {creditOptions.map((option) => {
              const isAccessible = effectiveCreditScore >= option.minScore;
              return (
                <Link
                  key={option.id}
                  className={`flex flex-col gap-3 border rounded-lg p-4 duration-300 transition-all ${
                    isAccessible
                      ? 'hover:border-[#2467e3]'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  href={isAccessible ? option.link : '#'}
                >
                  <Image
                    className="rounded-full aspect-square object-cover"
                    src={option.imageSrc}
                    alt={option.title}
                    width={90}
                    height={90}
                  />
                  <div>
                    <h2 className="text-xl font-semibold">{option.title}</h2>
                    <p className="text-sm text-[#8592ad] font-light mt-1">
                      {option.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Credit;