'use client';

import RegisterForm from '../../components/RegisterForm';
import { withoutAuth } from '../../components/withAuth';

const Register = () => {
  return <RegisterForm />;
};

export default withoutAuth(Register);
