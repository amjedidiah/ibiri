'use client';

import { LoginForm, withoutAuth } from '../../components';

const Login = () => {
  return <LoginForm />;
};

export default withoutAuth(Login);
