'use client';

import LoginForm from '../../components/LoginForm';
import { withoutAuth } from '../../components/withAuth';

const Login = () => {
  return <LoginForm />;
};

export default withoutAuth(Login);
