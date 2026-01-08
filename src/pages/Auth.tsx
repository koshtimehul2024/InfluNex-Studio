import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect all auth requests to admin login
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  return null;
};

export default Auth;
