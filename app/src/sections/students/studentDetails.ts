export interface Student {
  id: string;
  name: string;
  studentId: string;
  course: string;
  seat: string;
  contact: string;
  admissionDate: string;
  joiningDate?: string;
  status: 'active' | 'inactive' | 'expired';
  photo?: string; // data URL
  aadharNumber?: string;
  aadharFront?: string; // data URL
  aadharBack?: string; // data URL
}

