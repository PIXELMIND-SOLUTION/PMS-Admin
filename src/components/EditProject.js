// src/components/EditProject.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    projectid: '',
    projectname: '',
    clientname: '',
    mobilenumber: '',
    email: '',
    selectcategory: 'website',
    startDate: '',
    projectHandoverDate: '',
    deadlineDate: '',
    projectCost: '',
    milestone: '',
    teamMembers: {
      frontend: [],
      backend: [],
      designer: [],
      tester: [],
      manager: []
    },
    status: 'active',
    milestonePayments: []
  });
  
  const [file, setFile] = useState(null);
  const [quotationFile, setQuotationFile] = useState(null);
  const [existingFiles, setExistingFiles] = useState({
    uploadfile: null,
    quotationfile: null
  });
  const [teamMemberInputs, setTeamMemberInputs] = useState({
    frontend: '',
    backend: '',
    designer: '',
    tester: '',
    manager: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`http://31.97.206.144:5000/api/project/${id}`);
      const data = await res.json();
      
      if (data.success) {
        const project = data.data;
        
        // Format dates for input fields
        const formatDate = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };

        setFormData({
          projectid: project.projectid || '',
          projectname: project.projectname || '',
          clientname: project.clientname || '',
          mobilenumber: project.mobilenumber || '',
          email: project.email || '',
          selectcategory: project.selectcategory || 'website',
          startDate: formatDate(project.startDate),
          projectHandoverDate: formatDate(project.projectHandoverDate),
          deadlineDate: formatDate(project.deadlineDate),
          projectCost: project.projectCost || '',
          milestone: project.milestone || '',
          teamMembers: project.teamMembers || {
            frontend: [], backend: [], designer: [], tester: [], manager: []
          },
          status: project.status || 'active',
          milestonePayments: project.milestonePayments || []
        });

        setExistingFiles({
          uploadfile: project.uploadfile,
          quotationfile: project.quotationfile
        });

        console.log('✅ Project loaded:', project);
      } else {
        setError('Failed to load project');
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError('Network error while loading project');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTeamMemberInputChange = (role, value) => {
    setTeamMemberInputs(prev => ({
      ...prev,
      [role]: value
    }));
  };

  const addTeamMember = (role) => {
    const memberName = teamMemberInputs[role].trim();
    if (memberName && !formData.teamMembers[role].includes(memberName)) {
      setFormData(prev => ({
        ...prev,
        teamMembers: {
          ...prev.teamMembers,
          [role]: [...prev.teamMembers[role], memberName]
        }
      }));
      setTeamMemberInputs(prev => ({
        ...prev,
        [role]: ''
      }));
    }
  };

  const removeTeamMember = (role, index) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: {
        ...prev.teamMembers,
        [role]: prev.teamMembers[role].filter((_, i) => i !== index)
      }
    }));
  };

  // Handle milestone payment changes
  const handleMilestonePaymentChange = (index, field, value) => {
    setFormData(prev => {
      const updatedPayments = [...prev.milestonePayments];
      
      if (!updatedPayments[index]) {
        updatedPayments[index] = { amount: '', description: '', paymentMode: '' };
      }
      
      updatedPayments[index] = {
        ...updatedPayments[index],
        [field]: value
      };
      
      return {
        ...prev,
        milestonePayments: updatedPayments
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Filter out empty team member arrays
      const filteredTeamMembers = Object.fromEntries(
        Object.entries(formData.teamMembers).filter(([_, value]) => value.length > 0)
      );

      // Filter out empty milestone payments
      const filteredMilestonePayments = formData.milestonePayments.filter(payment => 
        payment && (payment.amount || payment.description || payment.paymentMode)
      );

      // Create FormData
      const formDataToSend = new FormData();
      
      // Append all basic fields
      const fields = [
        'projectid', 'projectname', 'clientname', 'mobilenumber', 'email',
        'selectcategory', 'startDate', 'projectHandoverDate', 'deadlineDate',
        'projectCost', 'milestone', 'status'
      ];
      
      fields.forEach(field => {
        if (formData[field]) {
          formDataToSend.append(field, formData[field]);
        }
      });

      // Append teamMembers as JSON string
      if (Object.keys(filteredTeamMembers).length > 0) {
        formDataToSend.append('teamMembers', JSON.stringify(filteredTeamMembers));
      }

      // Append milestonePayments as JSON string
      if (filteredMilestonePayments.length > 0) {
        formDataToSend.append('milestonePayments', JSON.stringify(filteredMilestonePayments));
      }

      // Append files only if new files are selected
      if (file) {
        formDataToSend.append('uploadfile', file);
      }
      if (quotationFile) {
        formDataToSend.append('quotationfile', quotationFile);
      }

      // 🟢 DEBUG: Log FormData contents
      console.log('📤 Sending Update Data:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      const res = await fetch(`http://31.97.206.144:5000/api/project/${id}`, {
        method: 'PUT',
        body: formDataToSend
      });

      const data = await res.json();
      console.log('📨 Backend Response:', data);

      if (data.success) {
        setSuccess('Project updated successfully!');
        setTimeout(() => navigate('/projects'), 1500);
      } else {
        setError(data.message || 'Failed to update project');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate milestone options from 1 to 10
  const milestoneOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  // Check if project cost is filled to show milestone field
  const showMilestone = formData.projectCost !== '';

  // Generate milestone payment rows based on selected milestone
  const milestonePaymentRows = formData.milestone ? Array.from({ length: parseInt(formData.milestone) }, (_, i) => i) : [];

  const teamRoles = [
    { key: 'frontend', label: 'Frontend Developers' },
    { key: 'backend', label: 'Backend Developers' },
    { key: 'designer', label: 'Designers' },
    { key: 'tester', label: 'Testers' },
    { key: 'manager', label: 'Project Managers' }
  ];

  const paymentModes = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Credit Card', 'Debit Card'];

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border text-teal" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading project details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ color: '#009788' }}>Edit Project</h2>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate('/projects')}
        >
          ← Back to Projects
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom-2" style={{ borderColor: '#009788' }}>
          <h4 className="mb-0 fw-bold" style={{ color: '#009788' }}>Project Information</h4>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Project ID & Basic Info */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Project ID *</label>
                <input
                  type="text"
                  className="form-control"
                  name="projectid"
                  value={formData.projectid}
                  onChange={handleChange}
                  placeholder="Enter unique project ID"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Project Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="projectname"
                  value={formData.projectname}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  required
                />
              </div>
            </div>

            {/* Client Information */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Client Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="clientname"
                  value={formData.clientname}
                  onChange={handleChange}
                  placeholder="Enter client name"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Mobile Number *</label>
                <input
                  type="tel"
                  className="form-control"
                  name="mobilenumber"
                  value={formData.mobilenumber}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label fw-semibold">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            {/* Project Details */}
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Category *</label>
                <select
                  className="form-select"
                  name="selectcategory"
                  value={formData.selectcategory}
                  onChange={handleChange}
                  required
                >
                  <option value="website">Website</option>
                  <option value="mobile app">Mobile App</option>
                  <option value="digital market">Digital Marketing</option>
                  <option value="software">Software Development</option>
                  <option value="consulting">Consulting</option>
                </select>
              </div>
              
              {/* Milestone Field - Only shown when project cost is filled */}
              {showMilestone && (
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-semibold">Milestone *</label>
                  <select
                    className="form-select"
                    name="milestone"
                    value={formData.milestone}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Milestone</option>
                    {milestoneOptions.map(num => (
                      <option key={num} value={num.toString()}>
                        Milestone {num}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Status</label>
                <select
                  className="form-select"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="on hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Project Dates */}
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Start Date *</label>
                <input
                  type="date"
                  className="form-control"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Project Handover Date *</label>
                <input
                  type="date"
                  className="form-control"
                  name="projectHandoverDate"
                  value={formData.projectHandoverDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Deadline Date *</label>
                <input
                  type="date"
                  className="form-control"
                  name="deadlineDate"
                  value={formData.deadlineDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Financial Information */}
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label fw-semibold">Project Cost *</label>
                <input
                  type="number"
                  className="form-control"
                  name="projectCost"
                  value={formData.projectCost}
                  onChange={handleChange}
                  placeholder="Total project cost"
                  required
                  min="0"
                />
              </div>
            </div>

            {/* Milestone Payments Section */}
            {formData.milestone && milestonePaymentRows.length > 0 && (
              <div className="mb-4">
                <h5 className="fw-semibold mb-3" style={{ color: '#009788' }}>
                  Milestone Payments (Milestone {formData.milestone})
                </h5>
                
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Milestone #</th>
                        <th>Amount *</th>
                        <th>Description</th>
                        <th>Payment Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {milestonePaymentRows.map((_, index) => (
                        <tr key={index}>
                          <td className="align-middle">
                            <strong>Milestone {index + 1}</strong>
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Enter amount"
                              value={formData.milestonePayments[index]?.amount || ''}
                              onChange={(e) => handleMilestonePaymentChange(index, 'amount', e.target.value)}
                              min="0"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter description"
                              value={formData.milestonePayments[index]?.description || ''}
                              onChange={(e) => handleMilestonePaymentChange(index, 'description', e.target.value)}
                            />
                          </td>
                          <td>
                            <select
                              className="form-select"
                              value={formData.milestonePayments[index]?.paymentMode || ''}
                              onChange={(e) => handleMilestonePaymentChange(index, 'paymentMode', e.target.value)}
                            >
                              <option value="">Select Mode</option>
                              {paymentModes.map(mode => (
                                <option key={mode} value={mode}>{mode}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="form-text">
                  Note: You can fill any field in any row. Only filled fields will be saved.
                </div>
              </div>
            )}

            {/* Team Members Section - Manual Input */}
            <div className="mb-4">
              <h5 className="fw-semibold mb-3" style={{ color: '#009788' }}>Team Members</h5>
              
              <div className="row">
                {teamRoles.map(({ key, label }) => (
                  <div key={key} className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">{label}</label>
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Enter ${label.toLowerCase()} name`}
                        value={teamMemberInputs[key]}
                        onChange={(e) => handleTeamMemberInputChange(key, e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTeamMember(key))}
                      />
                      <button
                        type="button"
                        className="btn text-white"
                        style={{ backgroundColor: '#009788' }}
                        onClick={() => addTeamMember(key)}
                      >
                        Add
                      </button>
                    </div>
                    
                    {/* Display added team members for this role */}
                    {formData.teamMembers[key].length > 0 && (
                      <div className="mt-2">
                        <div className="d-flex flex-wrap gap-2">
                          {formData.teamMembers[key].map((member, index) => (
                            <span key={index} className="badge bg-primary d-flex align-items-center">
                              {member}
                              <button
                                type="button"
                                className="btn-close btn-close-white ms-2"
                                style={{ fontSize: '0.6rem' }}
                                onClick={() => removeTeamMember(key, index)}
                                aria-label="Remove"
                              />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* File Uploads */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Current Quotation File</label>
                <div>
                  {existingFiles.quotationfile ? (
                    <a 
                      href={existingFiles.quotationfile} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-success d-flex align-items-center gap-2 mb-2"
                    >
                      <i className="fas fa-file-pdf"></i>
                      View Current Quotation
                    </a>
                  ) : (
                    <span className="text-muted">No quotation file uploaded</span>
                  )}
                </div>
                <label className="form-label fw-semibold mt-2">Replace Quotation File (Optional)</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setQuotationFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                />
                <div className="form-text">Accepted formats: PDF, DOC, DOCX, XLS, XLSX</div>
              </div>
              
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Current Project File</label>
                <div>
                  {existingFiles.uploadfile ? (
                    <a 
                      href={existingFiles.uploadfile} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2 mb-2"
                    >
                      <i className="fas fa-file-image"></i>
                      View Current Project File
                    </a>
                  ) : (
                    <span className="text-muted">No project file uploaded</span>
                  )}
                </div>
                <label className="form-label fw-semibold mt-2">Replace Project File (Optional)</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept="image/*,.pdf,.doc,.docx,.zip,.rar"
                />
                <div className="form-text">Accepted formats: Images, PDF, DOC, DOCX, ZIP, RAR</div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="d-flex gap-2 pt-3 border-top">
              <button
                type="submit"
                className="btn text-white fw-semibold"
                style={{ backgroundColor: '#009788' }}
                disabled={submitting || (showMilestone && !formData.milestone)}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating Project...
                  </>
                ) : (
                  'Update Project'
                )}
              </button>
              
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/projects')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProject;