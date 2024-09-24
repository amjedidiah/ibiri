import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function useRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { loginContext } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }

    // Registration Success
    loginContext(data.user);
    router.push('/');
  };

  return {
    handleSubmit,
    error,
    firstName,
    lastName,
    email,
    password,
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
  };
}
