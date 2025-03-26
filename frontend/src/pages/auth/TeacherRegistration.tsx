import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useAuth } from '../../lib/authContext';
import axios from 'axios';
import { NavLink } from 'react-router-dom';

const teacherSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  email: z.string().email('Invalid email address'),
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

    
    console.log("teacher data: ", data);
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

        <p className="text-gray-600 text-center">Already have an account? <NavLink to="/login" target="_self" rel="noreferrer" className="underline hover:text-gray-800">Login here</NavLink></p>
      </form>
    </div>
  );
};

export default TeacherRegistration;