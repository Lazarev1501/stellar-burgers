import { FC, SyntheticEvent, useState } from 'react';
import { RegisterUI } from '@ui-pages';
import { useNavigate } from 'react-router-dom';

import { registerUserApi, TRegisterData } from '../../utils/burger-api';

export const Register: FC = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<Error | null>(null);

  const navigate = useNavigate();

  const registerData: TRegisterData = {
    email: email,
    name: userName,
    password: password
  };

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    setError(null);
    registerUserApi(registerData)
      .then(() => {
        navigate('/login', { replace: true });
      })
      .catch((err) => setError(err));
  };

  return (
    <RegisterUI
      errorText={error?.message}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
