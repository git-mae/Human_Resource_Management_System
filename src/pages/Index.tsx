
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page after a short delay
    const timeout = setTimeout(() => {
      navigate('/login');
    }, 500);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-800 to-brand-900">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Crew Compass HR</h1>
        <p className="text-xl text-gray-200 mb-8">Your complete HR management solution</p>
        <Button 
          size="lg" 
          className="bg-white text-brand-800 hover:bg-gray-100"
          onClick={() => navigate('/login')}
        >
          Get Started <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
