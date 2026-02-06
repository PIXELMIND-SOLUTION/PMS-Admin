// src/components/EditStaff.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MdArrowBack, MdDelete, MdUpload } from 'react-icons/md';
import { FaUserTie, FaIdCard, FaPhone, FaEnvelope, FaBriefcase, FaCalendarAlt, FaChartLine, FaTint, FaLock } from 'react-icons/fa';

const EditStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    staffId: '',
    staffName: '',
    mobileNumber: '',
    email: '',
    role: '',
    joiningDate: '',
    experience: '',
    bloodGroup: '',
    password: '',
    isActive: true
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [existingData, setExistingData] = useState({
    profileImage: '',
    documents: []
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const roles = [
    'CEO', 'HR', 'Backend Developer', 'Frontend Developer', 
    'Full Stack Developer', 'Project Manager', 'Designer',
    'QA Engineer', 'DevOps Engineer', 'Team Lead', 'Tester', 'Digital Marketing'
  ];

  useEffect(() => {
    fetchStaff();
  }, [id]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://31.97.206.144:5000/api/staff/${id}`);
      const data = await res.json();
      
      if (data.success) {
        const staff = data.data;
        setFormData({
          staffId: staff.staffId || '',
          staffName: staff.staffName || '',
          mobileNumber: staff.mobileNumber || '',
          email: staff.email || '',
          role: staff.role || '',
          joiningDate: staff.joiningDate ? staff.joiningDate.split('T')[0] : '',
          experience: staff.experience || '',
          bloodGroup: staff.bloodGroup || '',
          password: '', // Don't pre-fill password
          isActive: staff.isActive !== undefined ? staff.isActive : true
        });
        
        setExistingData({
          profileImage: staff.profileImage || '',
          documents: staff.documents || []
        });
        
        setProfilePreview(staff.profileImage || null);
      } else {
        setError('Failed to load staff data: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfileImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate image type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a valid image (JPG/PNG)');
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) { // 2MB limit for profile
      setError('Profile image size must be less than 2MB');
      return;
    }

    setError('');
    setProfileImage(selectedFile);

    // Generate preview
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDocumentsChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate files
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const validFiles = selectedFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        setError(`File ${file.name} is not a valid type. Please upload images, PDF, or DOC files.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`File ${file.name} exceeds 5MB size limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setError('');
      setDocuments(prev => [...prev, ...validFiles]);
    }
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingDocument = (index) => {
    setExistingData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    const formDataToSend = new FormData();
    
    // Append form data (only changed fields or all if needed)
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        formDataToSend.append(key, value);
      }
    });
    
    // Append profile image if changed
    if (profileImage) {
      formDataToSend.append('profileImage', profileImage);
    }
    
    // Append new documents
    documents.forEach(file => {
      formDataToSend.append('documents', file);
    });

    try {
      const response = await fetch(`http://31.97.206.144:5000/api/update_staff/${id}`, {
        method: 'PUT',
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Staff updated successfully!');
        setTimeout(() => navigate('/staff'), 2000);
      } else {
        setError(data.message || 'Failed to update staff');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-teal" style={{ color: '#009788' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading staff data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/staff" className="btn btn-outline-secondary btn-sm mb-2">
            <MdArrowBack className="me-1" />
            Back to Staff
          </Link>
          <h2 className="fw-bold mb-1" style={{ color: '#009788' }}>
            <FaUserTie className="me-2" />
            Edit Staff Member
          </h2>
          <p className="text-muted mb-0">Update staff information and documents</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success d-flex align-items-center" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {success}
        </div>
      )}

      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-white py-3 border-bottom">
              <h4 className="mb-0 fw-bold" style={{ color: '#009788' }}>
                <i className="fas fa-user-edit me-2"></i>
                Edit Staff Information
              </h4>
            </div>
            
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Profile Image Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-4 position-relative">
                        <div 
                          className="rounded-circle border d-flex align-items-center justify-content-center shadow-sm"
                          style={{
                            width: '120px',
                            height: '120px',
                            backgroundColor: '#f8f9fa',
                            overflow: 'hidden'
                          }}
                        >
                          {profilePreview ? (
                            <img 
                              src={profilePreview} 
                              alt="Profile Preview" 
                              className="w-100 h-100 object-fit-cover"
                            />
                          ) : (
                            <FaUserTie className="text-muted" style={{ fontSize: '3rem' }} />
                          )}
                        </div>
                        {profilePreview && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute rounded-circle"
                            style={{ top: '-5px', right: '-5px' }}
                            onClick={() => {
                              setProfileImage(null);
                              setProfilePreview(existingData.profileImage);
                            }}
                          >
                            <MdDelete size={12} />
                          </button>
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <label htmlFor="profileImage" className="form-label fw-semibold">
                          Profile Image
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          id="profileImage"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                        />
                        <div className="form-text">
                          Accepted: JPG, PNG (Max 2MB). Leave empty to keep current image.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="fw-bold text-teal mb-3 border-bottom pb-2">
                      <i className="fas fa-info-circle me-2"></i>
                      Basic Information
                    </h5>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="staffId" className="form-label fw-semibold">
                      <FaIdCard className="me-2" />
                      Staff ID *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="staffId"
                      name="staffId"
                      value={formData.staffId}
                      onChange={handleChange}
                      required
                      placeholder="Enter unique staff ID"
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="staffName" className="form-label fw-semibold">
                      <FaUserTie className="me-2" />
                      Staff Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="staffName"
                      name="staffName"
                      value={formData.staffName}
                      onChange={handleChange}
                      required
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="fw-bold text-teal mb-3 border-bottom pb-2">
                      <i className="fas fa-address-card me-2"></i>
                      Contact Information
                    </h5>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="mobileNumber" className="form-label fw-semibold">
                      <FaPhone className="me-2" />
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      required
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      <FaEnvelope className="me-2" />
                      Email *
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                {/* Role & Employment Details */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="fw-bold text-teal mb-3 border-bottom pb-2">
                      <i className="fas fa-briefcase me-2"></i>
                      Employment Details
                    </h5>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="role" className="form-label fw-semibold">
                      <FaBriefcase className="me-2" />
                      Role *
                    </label>
                    <select
                      className="form-select"
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="joiningDate" className="form-label fw-semibold">
                      <FaCalendarAlt className="me-2" />
                      Joining Date *
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="joiningDate"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="experience" className="form-label fw-semibold">
                      <FaChartLine className="me-2" />
                      Experience (Years) *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      required
                      min="0"
                      max="50"
                      step="0.1"
                      placeholder="Years of experience"
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="bloodGroup" className="form-label fw-semibold">
                      <FaTint className="me-2" />
                      Blood Group
                    </label>
                    <select
                      className="form-select"
                      id="bloodGroup"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Security & Status */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="fw-bold text-teal mb-3 border-bottom pb-2">
                      <i className="fas fa-shield-alt me-2"></i>
                      Security & Status
                    </h5>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">
                      <FaLock className="me-2" />
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Leave blank to keep current password"
                    />
                    <div className="form-text">
                      Only enter if you want to change the password
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold d-block">Status</label>
                    <div className="form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        style={{ 
                          backgroundColor: formData.isActive ? '#009788' : '',
                          borderColor: '#009788'
                        }}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="isActive">
                        {formData.isActive ? (
                          <span className="text-success">Active Staff Member</span>
                        ) : (
                          <span className="text-danger">Inactive Staff Member</span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="mb-4">
                  <h5 className="fw-bold text-teal mb-3 border-bottom pb-2">
                    <i className="fas fa-file-alt me-2"></i>
                    Documents & Files
                  </h5>

                  {/* Existing Documents */}
                  {existingData.documents.length > 0 && (
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Current Documents</label>
                      <div className="d-flex flex-wrap gap-3">
                        {existingData.documents.map((doc, index) => (
                          <div key={index} className="position-relative">
                            {doc.toLowerCase().endsWith('.pdf') ? (
                              <div 
                                className="border rounded p-3 text-center bg-light"
                                style={{ width: '120px', height: '120px' }}
                              >
                                <i className="fas fa-file-pdf text-danger fa-2x mb-2"></i>
                                <br />
                                <small className="text-muted">PDF Document</small>
                              </div>
                            ) : doc.toLowerCase().includes('.doc') ? (
                              <div 
                                className="border rounded p-3 text-center bg-light"
                                style={{ width: '120px', height: '120px' }}
                              >
                                <i className="fas fa-file-word text-primary fa-2x mb-2"></i>
                                <br />
                                <small className="text-muted">Word Document</small>
                              </div>
                            ) : (
                              <img
                                src={doc}
                                alt={`Document ${index + 1}`}
                                className="rounded border shadow-sm"
                                style={{
                                  width: '120px',
                                  height: '120px',
                                  objectFit: 'cover'
                                }}
                              />
                            )}
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute rounded-circle"
                              style={{ top: '-5px', right: '-5px' }}
                              onClick={() => removeExistingDocument(index)}
                              title="Remove document"
                            >
                              <MdDelete size={12} />
                            </button>
                            <a 
                              href={doc} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-primary btn-sm mt-1 w-100"
                            >
                              View
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Documents Upload */}
                  <div>
                    <label htmlFor="documents" className="form-label fw-semibold">
                      <MdUpload className="me-2" />
                      Add New Documents
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="documents"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleDocumentsChange}
                    />
                    <div className="form-text">
                      Accepted: JPG, PNG, PDF, DOC, DOCX (Max 5MB per file)
                    </div>

                    {/* New Documents Preview */}
                    {documents.length > 0 && (
                      <div className="mt-3">
                        <h6 className="fw-semibold mb-2">New Documents to Upload:</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {documents.map((file, index) => (
                            <div 
                              key={index}
                              className="border rounded p-2 d-flex align-items-center bg-light"
                            >
                              <i className="fas fa-file me-2 text-primary"></i>
                              <span className="small text-truncate" style={{ maxWidth: '150px' }}>
                                {file.name}
                              </span>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger ms-2"
                                onClick={() => removeDocument(index)}
                              >
                                <MdDelete size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="d-flex gap-3 pt-4 border-top">
                  <button
                    type="submit"
                    className="btn text-white fw-semibold px-4 py-2 shadow-sm"
                    style={{ 
                      backgroundColor: '#009788',
                      borderRadius: '8px',
                      minWidth: '140px'
                    }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Updating...</span>
                        </div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Update Staff
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4 py-2"
                    onClick={() => navigate('/staff')}
                  >
                    <i className="fas fa-times me-2"></i>
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-teal px-4 py-2 ms-auto"
                    onClick={fetchStaff}
                  >
                    <i className="fas fa-sync-alt me-2"></i>
                    Reset Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add CSS for custom colors
const styles = `
  .text-teal { color: #009788 !important; }
  .btn-outline-teal {
    color: #009788;
    border-color: #009788;
  }
  .btn-outline-teal:hover {
    background-color: #009788;
    color: white;
  }
  .form-check-input:checked {
    background-color: #009788;
    border-color: #009788;
  }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default EditStaff;