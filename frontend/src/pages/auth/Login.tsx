import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useAuth } from '../../lib/authContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import MainLayout from '../../layouts/MainLayout';
import { LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  pin: z.string().regex(/^\d{4}$/, 'PIN must be 4 digits'),
  role: z.enum(['student', 'teacher'], { required_error: 'Please select a role' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data.email, data.role, data.pin);
      // Navigation is handled in the auth context
    } catch (err: any) {
      setError(err.response?.data?.message || authError || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="w-full max-w-md mx-auto">
        <Card className="p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-purple-100 p-3 rounded-full">
              <LogIn className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 ml-3">Welcome Back</h2>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                {...register('email')}
                error={errors.email?.message}
                placeholder="Enter your email address"
                type="email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                I am a
              </label>
              <Select
                {...register('role')}
                error={errors.role?.message}
                options={[
                  { value: 'student', label: 'Student' },
                  { value: 'teacher', label: 'Teacher' },
                ]}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                4-Digit PIN
              </label>
              <Input
                {...register('pin')}
                error={errors.pin?.message}
                type="password"
                placeholder="Enter your 4-digit PIN"
                maxLength={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                effect3D
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/" className="text-purple-600 font-medium hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Login;