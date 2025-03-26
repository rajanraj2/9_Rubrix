export interface UserBase {
  id: string;
  fullName: string;
  phoneNumber: string;
  gender: 'male' | 'female' | 'other';
  state: string;
  pin: string;
}

export interface Student extends UserBase {
  role: 'student';
  district: string;
  grade: string;
}

export interface Teacher extends UserBase {
  role: 'teacher';
  schoolCollegeName: string;
  collegeNumber: string;
}

export type User = Student | Teacher;