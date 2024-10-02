'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ibiri/components';
import {
  MoveUpRight,
  Plus,
  LucideIcon,
  Copy,
  Eye,
  EyeOff,
  QrCode,
  Landmark,
  CreditCard,
  Smartphone,
  Users,
  Building,
  Globe,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@ibiri/components';
import { useTransactions } from '../../hooks/use-transaction';
import { useCreditScore } from '../../hooks/use-credit-score';
import { initialBills } from './send/bills/page';
import { Tour } from '../../components';

const TIMER_KEY = 'dashboardTimer';
const TIMER_DURATION = 10 * 60;

interface Bill {
  name: string;
  amount: number;
  isPaid: boolean;
}

const Dashboard = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [bills, setBills] = useState<Bill[]>(() => {
    const savedBills = sessionStorage.getItem('bills');
    return savedBills ? JSON.parse(savedBills) : initialBills;
  });
  const accountNumberRef = useRef<HTMLHeadingElement>(null);
  const { user } = useAuth();
  const { transactions, isLoading } = useTransactions(
    user?.bankAccount[0]?.accountNumber,
    5
  );
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const storedTime = sessionStorage.getItem(TIMER_KEY);
      return storedTime ? parseInt(storedTime, 10) : TIMER_DURATION;
    }
    return TIMER_DURATION;
  });

  useEffect(() => {
    const savedBills = sessionStorage.getItem('bills');
    setBills(savedBills ? JSON.parse(savedBills) : []);
  }, []);

  const { creditScore, updateCreditScore } = useCreditScore(
    user?.creditScore[0]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime > 0 ? prevTime - 1 : 0;
        sessionStorage.setItem(TIMER_KEY, newTime.toString());
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft !== 0) {
      const paidBills = bills.filter((bill) => bill.isPaid).length;
      const totalBills = bills.length;
  
      updateCreditScore(paidBills, totalBills, timeLeft, TIMER_DURATION);
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bills]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const chartData = [
    { month: 'January', score: 300 },
    { month: 'February', score: 305 },
    { month: 'March', score: 350 },
    { month: 'April', score: 320 },
    { month: 'May', score: 305 },
    { month: 'June', score: 380 },
  ];

  const chartConfig = {
    score: {
      label: 'Credit Score',
      color: '#2467e3',
    },
    label: {
      color: '#fff',
    },
  } satisfies ChartConfig;

  const buttons: {
    text: string;
    icon: LucideIcon;
    className?: string;
    modalContent?: {
      title: string;
      url: string;
      icon: LucideIcon;
      description: string;
      className?: string;
    }[];
  }[] = useMemo(
    () => [
      {
        text: 'Add Money',
        icon: Plus,
        modalContent: [
          {
            title: 'Bank Transfer',
            url: '/dashboard/add-money/bank-transfer',
            icon: Landmark,
            description: 'Add money from your bank account',
          },
          {
            title: 'Card Payment',
            url: '/dashboard/add-money/card-payment',
            icon: CreditCard,
            description: 'Add money using your debit or credit card',
          },
          {
            title: 'Mobile Money',
            url: '/dashboard/add-money/mobile-money',
            icon: Smartphone,
            description: 'Add money using mobile money services',
          },
        ],
      },
      {
        text: 'QR Code',
        icon: QrCode,
      },
      {
        text: 'Send Money',
        icon: MoveUpRight,
        className: 'tour-send-money',
        modalContent: [
          {
            title: 'Ibiri Customers',
            url: '/dashboard/send/ibirians',
            icon: Users,
            description: 'Send money to other Ibiri account holders',
            className: 'tour-ibiri-customers',
          },
          {
            title: 'Other Banks',
            url: '/dashboard/send/other-banks',
            icon: Building,
            description: 'Transfer funds to accounts in other banks',
          },
          {
            title: 'International Transfer',
            url: '/dashboard/send/international',
            icon: Globe,
            description: 'Send money to international recipients',
          },
        ],
      },
    ],
    []
  );

  const copyAccountNumber = () => {
    if (accountNumberRef.current) {
      const accountNumber = accountNumberRef.current.textContent || '';
      navigator.clipboard
        .writeText(accountNumber)
        .then(() => {
          toast.success('Account number copied to clipboard');
        })
        .catch((err) => {
          toast.error('Failed to copy account number');
        });
    }
  };

  const percentChange =
    ((creditScore.score - creditScore.lastScore) / creditScore.lastScore) * 100;

  const getCreditScoreColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getCreditScoreIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-6 h-6 text-green-500" />;
    if (change < 0) return <ArrowDown className="w-6 h-6 text-red-500" />;
    return <Minus className="w-6 h-6 text-yellow-500" />;
  };

  const quickActions = [
    {
      image: '/images/money.png',
      alt: 'pay-bills',
      title: 'Pay Bills',
      url: '/dashboard/send/bills',
      description:
        'Pay for your internet, cable subscription and other utility bills all in one place',
    },
    {
      image: '/images/airtime.png',
      alt: 'airtime-data',
      title: 'Airtime & Data',
      url: '/dashboard/send/airtime-data',
      description: 'Buy Airtime and Data for your phone',
    },
    {
      image: '/images/credit.png',
      alt: 'credit-card',
      title: 'Credit',
      url: '/dashboard/credit',
      description:
        'Apply for a credit account to start building your credit score',
    },
    {
      image: '/images/rewards.png',
      alt: 'rewards',
      title: 'Rewards',
      url: '#',
      description: 'Earn rewards for your transactions',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-[#8592ad]';
    }
  };

  return (
    <div>
      <Tour />
      <div className="mb-4">
        <Card>
          <CardContent className="flex justify-between items-center p-4">
            <span className="text-lg font-semibold">Session Timer:</span>
            <span className="text-2xl font-bold timer" aria-live="polite">
              {formatTime(timeLeft)}
            </span>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader className="text-xl pt-4 pb-0 font-semibold">
            Your Account
          </CardHeader>
          <CardContent className="pt-3">
            <div className="flex flex-col items-center justify-center border rounded-xl p-16">
              <div className="flex gap-12 relative">
                <div className="flex flex-col items-center">
                  <p className="text-[#8592ad] text-xs flex items-center">
                    Available Balance
                    {showBalance ? (
                      <EyeOff
                        className="w-3 h-3 ml-2 cursor-pointer"
                        onClick={() => setShowBalance(false)}
                      />
                    ) : (
                      <Eye
                        className="w-3 h-3 ml-2 cursor-pointer"
                        onClick={() => setShowBalance(true)}
                      />
                    )}
                  </p>
                  <h2 className="text-2xl font-semibold balance">
                    {showBalance
                      ? `₦ ${Number(
                          user?.bankAccount[0]?.balance
                        ).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : '*****'}
                  </h2>
                </div>
                <span className="w-[1px] h-full bg-gray-300"> </span>
                <div
                  className="flex flex-col items-center cursor-pointer aza"
                  onClick={copyAccountNumber}
                >
                  <p className="text-[#8592ad] text-xs flex items-center">
                    Account Number{' '}
                    <Copy className="w-3 h-3 ml-2 cursor-pointer" />
                  </p>
                  <h2
                    ref={accountNumberRef}
                    className="text-2xl font-semibold aza"
                  >
                    {user?.bankAccount[0]?.accountNumber}
                  </h2>
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                {buttons.map(({ text, icon: Icon, className, modalContent }) =>
                  modalContent ? (
                    <Dialog key={text}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className={className}>
                          {text} <Icon className="ml-2 h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{text}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          {modalContent.map((item) => (
                            <Link
                              href={item.url}
                              key={item.url}
                              passHref
                              legacyBehavior
                            >
                              <Button
                                variant="outline"
                                className={`flex items-center justify-start p-4 min-h-12 h-full hover:bg-white hover:border-[#2467e3] w-full ${
                                  item.className || ''
                                }`}
                                asChild
                              >
                                <a className="flex items-center w-full">
                                  <div className="flex items-center justify-center rounded-full bg-[#e8f0fc] w-8 h-8 mr-8">
                                    <item.icon className="w-4 h-4 text-[#2467e3]" />
                                  </div>
                                  <div className="flex flex-col items-start">
                                    <h4 className="text-base font-semibold">
                                      {item.title}
                                    </h4>
                                    <p className="text-sm text-[#8592ad] font-light">
                                      {item.description}
                                    </p>
                                  </div>
                                </a>
                              </Button>
                            </Link>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button
                      key={text}
                      variant="outline"
                      onClick={() => console.log(`${text} button clicked`)}
                    >
                      {text} <Icon className="ml-2 h-4 w-4" />
                    </Button>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader className="text-xl font-semibold">
              Credit Score History
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[150px] w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="score" fill="var(--color-score)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-xl font-semibold">
              Credit Score
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 credit-score">
                <h3
                  className={`text-[100px] leading-[1.1] font-semibold ${getCreditScoreColor(
                    percentChange
                  )}`}
                >
                  {creditScore.score}
                </h3>
              </div>
              <div className="flex items-center mt-2">
                {getCreditScoreIcon(percentChange)}
                <span className={`ml-2 ${getCreditScoreColor(percentChange)}`}>
                  {percentChange.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-6 quick-actions">
          <CardHeader className="text-xl font-semibold">
            Quick Actions
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  href={action.url}
                  key={index}
                  className="border rounded-lg p-4 hover:border-[#2467e3] duration-300 transition-all"
                >
                  <Image
                    src={action.image}
                    alt={action.alt}
                    width={80}
                    height={80}
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{action.title}</h3>
                    <p className="text-sm text-[#8592ad] font-light">
                      {action.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="mt-6 recent-transactions">
          <CardHeader>Your recent transactions.</CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-[#8592ad] text-sm uppercase">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-[#8592ad] text-sm uppercase">
                        {transaction.summary || 'N/A'}
                      </TableCell>
                      <TableCell className="text-[#8592ad] text-sm uppercase">
                        ₦{transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-[#8592ad] text-sm uppercase">
                        {transaction.type}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-sm uppercase',
                          getStatusColor(transaction.status)
                        )}
                      >
                        {transaction.status}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
