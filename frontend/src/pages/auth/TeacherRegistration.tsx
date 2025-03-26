import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../../components/ui/Input';

import { Eye, EyeOff } from 'lucide-react';
// import Select from '../../components/ui/Select';
import Select from 'react-select';
import { useAuth } from '../../lib/authContext';
import axios from 'axios';


const teacherSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
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

  const [showPin, setShowPin] = useState(false); 
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');


  
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  });


  // ✅ Send Verification Code to Email
  const sendVerificationCode = async () => {
    const email = getValues('email');
    if (!email) {
      setEmailError('Please enter a valid email');
      return;
    }

    try {
      await axios.post("http://localhost:5001/api/auth/teacher/send-verification-code", { email });
      setEmailSent(true);
      setEmailError('');
      alert("Verification code sent to your email.");
    } catch (error) {
      setEmailError("Failed to send verification code.");
    }
  };

  // ✅ Verify the Code Entered
  const verifyCode = async () => {
    const email = getValues('email');
    try {
      const response = await axios.post("http://localhost:5001/api/auth/teacher/verify-email", {
        email,
        code: verificationCode,
      });

      if (response.data.message === "Email verified successfully!") {
        setEmailVerified(true);
        alert("Email verified successfully!");
      } else {
        alert("Invalid verification code.");
      }
    } catch (error) {
      alert("Failed to verify email.");
    }
  };


  const onSubmit = async (data: TeacherFormData) => {
    if (!emailVerified) {
      alert("Please verify your email before registering.");
      return;
    }

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

  const genderOptions = [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },

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

        {/* ✅ Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <Input
            {...register('email')}
            error={errors.email?.message || emailError}
            placeholder="Enter your email"
            disabled={emailSent} // ✅ Disable email field after sending code
          />
          <button
            type="button"
            className="bg-blue-500 text-white py-1 px-3 rounded-md mt-2"
            onClick={sendVerificationCode}
            disabled={emailSent} // ✅ Disable button after sending code
          >
            {emailSent ? "Code Sent" : "Send Verification Code"}
          </button>
        </div>

        {/* ✅ Verification Code Field */}
        {emailSent && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <Input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter verification code"
            />
            <button
              type="button"
              className="bg-green-500 text-white py-1 px-3 rounded-md mt-2"
              onClick={verifyCode}
              disabled={emailVerified} // ✅ Disable once verified
            >
              {emailVerified ? "Verified" : "Verify Code"}
            </button>
          </div>
        )}


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
            options={genderOptions}
            isSearchable={true} // ✅ Allows search
            styles={customStyles}
            placeholder="Please select your gender..."
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
            College Number
          </label>
          <Input
            {...register('collegeNumber')}
            error={errors.collegeNumber?.message}
            placeholder="Enter college number"
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