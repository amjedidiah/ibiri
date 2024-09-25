import { User } from '@ibiri/db';
import Cookies from 'js-cookie';

const login = async (email: string, password: string): Promise<User> => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  } else {
    Cookies.set('token', data.token, {
      expires: 7,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
    });
    return data.user;
  }
};

const getCurrentUser = async (): Promise<User | null> => {
  const token = Cookies.get('token');
  if (!token) return null;

  const response = await fetch('/api/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    Cookies.remove('token');
    return null;
  }

  const data = await response.json();
  return data;
};

const logout = () => {
  Cookies.remove('token');
};

export { login, getCurrentUser, logout };
