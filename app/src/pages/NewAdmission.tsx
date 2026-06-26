import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import TopHeader from '../components/layout/TopHeader';
import { UserPlus } from 'lucide-react';
import ImageCaptureField from '../components/ImageCaptureField';
import type { AdmissionFormData } from '../sections/admission/admissionService';
import { submitAdmission } from '../sections/admission/admissionService';
import {
  OTHER_TIME_SHIFT,
  TIME_SHIFT_OPTIONS,
  getFeeForTimeShift,
  isPresetTimeShift,
} from '../lib/feeRules';
import { formatJoiningDate, toDateInputValue } from '../lib/formatDate';
import { COURSE_OPTIONS, getCourseLabel } from '../lib/courseOptions';
import { seatApi, studentApi } from '../lib/apiService';
import { generateAllSeatNumbers, getAvailableSeatsFromStudents } from '../lib/seatLayout';
import { normalizeIndianMobile, validateIndianMobile } from '../lib/phoneValidation';
import { normalizeAadharNumber, validateAadharNumber } from '../lib/aadharValidation';

const RUPEE = '\u20B9';
const formatRupee = (amount: number) => `${RUPEE}${amount.toLocaleString('en-IN')}`;
const RequiredMark = () => <span className="text-red-600"> *</span>;

export default function NewAdmission() {
  const [formData, setFormData] = useState<AdmissionFormData>({
    name: '',
    fatherName: '',
    motherName: '',
    mobile: '',
    parentMobile: '',
    email: '',
    address: '',
    course: '',
    customCourse: '',
    seatNumber: '',
    customSeat: '',
    feeAmount: '',
    paidAmount: '',
    paymentMode: 'cash',
    timeShift: '',
    customShiftHours: '',
    joiningDate: toDateInputValue(),
    aadharNumber: '',
    photo: undefined,
    aadharFront: undefined,
    aadharBack: undefined,
  });
  const [submitted, setSubmitted] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [aadharFrontPreview, setAadharFrontPreview] = useState<string | null>(null);
  const [aadharBackPreview, setAadharBackPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [admissionResult, setAdmissionResult] = useState<any>(null);
  const [availableSeats, setAvailableSeats] = useState<string[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(true);
  const [seatSearch, setSeatSearch] = useState('');
  const [seatDropdownOpen, setSeatDropdownOpen] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  const seatDropdownRef = useRef<HTMLDivElement>(null);

  const loadAvailableSeats = async () => {
    setSeatsLoading(true);
    try {
      const data = await seatApi.getAvailableSeats();
      if (Array.isArray(data?.seats)) {
        setAvailableSeats(data.seats);
        setSeatsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Failed to load available seats from API:', error);
    }

    try {
      const students = await studentApi.getStudents();
      setAvailableSeats(getAvailableSeatsFromStudents(students));
    } catch (error) {
      console.error('Failed to derive available seats from students:', error);
      setAvailableSeats(generateAllSeatNumbers());
    } finally {
      setSeatsLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableSeats();
  }, [submitted]);

  useEffect(() => {
    if (submitted && successMessage && successRef.current) {
      successRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [submitted, successMessage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (seatDropdownRef.current && !seatDropdownRef.current.contains(event.target as Node)) {
        setSeatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: normalizeIndianMobile(value) });
  };

  const handleAadharNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, aadharNumber: normalizeAadharNumber(e.target.value) });
  };

  const handleTimeShiftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const timeShift = e.target.value;
    const presetFee = isPresetTimeShift(timeShift) ? String(getFeeForTimeShift(timeShift)) : '';
    setFormData({
      ...formData,
      timeShift,
      feeAmount: presetFee,
      customShiftHours: timeShift === OTHER_TIME_SHIFT ? formData.customShiftHours : '',
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === '' || /^\d+$/.test(value)) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const isOtherShift = formData.timeShift === OTHER_TIME_SHIFT;
  const isPresetShift = isPresetTimeShift(formData.timeShift);
  const needsParentMobile = formData.timeShift === 'night' || formData.timeShift === '24hours';

  const seatSearchQuery = seatSearch.trim().toLowerCase();
  const filteredSeats = availableSeats.filter(
    (seat) => !seatSearchQuery || seat.toLowerCase().includes(seatSearchQuery),
  );
  const showOtherSeatOption = !seatSearchQuery
    || 'other'.includes(seatSearchQuery)
    || 'custom'.includes(seatSearchQuery);

  const handleSeatSearchChange = (value: string) => {
    setSeatSearch(value);
    setSeatDropdownOpen(true);

    const exactMatch = availableSeats.find(
      (seat) => seat.toLowerCase() === value.trim().toLowerCase(),
    );
    if (exactMatch) {
      setFormData((prev) => ({ ...prev, seatNumber: exactMatch, customSeat: '' }));
      return;
    }

    if (formData.seatNumber === 'other') {
      if (value !== 'Other (custom seat)') {
        setFormData((prev) => ({ ...prev, seatNumber: '', customSeat: '' }));
      }
      return;
    }

    if (formData.seatNumber && formData.seatNumber !== value) {
      setFormData((prev) => ({ ...prev, seatNumber: '', customSeat: '' }));
    }
  };

  const selectSeat = (seat: string) => {
    if (seat === 'other') {
      setFormData((prev) => ({ ...prev, seatNumber: 'other', customSeat: prev.customSeat }));
      setSeatSearch('Other (custom seat)');
    } else {
      setFormData((prev) => ({ ...prev, seatNumber: seat, customSeat: '' }));
      setSeatSearch(seat);
    }
    setSeatDropdownOpen(false);
  };

  const expectedFee = Number(formData.feeAmount) || 0;
  const paidAmount = Number(formData.paidAmount) || 0;
  const pendingAmount = Math.max(expectedFee - paidAmount, 0);

  const setStudentPhoto = (dataUrl: string | null) => {
    setPhotoPreview(dataUrl);
    setFormData((prev) => ({ ...prev, photo: dataUrl ?? undefined }));
  };

  const setAadharFrontImage = (dataUrl: string | null) => {
    setAadharFrontPreview(dataUrl);
    setFormData((prev) => ({ ...prev, aadharFront: dataUrl ?? undefined }));
  };

  const setAadharBackImage = (dataUrl: string | null) => {
    setAadharBackPreview(dataUrl);
    setFormData((prev) => ({ ...prev, aadharBack: dataUrl ?? undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm();
    if (!validation) return;
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await submitAdmission(formData);
      setAdmissionResult(result);
      setSuccessMessage(result.message);
      setSubmitted(true);
      resetForm({ keepFeedback: true });
      await loadAvailableSeats();
      setTimeout(() => {
        setSubmitted(false);
        setSuccessMessage('');
        setAdmissionResult(null);
      }, 15000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to process admission';
      setErrorMessage(errorMsg);
      console.error('Error submitting admission:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Student name is required.';
    if (!formData.fatherName.trim()) e.fatherName = "Father's name is required.";
    if (!formData.motherName?.trim()) e.motherName = "Mother's name is required.";
    const mobileError = validateIndianMobile(formData.mobile, { required: true, field: 'Mobile number' });
    if (mobileError) e.mobile = mobileError;

    const parentMobileError = validateIndianMobile(formData.parentMobile || '', {
      required: needsParentMobile,
      field: 'Parent mobile number',
    });
    if (parentMobileError) e.parentMobile = parentMobileError;
    if (!formData.address.trim()) e.address = 'Address is required.';
    if (!formData.course) e.course = 'Please select a course.';
    if (formData.course === 'other' && !formData.customCourse?.trim()) e.customCourse = 'Enter custom course name.';
    if (!formData.seatNumber) e.seatNumber = 'Please select seat.';
    if (
      formData.seatNumber &&
      formData.seatNumber !== 'other' &&
      !availableSeats.includes(formData.seatNumber)
    ) {
      e.seatNumber = 'This seat is already occupied. Please choose another seat.';
    }
    if (formData.seatNumber === 'other' && !formData.customSeat?.trim()) e.customSeat = 'Enter custom seat number.';
    if (!formData.timeShift) e.timeShift = 'Please select time shift.';
    if (isOtherShift) {
      const hours = Number(formData.customShiftHours);
      if (!formData.customShiftHours || !Number.isInteger(hours) || hours < 1 || hours > 24) {
        e.customShiftHours = 'Enter shift hours (1–24).';
      }
    }
    if (!formData.joiningDate) e.joiningDate = 'Joining date is required.';
    if (isPresetShift) {
      const presetFee = getFeeForTimeShift(formData.timeShift);
      if (!presetFee) e.feeAmount = 'Invalid time shift fee.';
      else if (Number(formData.feeAmount) !== presetFee) {
        e.feeAmount = 'Expected fee must match the selected time shift.';
      }
    } else if (!formData.feeAmount || Number(formData.feeAmount) <= 0) {
      e.feeAmount = 'Enter a valid expected fee amount.';
    }
    if (formData.paidAmount === '' || Number(formData.paidAmount) < 0) e.paidAmount = 'Enter paid amount.';
    if (Number(formData.paidAmount) > Number(formData.feeAmount)) e.paidAmount = 'Paid amount cannot exceed expected fee.';
    if (!formData.email?.trim()) e.email = 'Email is required.';
    const aadharNumberError = validateAadharNumber(formData.aadharNumber, { required: false });
    if (aadharNumberError) e.aadharNumber = aadharNumberError;
    if (!formData.photo) e.photo = 'Student photo is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const initialForm = {
    name: '',
    fatherName: '',
    motherName: '',
    mobile: '',
    parentMobile: '',
    email: '',
    address: '',
    course: '',
    customCourse: '',
    seatNumber: '',
    customSeat: '',
    feeAmount: '',
    paidAmount: '',
    paymentMode: 'cash',
    timeShift: '',
    customShiftHours: '',
    joiningDate: toDateInputValue(),
    aadharNumber: '',
    photo: undefined,
    aadharFront: undefined,
    aadharBack: undefined,
  } as AdmissionFormData;

  const resetForm = (options?: { keepFeedback?: boolean }) => {
    setFormData({ ...initialForm });
    setPhotoPreview(null);
    setAadharFrontPreview(null);
    setAadharBackPreview(null);
    setSeatSearch('');
    setSeatDropdownOpen(false);
    setErrors({});
    if (!options?.keepFeedback) {
      setSuccessMessage('');
      setErrorMessage('');
      setAdmissionResult(null);
    }
  };

  return (
    <div>
      <TopHeader />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e0f2fe] to-[#dbeafe] rounded-xl flex items-center justify-center">
                <UserPlus className="text-[#0369a1]" size={22} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#0f172a]">New Admission</h2>
                <p className="text-sm text-[#64748b] mt-1">Add a new student profile and assign seat & fees</p>
              </div>
            </div>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
              >
                <p className="font-medium">⚠ Error: {errorMessage}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">
                    Student Name<RequiredMark />
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    className="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                    required
                  />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">
                    Father&apos;s Name<RequiredMark />
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="Enter father's name"
                    className="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                    required
                  />
                  {errors.fatherName && <p className="text-xs text-red-600 mt-1">{errors.fatherName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">
                    Mother&apos;s Name<RequiredMark />
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    placeholder="Enter mother's name"
                    className="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                    required
                  />
                  {errors.motherName && <p className="text-xs text-red-600 mt-1">{errors.motherName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">
                    Mobile Number<RequiredMark />
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleMobileChange}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="\d{10}"
                    className="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                    required
                  />
                  {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">
                    Joining Date<RequiredMark />
                  </label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all bg-white"
                    required
                  />
                  {errors.joiningDate && <p className="text-xs text-red-600 mt-1">{errors.joiningDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">
                    Time Shift<RequiredMark />
                  </label>
                  <select
                    name="timeShift"
                    value={formData.timeShift}
                    onChange={handleTimeShiftChange}
                    className="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all bg-white"
                    required
                  >
                    <option value="">Select shift</option>
                    {TIME_SHIFT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[#64748b] mt-1">
                    {isOtherShift
                      ? 'Other shift: enter expected and paid fee manually below.'
                      : isPresetShift
                        ? `Expected fee is set from shift (${formatRupee(getFeeForTimeShift(formData.timeShift))}). Edit paid amount only.`
                        : 'Select a time shift to set the expected fee.'}
                  </p>
                  {errors.timeShift && <p className="text-xs text-red-600 mt-1">{errors.timeShift}</p>}
                  {isOtherShift && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-[#475569] mb-1">
                        Kitne ghante ka time shift?<RequiredMark />
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        name="customShiftHours"
                        value={formData.customShiftHours}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d+$/.test(value)) {
                            setFormData({ ...formData, customShiftHours: value });
                          }
                        }}
                        placeholder="e.g. 10"
                        className="w-full px-3 py-2 border border-[#e6eef8] rounded-md"
                      />
                      {errors.customShiftHours && (
                        <p className="text-xs text-red-600 mt-1">{errors.customShiftHours}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">
                    Parent Mobile Number
                    {needsParentMobile && <RequiredMark />}
                  </label>
                  <input
                    type="tel"
                    name="parentMobile"
                    value={formData.parentMobile}
                    onChange={handleMobileChange}
                    placeholder="10-digit parent mobile"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="\d{10}"
                    className="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                  />
                  <p className="text-xs text-[#475569] mt-1">
                    {needsParentMobile
                      ? 'Required for Night Shift or 24 Hours.'
                      : 'Optional — you can enter parent mobile for any shift.'}
                  </p>
                  {errors.parentMobile && <p className="text-xs text-red-600 mt-1">{errors.parentMobile}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">
                    Email<RequiredMark />
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                    required
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">
                    Address<RequiredMark />
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter full address"
                    rows={3}
                    className="w-full px-4 py-3 border border-[#e6eef8] rounded-lg focus:outline-none focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 transition-all resize-none bg-[#fbfdff]"
                    required
                  />
                  {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">
                    Course/Class<RequiredMark />
                  </label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, course: value, customCourse: value === 'other' ? formData.customCourse : '' });
                    }}
                    className="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all bg-white"
                    required
                  >
                    <option value="">Select course</option>
                    {COURSE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formData.course === 'other' && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-[#475569] mb-1">
                        Custom Course Name<RequiredMark />
                      </label>
                      <input
                        type="text"
                        name="customCourse"
                        value={formData.customCourse}
                        onChange={handleChange}
                        placeholder="Enter course name"
                        className="w-full px-3 py-2 border border-[#e6eef8] rounded-md"
                      />
                      {errors.customCourse && <p className="text-xs text-red-600 mt-1">{errors.customCourse}</p>}
                    </div>
                  )}
                </div>

                <div ref={seatDropdownRef} className="relative">
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">
                    Seat Number<RequiredMark />
                  </label>
                  <input
                    type="text"
                    value={seatSearch}
                    onChange={(e) => handleSeatSearchChange(e.target.value)}
                    onFocus={() => !seatsLoading && setSeatDropdownOpen(true)}
                    placeholder={seatsLoading ? 'Loading seats...' : 'Choose Seat'}
                    disabled={seatsLoading}
                    autoComplete="off"
                    className="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all bg-white disabled:bg-[#f1f5f9] disabled:cursor-not-allowed"
                  />
                  {!seatsLoading && seatDropdownOpen && (filteredSeats.length > 0 || showOtherSeatOption) && (
                    <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto rounded-lg border border-[#e2e8f0] bg-white shadow-lg">
                      {filteredSeats.map((seat) => (
                        <button
                          key={seat}
                          type="button"
                          onMouseDown={(ev) => ev.preventDefault()}
                          onClick={() => selectSeat(seat)}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[#f1f5f9] transition-colors ${formData.seatNumber === seat ? 'bg-[#eff6ff] text-[#0369a1] font-medium' : 'text-[#1e293b]'
                            }`}
                        >
                          {seat}
                        </button>
                      ))}
                      {showOtherSeatOption && (
                        <button
                          type="button"
                          onMouseDown={(ev) => ev.preventDefault()}
                          onClick={() => selectSeat('other')}
                          className={`w-full px-4 py-2.5 text-left text-sm border-t border-[#e2e8f0] hover:bg-[#f1f5f9] transition-colors ${formData.seatNumber === 'other' ? 'bg-[#eff6ff] text-[#0369a1] font-medium' : 'text-[#64748b]'
                            }`}
                        >
                          Other (custom seat)
                        </button>
                      )}
                    </div>
                  )}
                  {!seatsLoading && seatDropdownOpen && seatSearchQuery && filteredSeats.length === 0 && !showOtherSeatOption && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-[#64748b] shadow-lg">
                      No seat found. Try another search or choose Other (custom seat).
                    </div>
                  )}
                  {!seatsLoading && (
                    <p className="text-xs text-[#64748b] mt-1">
                      {availableSeats.length} seats available — type to search
                    </p>
                  )}
                  {errors.seatNumber && <p className="text-xs text-red-600 mt-1">{errors.seatNumber}</p>}
                  {formData.seatNumber === 'other' && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-[#475569] mb-1">
                        Custom Seat Number<RequiredMark />
                      </label>
                      <input
                        type="text"
                        name="customSeat"
                        value={formData.customSeat}
                        onChange={handleChange}
                        placeholder="Enter seat number"
                        className="w-full px-3 py-2 border border-[#e6eef8] rounded-md"
                      />
                      {errors.customSeat && <p className="text-xs text-red-600 mt-1">{errors.customSeat}</p>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">
                    Expected Fee Amount<RequiredMark />
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748b]">{RUPEE}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="feeAmount"
                      value={formData.feeAmount}
                      onChange={handleAmountChange}
                      placeholder={isOtherShift ? 'Enter expected monthly fee' : 'Select time shift first'}
                      readOnly={isPresetShift}
                      disabled={!formData.timeShift}
                      className={`w-full pl-10 px-4 py-3 border border-[#e6eef8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0369a1]/20 transition-all ${isPresetShift ? 'bg-[#f1f5f9] text-[#475569] cursor-not-allowed' : 'bg-[#fbfdff] focus:border-[#0369a1]'
                        }`}
                      required
                    />
                    {errors.feeAmount && <p className="text-xs text-red-600 mt-1">{errors.feeAmount}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">
                    Paid Amount<RequiredMark />
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748b]">{RUPEE}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="paidAmount"
                      value={formData.paidAmount}
                      onChange={handleAmountChange}
                      placeholder="Enter amount paid at admission"
                      disabled={!formData.timeShift}
                      className="w-full pl-10 px-4 py-3 border border-[#e6eef8] rounded-lg focus:outline-none focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 transition-all bg-[#fbfdff] disabled:bg-[#f1f5f9] disabled:cursor-not-allowed"
                      required
                    />
                    {errors.paidAmount && <p className="text-xs text-red-600 mt-1">{errors.paidAmount}</p>}
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4">
                    <p className="text-xs font-medium text-[#64748b]">Expected Fee</p>
                    <p className="mt-1 text-xl font-bold text-[#0f172a]">{formatRupee(expectedFee)}</p>
                  </div>
                  <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-4">
                    <p className="text-xs font-medium text-[#15803d]">Paid Amount</p>
                    <p className="mt-1 text-xl font-bold text-[#16a34a]">{formatRupee(paidAmount)}</p>
                  </div>
                  <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-4">
                    <p className="text-xs font-medium text-[#b91c1c]">Pending Amount</p>
                    <p className="mt-1 text-xl font-bold text-[#dc2626]">{formatRupee(pendingAmount)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">Payment Mode</label>
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#e6eef8] rounded-lg focus:outline-none focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 transition-all bg-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI/QR</option>
                    <option value="card">Card</option>
                  </select>
                </div>
              </div>

              <div className="max-w-md">
                <ImageCaptureField
                  label={
                    <span className="block text-sm font-medium text-[#1e293b]">
                      Student Photo<RequiredMark />
                    </span>
                  }
                  previewUrl={photoPreview}
                  onImageChange={setStudentPhoto}
                  facingMode="user"
                  emptyHint="No photo"
                  error={errors.photo}
                  helperText="Use front camera for student photo. Gallery or Camera — max ~2MB after compress."
                />
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-medium text-[#0f172a] mb-3">
                  Aadhaar Card <span className="text-xs text-[#64748b] font-normal">(Optional)</span>
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleAadharNumberChange}
                    placeholder="12-digit Aadhaar number"
                    inputMode="numeric"
                    maxLength={12}
                    className="w-full md:max-w-sm px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                  />
                  {errors.aadharNumber && (
                    <p className="text-xs text-red-600 mt-1">{errors.aadharNumber}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageCaptureField
                    label={
                      <span className="block text-xs font-medium text-[#475569]">Front Side</span>
                    }
                    previewUrl={aadharFrontPreview}
                    onImageChange={setAadharFrontImage}
                    facingMode="environment"
                    previewClassName="w-full max-w-[200px] h-28"
                    emptyHint="No front image"
                    error={errors.aadharFront}
                    helperText="Place Aadhaar flat; use back camera for clear scan."
                  />
                  <ImageCaptureField
                    label={
                      <span className="block text-xs font-medium text-[#475569]">Back Side</span>
                    }
                    previewUrl={aadharBackPreview}
                    onImageChange={setAadharBackImage}
                    facingMode="environment"
                    previewClassName="w-full max-w-[200px] h-28"
                    emptyHint="No back image"
                    error={errors.aadharBack}
                    helperText="Capture back side in good light."
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className={`w-full md:w-auto inline-flex items-center gap-3 px-6 py-3 font-semibold rounded-lg transition-colors duration-150 ${submitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#0369a1] text-white hover:bg-[#075985]'}`}
                  disabled={submitting}
                >
                  <UserPlus size={18} />
                  Admit Student
                </button>
              </div>

              {submitted && successMessage && (
                <motion.div
                  ref={successRef}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-5 bg-green-50 border border-green-200 rounded-xl"
                >
                  <p className="text-green-800 font-semibold text-base mb-3">{successMessage}</p>
                  {admissionResult && (
                    <div className="text-sm text-green-700 space-y-1.5 bg-white/60 rounded-lg p-4 border border-green-100">
                      {admissionResult.student && (
                        <>
                          <p>✓ Student ID: <span className="font-semibold">{admissionResult.student.studentId}</span></p>
                          <p>📧 Portal Login Email: <span className="font-semibold">{admissionResult.student.email}</span></p>
                          <p>🔑 Portal Login Password: <span className="font-mono font-bold text-[#3b82f6] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{admissionResult.student.password || 'Galaxy@XXXX'}</span></p>
                          <p>✓ Course: {getCourseLabel(admissionResult.student.course)}</p>
                          <p>✓ Joining Date: {formatJoiningDate(
                            admissionResult.student.joiningDate || admissionResult.student.admissionDate
                          )}</p>
                        </>
                      )}
                      {admissionResult.fee && (
                        <p>✓ Initial Fee recorded: {formatRupee(admissionResult.fee.amount)}</p>
                      )}
                      <p>Expected Fee: {formatRupee(admissionResult.expectedFee ?? 0)}</p>
                      <p>Paid Amount: {formatRupee(admissionResult.paidAmount ?? 0)}</p>
                      <p>Pending Amount: {formatRupee(admissionResult.pendingAmount ?? 0)}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
