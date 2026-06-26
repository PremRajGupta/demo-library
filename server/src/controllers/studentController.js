import Student from '../models/Student.js';
import Seat from '../models/Seat.js';
import PublicStats from '../models/PublicStats.js';
import imageService from '../services/imageService.js';
import { getFeeForTimeShift } from '../utils/feeRules.js';
import { parseDateInputValue } from '../utils/feeDues.js';
import { generateUniqueStudentId } from '../utils/studentId.js';

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    // Migrate any students that don't have a password yet
    const migratedStudents = await Promise.all(students.map(async (student) => {
      if (!student.password) {
        const randomPin = Math.floor(1000 + Math.random() * 9000);
        student.password = `Galaxy@${randomPin}`;
        await student.save();
      }
      return student;
    }));
    res.status(200).json(migratedStudents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    if (!student.password) {
      const randomPin = Math.floor(1000 + Math.random() * 9000);
      student.password = `Galaxy@${randomPin}`;
      await student.save();
    }
    
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
};

export const createStudent = async (req, res) => {
  try {
    // Generate a secure random password for the student (Galaxy@XXXX)
    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const studentData = {
      organizationId: process.env.DEFAULT_ORGANIZATION_ID || 'demo-library',
      branchId: process.env.DEFAULT_BRANCH_ID || 'main-branch',
      password: `Galaxy@${randomPin}`,
      ...req.body
    };

    if (studentData.photo && studentData.photo.startsWith('data:image')) {
      try {
        const uploadResult = await imageService.uploadBase64(studentData.photo, studentData.organizationId, 'student_photo');
        studentData.photo = uploadResult.url;
        studentData.photoPublicId = uploadResult.publicId;
      } catch (err) {
        console.warn('Cloudinary upload failed for photo, falling back to base64:', err.message);
      }
    }
    
    if (studentData.aadharFront && studentData.aadharFront.startsWith('data:image')) {
      try {
        const uploadResult = await imageService.uploadBase64(studentData.aadharFront, studentData.organizationId, 'aadhar_front');
        studentData.aadharFront = uploadResult.url;
        studentData.aadharFrontPublicId = uploadResult.publicId;
      } catch (err) {
        console.warn('Cloudinary upload failed for aadhar front, falling back to base64:', err.message);
      }
    }
    
    if (studentData.aadharBack && studentData.aadharBack.startsWith('data:image')) {
      try {
        const uploadResult = await imageService.uploadBase64(studentData.aadharBack, studentData.organizationId, 'aadhar_back');
        studentData.aadharBack = uploadResult.url;
        studentData.aadharBackPublicId = uploadResult.publicId;
      } catch (err) {
        console.warn('Cloudinary upload failed for aadhar back, falling back to base64:', err.message);
      }
    }

    const fixedFeeAmount = getFeeForTimeShift(studentData.timeShift);
    if (fixedFeeAmount > 0) {
      studentData.feeAmount = fixedFeeAmount;
    }

    if (studentData.joiningDate) {
      const joinDate = parseDateInputValue(studentData.joiningDate);
      if (joinDate) {
        studentData.joiningDate = joinDate;
        studentData.admissionDate = joinDate;
      }
    }
    
    studentData.studentId = await generateUniqueStudentId(Student, studentData.name);
    
    const newStudent = new Student(studentData);
    await newStudent.save();

    // Increment cumulative admissions counter
    const publicStats = await PublicStats.findOne({ key: 'landing' });
    if (publicStats) {
      publicStats.totalAdmissionsEver = (publicStats.totalAdmissionsEver || 600) + 1;
      await publicStats.save();
    }

    // If a seat is assigned, update the seat status
    if (studentData.seatNumber && studentData.seatNumber !== '--') {
      let seat = await Seat.findOne({
        seatNumber: studentData.seatNumber,
        organizationId: studentData.organizationId,
        branchId: studentData.branchId
      });
      if (!seat) {
        seat = new Seat({
          seatNumber: studentData.seatNumber,
          organizationId: studentData.organizationId,
          branchId: studentData.branchId
        });
      }
      seat.status = 'occupied';
      seat.studentId = newStudent._id;
      seat.studentName = newStudent.name;
      seat.assignedDate = new Date();
      await seat.save();
    }

    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: 'Error creating student', error: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const studentData = { ...req.body };
    const orgId = process.env.DEFAULT_ORGANIZATION_ID || 'demo-library';
    const branchId = process.env.DEFAULT_BRANCH_ID || 'main-branch';

    if (studentData.photo && studentData.photo.startsWith('data:image')) {
      try {
        const uploadResult = await imageService.uploadBase64(studentData.photo, orgId, 'student_photo');
        studentData.photo = uploadResult.url;
        studentData.photoPublicId = uploadResult.publicId;
      } catch (err) {
        console.warn('Cloudinary upload failed for photo, falling back to base64:', err.message);
      }
    }

    if (studentData.aadharFront && studentData.aadharFront.startsWith('data:image')) {
      try {
        const uploadResult = await imageService.uploadBase64(studentData.aadharFront, orgId, 'aadhar_front');
        studentData.aadharFront = uploadResult.url;
        studentData.aadharFrontPublicId = uploadResult.publicId;
      } catch (err) {
        console.warn('Cloudinary upload failed for aadhar front, falling back to base64:', err.message);
      }
    }

    if (studentData.aadharBack && studentData.aadharBack.startsWith('data:image')) {
      try {
        const uploadResult = await imageService.uploadBase64(studentData.aadharBack, orgId, 'aadhar_back');
        studentData.aadharBack = uploadResult.url;
        studentData.aadharBackPublicId = uploadResult.publicId;
      } catch (err) {
        console.warn('Cloudinary upload failed for aadhar back, falling back to base64:', err.message);
      }
    }

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Handle seat clearing when marking as inactive
    if (studentData.status === 'inactive' && student.status !== 'inactive') {
      if (student.seatNumber && student.seatNumber !== '--') {
        await Seat.findOneAndUpdate(
          { seatNumber: student.seatNumber, organizationId: orgId, branchId: branchId },
          { status: 'available', studentId: null, studentName: null, assignedDate: null, expiryDate: null }
        );
      }
      studentData.seatNumber = null;
    }

    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, studentData, { new: true });
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: 'Error updating student', error: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Free up the seat
    if (student.seatNumber && student.seatNumber !== '--') {
      await Seat.findOneAndUpdate(
        { seatNumber: student.seatNumber },
        { status: 'available', studentId: null, studentName: null, assignedDate: null, expiryDate: null }
      );
    }

    await Student.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
};
