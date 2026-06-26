import axios from 'axios';

async function main() {
  try {
    // 1. Login as Admin
    console.log('Logging in as Admin...');
    const loginRes = await axios.post('http://127.0.0.1:5000/login', {
      email: 'admin@library.com',
      password: 'Password123!'
    });
    const token = loginRes.data.token;
    console.log('Admin login successful!');
    
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 2. Fetch Validity
    console.log('Fetching validity for STUaman_4278...');
    const validityRes = await axios.get(
      'http://127.0.0.1:5000/api/v1/fees/student/STUaman_4278/validity',
      config
    );
    console.log('VALIDITY RESPONSE:', validityRes.data);

    // 3. Fetch Student Details
    console.log('Fetching student details for STUaman_4278...');
    const studentsRes = await axios.get(
      'http://127.0.0.1:5000/api/v1/students',
      config
    );
    const aman = studentsRes.data.find(s => s.studentId === 'STUaman_4278');
    console.log('AMAN STUDENT RECORD:', aman);

    if (aman) {
      // Fetch all fees
      const feesRes = await axios.get(
        'http://127.0.0.1:5000/api/v1/fees',
        config
      );
      const amanFees = feesRes.data.filter(f => f.studentDisplayId === 'STUaman_4278' || f.studentId === aman._id);
      console.log('AMAN FEES RECORD:', amanFees);
    }
  } catch (err) {
    console.error('ERROR:', err.message);
    if (err.response) {
      console.log('RESPONSE DATA:', err.response.data);
    }
  }
}

main();
