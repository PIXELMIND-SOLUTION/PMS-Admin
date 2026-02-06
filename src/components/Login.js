import React, { useState } from 'react';
import { MdVisibility, MdVisibilityOff, MdEmail, MdLock } from 'react-icons/md';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) return;

    setLoading(true);
    try {
      const response = await fetch('http://31.97.206.144:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: 'SuperAdmin',
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store admin details and password in sessionStorage
        const adminDetails = {
          adminName: data.data.adminName,
          email: data.data.email,
          adminId: data.data._id,
          password: formData.password // store typed password
        };
        sessionStorage.setItem('adminDetails', JSON.stringify(adminDetails));
        onLogin();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#f8f9fa',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .premium-input {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid #e8eef5;
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 16px;
          transition: all 0.3s ease;
          width: 100%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .premium-input:focus {
          outline: none;
          border-color: #008b8b;
          box-shadow: 0 8px 24px rgba(0, 139, 139, 0.15);
          background: white;
        }

        .premium-button {
          background: linear-gradient(135deg, #008b8b 0%, #006666 100%);
          border: none;
          color: white;
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 20px rgba(0, 139, 139, 0.25);
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .premium-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0, 139, 139, 0.35);
        }

        .premium-button:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .premium-button:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .loader {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-banner {
          background: linear-gradient(135deg, #fee8e8 0%, #fde4e8 100%);
          border-left: 4px solid #f44336;
          padding: 16px;
          border-radius: 8px;
          color: #c62828;
          font-size: 14px;
          font-weight: 500;
          animation: slideInRight 0.3s ease;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .checkbox-custom {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #008b8b;
        }

        form input:-webkit-autofill,
        form input:-webkit-autofill:hover,
        form input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
          box-shadow: 0 0 0 1000px white inset !important;
        }
      `}</style>

      {/* Left Side: Login Form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(20px, 5vw, 60px)',
          minHeight: '100vh'
        }}
      >
        {/* Logo for Mobile */}
        <div style={{ display: 'none' }} className="d-md-none mb-4">
          <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeInUp 0.8s ease' }}>
            <img
              src="/logo1.png"
              alt="Company Logo"
              style={{ width: '140px', height: 'auto', objectFit: 'contain' }}
            />
          </div>
        </div>

        <div style={{
          width: '100%',
          maxWidth: '420px',
          animation: 'fadeInUp 0.6s ease'
        }}>
          {/* Header */}
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '12px',
              letterSpacing: '-0.5px'
            }}>
              Welcome Back
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '400',
              margin: 0
            }}>
              Sign in to manage your projects efficiently
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-banner">
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            {/* Email Field */}
            <div style={{ marginBottom: '24px', animation: 'fadeInUp 0.7s ease', animationFillMode: 'backwards' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }} htmlFor="email">
                Email Address
              </label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <MdEmail style={{
                  position: 'absolute',
                  left: '16px',
                  color: focusedField === 'email' ? '#008b8b' : '#9ca3af',
                  fontSize: '18px',
                  transition: 'all 0.3s ease',
                  pointerEvents: 'none'
                }} />
                <input
                  type="email"
                  className="premium-input"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="your@email.com"
                  style={{
                    paddingLeft: '45px',
                    fontSize: '15px'
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '24px', animation: 'fadeInUp 0.8s ease', animationFillMode: 'backwards' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }} htmlFor="password">
                Password
              </label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <MdLock style={{
                  position: 'absolute',
                  left: '16px',
                  color: focusedField === 'password' ? '#008b8b' : '#9ca3af',
                  fontSize: '18px',
                  transition: 'all 0.3s ease',
                  pointerEvents: 'none'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="premium-input"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="••••••••"
                  style={{
                    paddingLeft: '45px',
                    paddingRight: '45px',
                    fontSize: '15',
                    letterSpacing: '0.15em'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#008b8b'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
              fontSize: '14px',
              animation: 'fadeInUp 0.9s ease',
              animationFillMode: 'backwards'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                <input
                  type="checkbox"
                  className="checkbox-custom"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                Remember me
              </label>
              <a href="#" style={{
                color: '#008b8b',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.7'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="premium-button"
              disabled={loading}
              style={{
                animation: 'fadeInUp 1s ease',
                animationFillMode: 'backwards'
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="loader"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Signup Link */}
            <p style={{
              textAlign: 'center',
              marginTop: '24px',
              fontSize: '14px',
              color: '#6b7280',
              animation: 'fadeInUp 1.1s ease',
              animationFillMode: 'backwards'
            }}>
              Don't have an account? <a href="#" style={{
                color: '#008b8b',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.7'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Contact support
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side: Decorative Background */}
      <div
        style={{
          flex: 1,
          backgroundImage: 'linear-gradient(135deg, #008b8b 0%, #005555 50%, #001a1a 100%)',
          position: 'relative',
          display: 'none',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          '@media (min-width: 768px)': {
            display: 'flex'
          }
        }}
        className="d-none d-md-flex"
      >
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 165, 0, 0.1)',
          top: '-100px',
          right: '-100px',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>

        <div style={{
          position: 'absolute',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          backgroundColor: 'rgba(64, 224, 208, 0.1)',
          bottom: '-80px',
          left: '-80px',
          animation: 'pulse 5s ease-in-out infinite 1s'
        }}></div>

        <div style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 255, 200, 0.08)',
          top: '20%',
          right: '10%',
          animation: 'pulse 6s ease-in-out infinite 2s'
        }}></div>

        {/* Centered Logo with Shadow */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          width: '200px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'slideInRight 0.8s ease'
        }}>
          <img
            src="/logo.png"
            alt="Company Logo"
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          />
        </div>

        {/* Tagline */}
        <p style={{
          position: 'absolute',
          bottom: '60px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '16px',
          textAlign: 'center',
          fontWeight: '300',
          letterSpacing: '1px',
          animation: 'fadeInUp 0.8s ease 0.3s backwards'
        }}>
          Manage Your Projects Like Never Before
        </p>
      </div>
    </div>
  );
};

export default Login;
