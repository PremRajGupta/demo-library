import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TopHeader from '../components/layout/TopHeader';
import { Monitor, Save, Plus, Trash2 } from 'lucide-react';
import {
  DEFAULT_SITE_CONTENT,
  DEFAULT_FACULTY_PHOTO_URL,
  type SiteContent,
  type ComputerCourse
} from '../data/landingContent';
import {
  loadSiteContent,
  saveSiteContent,
} from '../lib/siteContentService';

const inputClass =
  'w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 text-xs';
const labelClass = 'block text-xs font-semibold text-[#475569] mb-1';

export default function ComputerCenterAdmin() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');
  const [activeTab, setActiveTab] = useState<'courses' | 'teachers'>('courses');

  useEffect(() => {
    loadSiteContent()
      .then(({ content }) => setContent(content))
      .finally(() => setLoading(false));
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSiteContent(content);
      const { content: saved } = await loadSiteContent();
      setContent(saved);
      showNotification('Saved! Computer Center page will show updated courses.');
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      showNotification(`Save failed: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const addCourse = () => {
    setContent(prev => ({
      ...prev,
      computerCourses: [
        ...(prev.computerCourses || []),
        {
          id: `course_${Date.now()}`,
          title: 'New Course',
          fullName: 'NEW COURSE FULL NAME',
          duration: '3 Months',
          fee: '1,000.00',
          color: 'from-slate-900 to-[#0a192f]',
          image: ''
        }
      ]
    }));
  };

  const updateCourse = (index: number, field: keyof ComputerCourse, value: string) => {
    setContent(prev => {
      const updated = [...(prev.computerCourses || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, computerCourses: updated };
    });
  };

  const removeCourse = (index: number) => {
    if (!window.confirm('Delete this course?')) return;
    setContent(prev => {
      const updated = [...(prev.computerCourses || [])];
      updated.splice(index, 1);
      return { ...prev, computerCourses: updated };
    });
  };

  const courses = content.computerCourses || [];

  const nextItemId = (items: { id: number }[]) => {
    return items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
  };

  const updatePageText = (field: keyof SiteContent['pageText'], value: string) => {
    setContent((prev) => ({
      ...prev,
      pageText: { ...prev.pageText, [field]: value },
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc]">
      <TopHeader />

      <main className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-4 lg:p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
                <Monitor className="text-[#3b82f6]" size={24} />
                Computer Center Settings
              </h1>
              <p className="text-sm text-[#64748b] mt-1">
                Manage the courses and teachers displayed on the Computer Center page.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {notification && (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-fade-in">
                  {notification}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="flex items-center gap-2 px-6 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-max mb-6">
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'courses' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Computer Courses
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'teachers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Our Teachers
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
            {activeTab === 'courses' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#0f172a]">Computer Courses ({courses.length})</h3>
                <button
                  onClick={addCourse}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-xs font-semibold transition-colors"
                >
                  <Plus size={14} /> Add Course
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course, idx) => (
                  <div key={course.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-white">
                      <span className="font-semibold text-sm text-blue-600">Course {idx + 1}</span>
                      <button
                        onClick={() => removeCourse(idx)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Image Preview */}
                    <div className="h-40 bg-slate-100 relative group overflow-hidden border-b border-slate-100">
                      {course.image ? (
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-40 mix-blend-multiply`}></div>
                    </div>

                    {/* Form Fields */}
                    <div className="p-4 flex flex-col gap-4 flex-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">HEADING</label>
                        <input
                          type="text"
                          value={course.title}
                          onChange={(e) => updateCourse(idx, 'title', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">SUBTITLE</label>
                        <textarea
                          value={course.fullName}
                          onChange={(e) => updateCourse(idx, 'fullName', e.target.value)}
                          className={`${inputClass} resize-none h-16`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">DURATION</label>
                          <input
                            type="text"
                            value={course.duration}
                            onChange={(e) => updateCourse(idx, 'duration', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">FEE (₹)</label>
                          <input
                            type="text"
                            value={course.fee}
                            onChange={(e) => updateCourse(idx, 'fee', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">COLOR GRADIENT</label>
                        <input
                          type="text"
                          value={course.color}
                          onChange={(e) => updateCourse(idx, 'color', e.target.value)}
                          className={inputClass}
                          placeholder="from-... to-..."
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">IMAGE URL</label>
                        <input
                          type="text"
                          value={course.image || ''}
                          onChange={(e) => updateCourse(idx, 'image', e.target.value)}
                          className={inputClass}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white border border-slate-200 border-dashed rounded-xl text-slate-500 text-sm">
                    No courses added yet. Click "Add Course" to create one.
                  </div>
                )}
              </div>
            </motion.div>
            )}

            {activeTab === 'teachers' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-6"
              >
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                  <p className="text-sm text-yellow-800 font-medium">
                    <strong>Storage Saving Tip:</strong> To save server storage space, please use direct image URLs (e.g., from Unsplash, Google Drive, LinkedIn) instead of uploading images directly.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className={labelClass}>Section Title</label>
                    <input
                      className={inputClass}
                      value={content.pageText.teacherTitle || ''}
                      onChange={(e) => updatePageText('teacherTitle', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Section Subtitle</label>
                    <input
                      className={inputClass}
                      value={content.pageText.teacherSubtitle || ''}
                      onChange={(e) => updatePageText('teacherSubtitle', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#0f172a]">Teacher Profiles</h3>
                  {(content.computerCenterTeachers?.length || 0) < 6 && (
                    <button
                      type="button"
                      onClick={() =>
                        setContent((prev) => ({
                          ...prev,
                          computerCenterTeachers: [
                            ...(prev.computerCenterTeachers || []),
                            {
                              id: nextItemId(prev.computerCenterTeachers || []),
                              photo: DEFAULT_FACULTY_PHOTO_URL,
                              name: 'New Teacher',
                              role: 'Role / Designation',
                              detail: 'Short detail about this teacher.',
                            },
                          ],
                        }))
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-xs font-semibold transition-colors"
                    >
                      <Plus size={14} /> Add Profile
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {(content.computerCenterTeachers || []).map((member, index) => (
                    <div key={member.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col p-4">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                        <span className="font-semibold text-sm text-blue-600">Profile {index + 1}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setContent((prev) => ({
                              ...prev,
                              computerCenterTeachers: (prev.computerCenterTeachers || []).filter((item) => item.id !== member.id),
                            }))
                          }
                          disabled={(content.computerCenterTeachers || []).length <= 1}
                          className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="h-32 bg-slate-100 rounded-lg relative group overflow-hidden border border-slate-200 mb-3 flex items-center justify-center">
                        {member.photo?.trim() ? (
                          <img
                            src={member.photo}
                            alt={member.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-xs text-slate-400">No photo preview</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 flex-1">
                        <div>
                          <label className={labelClass}>Photo URL</label>
                          <input
                            className={inputClass}
                            value={member.photo}
                            onChange={(e) => {
                              const photo = e.target.value;
                              setContent((prev) => {
                                const computerCenterTeachers = [...(prev.computerCenterTeachers || [])];
                                computerCenterTeachers[index] = { ...member, photo };
                                return { ...prev, computerCenterTeachers };
                              });
                            }}
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Name</label>
                          <input
                            className={inputClass}
                            value={member.name}
                            onChange={(e) => {
                              const name = e.target.value;
                              setContent((prev) => {
                                const computerCenterTeachers = [...(prev.computerCenterTeachers || [])];
                                computerCenterTeachers[index] = { ...member, name };
                                return { ...prev, computerCenterTeachers };
                              });
                            }}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Role / Designation</label>
                          <input
                            className={inputClass}
                            value={member.role}
                            onChange={(e) => {
                              const role = e.target.value;
                              setContent((prev) => {
                                const computerCenterTeachers = [...(prev.computerCenterTeachers || [])];
                                computerCenterTeachers[index] = { ...member, role };
                                return { ...prev, computerCenterTeachers };
                              });
                            }}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Detail</label>
                          <textarea
                            className={`${inputClass} resize-none`}
                            rows={2}
                            value={member.detail}
                            onChange={(e) => {
                              const detail = e.target.value;
                              setContent((prev) => {
                                const computerCenterTeachers = [...(prev.computerCenterTeachers || [])];
                                computerCenterTeachers[index] = { ...member, detail };
                                return { ...prev, computerCenterTeachers };
                              });
                            }}
                            placeholder="Short detail..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
