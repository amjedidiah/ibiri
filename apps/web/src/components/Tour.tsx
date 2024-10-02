import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const TOUR_COMPLETED_KEY = 'tourCompleted';

const steps: Step[] = [
  {
    target: '.ibiri-logo',
    content: 'Welcome to Ibiri - Empowering Africans to build credit.',
    disableBeacon: true,
  },
  {
    target: '.ibiri-logo',
    content:
      'Please note this is very much a pre-alpha version of the app. Use at your own risk. Be kind 🥹',
    disableBeacon: true,
  },
  {
    target: '.ibiri-logo',
    content:
      'We have created a quick simulation for you to get a feel of how it works.',
    disableBeacon: true,
  },
  {
    target: '.timer',
    content:
      'This is your session timer. Take note of it. You will need to pay your bills before it runs out to improve your score.',
    disableBeacon: true,
  },
  {
    target: '.balance',
    content:
      'This is your available balance - You are rich!. Spend this money wisely on paying your bills to boost your score.',
    disableBeacon: true,
  },
  {
    target: '.aza',
    content: 'Here is your account number. Click to copy it to your clipboard.',
    disableBeacon: true,
  },
  {
    target: '.tour-send-money',
    content: 'Here you can send money to other Ibiri account holders.',
    disableBeacon: true,
  },
  {
    target: '.credit-score',
    content: 'Here you can see your credit score and its history.',
    disableBeacon: true,
  },
  {
    target: '.credit-score',
    content:
      'Your credit score is process is fast tracked to update in real time for this prototype. In reality, it takes weeks or months to build credit history.',
    disableBeacon: true,
  },
  {
    target: '.quick-actions',
    content:
      'Here you can perform quick actions like paying bills or buying airtime.',
    disableBeacon: true,
  },
  {
    target: '.recent-transactions',
    content: 'Here you can see your recent transactions.',
    disableBeacon: true,
  },
  {
    target: '.tour-credit-page',
    content: 'Click here to view credit features and accounts.',
    disableBeacon: true,
  },
];

const Tour = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const tourCompleted = sessionStorage.getItem(TOUR_COMPLETED_KEY);
    if (!tourCompleted) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      sessionStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
        },
      }}
    />
  );
};

export default Tour;