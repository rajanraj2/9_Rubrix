import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useAuth } from '../../lib/authContext';

const teacherSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  schoolName: z.string().min(2, 'School name is required'),
  gender: z.enum(['male', 'female', 'other']),
  state: z.string().min(1, 'Please select a state'),
  collegeNumber: z.string().min(1, 'College number is required'),
  pin: z.string().regex(/^\d{4}$/, 'PIN must be 4 digits'),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

const TeacherRegistration = () => {
  const { registerTeacher, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  });

  const onSubmit = async (data: TeacherFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await registerTeacher(data);
      // Navigation is handled in the auth context
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 
                          authError || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Teacher Registration</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <Input
            {...register('fullName')}
            error={errors.fullName?.message}
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <Input
            {...register('phoneNumber')}
            error={errors.phoneNumber?.message}
            placeholder="Enter 10-digit phone number"
            type="tel"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            School/University Name
          </label>
          <Input
            {...register('schoolName')}
            error={errors.schoolName?.message}
            placeholder="Enter school name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <Select
            {...register('gender')}
            error={errors.gender?.message}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <Select
            {...register('state')}
            error={errors.state?.message}
            options={[
              { value: 'CA', label: 'California' },
              { value: 'NY', label: 'New York' },
              { value: 'TX', label: 'Texas' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            College Number
          </label>
          <Input
            {...register('collegeNumber')}
            error={errors.collegeNumber?.message}
            placeholder="Enter college number"
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
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default TeacherRegistration;