import { buildStudentId } from '../src/utils/studentId.js';

describe('buildStudentId', () => {
  it('uses first name lowercase and random 4 digits', () => {
    const id = buildStudentId('Rimpi Kumari');
    expect(id).toMatch(/^STUrimpi_\d{4}$/);
  });

  it('falls back when name is empty', () => {
    const id = buildStudentId('   ');
    expect(id).toMatch(/^STUstudent_\d{4}$/);
  });

  it('strips non-letters from first name', () => {
    const id = buildStudentId("O'Brien Smith");
    expect(id).toMatch(/^STUobrien_\d{4}$/);
  });
});
