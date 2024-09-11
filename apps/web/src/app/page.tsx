import { calculateCreditScore } from '@ibiri/credit-scoring';

export default function Home() {
  const dummyData = {
    /* add some dummy credit data here */
  };
  const creditScore = calculateCreditScore(dummyData);

  return (
    <div>
      <h1>Welcome to Ibiri</h1>
      <p>Your credit score: {creditScore}</p>
    </div>
  );
}
