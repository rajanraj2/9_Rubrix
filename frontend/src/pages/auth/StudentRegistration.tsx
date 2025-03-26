import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Eye, EyeOff } from 'lucide-react';
import Input from '../../components/ui/Input';
import Select from 'react-select';

import { useAuth } from '../../lib/authContext';

const studentSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  schoolCollegeName: z.string().min(2, 'School/College name is required'),
  state: z.string().min(1, 'Please select a state'),
  district: z.string().min(1, 'District is required'),
  grade: z.string().min(1, 'Please select a grade'),
  gender: z.enum(['male', 'female', 'other']),
  pin: z.string().regex(/^\d{4}$/, 'PIN must be 4 digits'),
});

type StudentFormData = z.infer<typeof studentSchema>;

const StudentRegistration = () => {
  const { registerStudent, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false); // Toggle state for PIN visibility

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const onSubmit = async (data: StudentFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await registerStudent(data);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : authError || 'Registration failed. Please try again.';

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },

  ];
  const gradeOptions = [
    { value: '1', label: '1st Grade' },
    { value: '2', label: '2nd Grade' },
    { value: '3', label: '3rd Grade' },
    { value: '4', label: '4th Grade' },
    { value: '5', label: '5th Grade' },
    { value: '6', label: '6th Grade' },
    { value: '7', label: '7th Grade' },
    { value: '8', label: '8th Grade' },
    { value: '9', label: '9th Grade' },
    { value: '10', label: '10th Grade' },
    { value: '11', label: '11th Grade' },
    { value: '12', label: '12th Grade' }
  ];

const stateOptions = [
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
  { value: "Assam", label: "Assam" },
  { value: "Bihar", label: "Bihar" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  { value: "Goa", label: "Goa" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Haryana", label: "Haryana" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Kerala", label: "Kerala" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Manipur", label: "Manipur" },
  { value: "Meghalaya", label: "Meghalaya" },
  { value: "Mizoram", label: "Mizoram" },
  { value: "Nagaland", label: "Nagaland" },
  { value: "Odisha", label: "Odisha" },
  { value: "Punjab", label: "Punjab" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Sikkim", label: "Sikkim" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Tripura", label: "Tripura" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Uttarakhand", label: "Uttarakhand" },
  { value: "West Bengal", label: "West Bengal" },
];

const customStyles = {
  menuList: (base: any) => ({
    ...base,
    maxHeight: "120px", // ✅ Limits dropdown height
    overflowY: "auto", // ✅ Enables scroll
  }),
};

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Student Registration</h2>
      
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
          <Input {...register('fullName')} error={errors.fullName?.message} placeholder="Enter your full name" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input {...register('email')} error={errors.email?.message} placeholder="Enter your email id" type="email" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <Input {...register('phoneNumber')} error={errors.phoneNumber?.message} placeholder="Enter 10-digit phone number" type="tel" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            School/College Name
          </label>
          <Input {...register('schoolCollegeName')} error={errors.schoolCollegeName?.message} placeholder="Enter your school or college name" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            School/College Name
          </label>
          <Input
            {...register('schoolCollegeName')}
            error={errors.schoolCollegeName?.message}
            placeholder="Enter your school or college name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <Select
            options={stateOptions}
            isSearchable={true} // ✅ Allows search
            styles={customStyles}
            placeholder="Select a state..."
          />

        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            District
          </label>
          <Input {...register('district')} error={errors.district?.message} placeholder="Enter your district" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grade
          </label>
          <Select
            options={gradeOptions}
            isSearchable={true} // ✅ Allows search
            styles={customStyles}
            placeholder="Please select your grade..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <Select
            options={genderOptions}
            isSearchable={true} // ✅ Allows search
            styles={customStyles}
            placeholder="Please select your gender..."
          />
        </div>

        
        {/* PIN Input with Show/Hide Password Icon */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            4-Digit PIN
          </label>
          <div className="relative">
            <Input
              {...register('pin')}
              error={errors.pin?.message}
              type={showPin ? "text" : "password"}
              placeholder="Enter 4-digit PIN"
              maxLength={4}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"

          className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default StudentRegistration;
