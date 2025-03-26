import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useAuth } from '../../lib/authContext';

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


      await login(data.email, data.role,  data.pin,);

      // Navigation is handled in the auth context
    } catch (err: any) {
      setError(err.response?.data?.message || authError || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Login</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
           Email
          </label>
          <Input
            {...register('email')}
            error={errors.email?.message}
            placeholder="Enter your email id"
            type="tel"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <Select
            {...register('role')}
            error={errors.role?.message}
            options={[
              { value: 'student', label: 'Student' },
              { value: 'teacher', label: 'Teacher' },
            ]}
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
            placeholder="Enter 4-digit PIN"
            maxLength={4}
          />
        </div>

        <button
          type="submit"
          className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/" className="text-indigo-600 hover:text-indigo-700">
              Register here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;