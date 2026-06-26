import mongoose from 'mongoose';
import Student from './src/models/Student.js';
import Fee from './src/models/Fee.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/demo_library';

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');
  
  const student = await Student.findOne({ studentId: 'STUaman_4278' }).lean();
  console.log('STUDENT:', student);
  
  if (student) {
    const fees = await Fee.find({ studentId: student._id }).lean();
    console.log('FEES:', fees);
  }
  
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
