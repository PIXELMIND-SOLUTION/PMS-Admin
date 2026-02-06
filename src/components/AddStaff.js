// src/components/AddStaff.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddStaff = () => {
  const [formData, setFormData] = useState({
    staffId: '',
    staffName: '',
    mobileNumber: '',
    email: '',
    role: '',
    joiningDate: '',
    experience: '',
    bloodGroup: '',
    password: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [profilePreview, setProfilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const roles = [
    'CEO', 'HR', 'Backend Developer', 'Frontend Developer', 
    'Full Stack Developer', 'Project Manager', 'Designer', 
    'QA Engineer', 'DevOps Engineer', 'Team Lead'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setProfileImage(null);
      setProfilePreview(null);
      return;
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileImage) {
      setError('Please upload a profile image');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formDataToSend = new FormData();
    
    // Append form data
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    
    // Append profile image
    formDataToSend.append('profileImage', profileImage);
    
    // Append documents
    documents.forEach(file => {
      formDataToSend.append('documents', file);
    });

    try {
      const response = await fetch('http://31.97.206.144:5000/api/create_staff', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Staff added successfully!');
        setTimeout(() => navigate('/staff'), 2000);
      } else {
        setError(data.message || 'Failed to add staff');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#009788' }}>Add New Staff</h2>
          <p className="text-muted mb-0">Create a new staff member profile</p>
        </div>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/staff')}
        >
          ← Back to Staff
        </button>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-white py-3 border-bottom">
              <h4 className="mb-0 fw-bold" style={{ color: '#009788' }}>
                <i className="fas fa-user-plus me-2"></i>
                Staff Information
              </h4>
            </div>
            
            <div className="card-body p-4">
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

              <form onSubmit={handleSubmit}>
                {/* Profile Image Upload */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-4">
                        <div 
                          className="rounded-circle border d-flex align-items-center justify-content-center"
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
                            <i className="fas fa-user text-muted" style={{ fontSize: '3rem' }}></i>
                          )}
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <label htmlFor="profileImage" className="form-label fw-semibold">
                          Profile Image *
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          id="profileImage"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          required
                        />
                        <div className="form-text">
                          Accepted: JPG, PNG (Max 2MB)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="staffId" className="form-label fw-semibold">
                      <i className="fas fa-id-card me-2"></i>
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
                      <i className="fas fa-user me-2"></i>
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
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="mobileNumber" className="form-label fw-semibold">
                      <i className="fas fa-phone me-2"></i>
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
                      <i className="fas fa-envelope me-2"></i>
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

                {/* Role and Joining Date */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="role" className="form-label fw-semibold">
                      <i className="fas fa-briefcase me-2"></i>
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
                      <i className="fas fa-calendar-alt me-2"></i>
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
                </div>

                {/* Experience and Blood Group */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="experience" className="form-label fw-semibold">
                      <i className="fas fa-chart-line me-2"></i>
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
                      <i className="fas fa-tint me-2"></i>
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

                {/* Password */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">
                      <i className="fas fa-lock me-2"></i>
                      Password *
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Create password"
                    />
                  </div>
                </div>

                {/* Documents Upload */}
                <div className="mb-4">
                  <label htmlFor="documents" className="form-label fw-semibold">
                    <i className="fas fa-file-upload me-2"></i>
                    Upload Documents
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

                  {/* Documents Preview */}
                  {documents.length > 0 && (
                    <div className="mt-3">
                      <h6 className="fw-semibold mb-2">Selected Documents:</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {documents.map((file, index) => (
                          <div 
                            key={index}
                            className="border rounded p-2 d-flex align-items-center"
                            style={{ backgroundColor: '#f8f9fa' }}
                          >
                            <i className="fas fa-file me-2 text-primary"></i>
                            <span className="small">{file.name}</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger ms-2"
                              onClick={() => removeDocument(index)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="d-flex gap-3 pt-3 border-top">
                  <button
                    type="submit"
                    className="btn text-white fw-semibold px-4 py-2"
                    style={{ backgroundColor: '#009788' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Adding Staff...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Add Staff
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
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStaff;