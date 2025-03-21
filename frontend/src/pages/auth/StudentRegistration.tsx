import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const studentSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  state: z.string().min(1, 'Please select a state'),
  district: z.string().min(1, 'District is required'),
  grade: z.string().min(1, 'Please select a grade'),
  gender: z.enum(['male', 'female', 'other']),
  pin: z.string().regex(/^\d{4}$/, 'PIN must be 4 digits'),
});

type StudentFormData = z.infer<typeof studentSchema>;

const StudentRegistration = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const onSubmit = (data: StudentFormData) => {
    console.log(data);
    navigate('/dashboard/student');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Student Registration</h2>
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
            District
          </label>
          <Input
            {...register('district')}
            error={errors.district?.message}
            placeholder="Enter your district"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grade
          </label>
          <Select
            {...register('grade')}
            error={errors.grade?.message}
            options={[
              { value: '9', label: '9th Grade' },
              { value: '10', label: '10th Grade' },
              { value: '11', label: '11th Grade' },
              { value: '12', label: '12th Grade' },
            ]}
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
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default StudentRegistration;