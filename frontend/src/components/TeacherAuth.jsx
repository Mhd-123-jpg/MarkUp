import React, { useState } from 'react';
import { IconCheck, IconClose } from './Icons';

export const TeacherAuth = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('signin'); // 'signin', 'signup', 'forgot'
  
  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpDept, setSignUpDept] = useState('Computer Science & Engineering');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      alert("Please fill in both Email ID and Password.");
      return;
    }
    
    // Create teacher session object
    const nameFromEmail = signInEmail.split('@')[0].replace('.', ' ');
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    
    const user = {
      name: formattedName.length > 2 ? `Prof. ${formattedName}` : 'Faculty Teacher',
      email: signInEmail,
      department: 'Computer Science (MITS)'
    };

    if (rememberMe) {
      localStorage.setItem('markup_teacher_user', JSON.stringify(user));
    }
    onLoginSuccess(user);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword) {
      alert("Please fill in all required fields.");
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      alert("Passwords do not match. Please re-enter your password.");
      return;
    }

    const user = {
      name: signUpName.startsWith('Prof') || signUpName.startsWith('Dr') ? signUpName : `Prof. ${signUpName}`,
      email: signUpEmail,
      department: signUpDept
    };

    localStorage.setItem('markup_teacher_user', JSON.stringify(user));
    alert("Teacher Account Created Successfully! Welcome to Mark-UP.");
    onLoginSuccess(user);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      alert("Please enter your MITS Email ID.");
      return;
    }
    setResetSent(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F7F5F5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      {/* Background Accent Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        backgroundColor: '#C8102E'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(200, 16, 46, 0.12)',
        border: '1px solid #E5E0E0',
        overflow: 'hidden'
      }} className="animate-slide-up">

        {/* Card Header with MITS Crimson Brand */}
        <div style={{
          backgroundColor: '#C8102E',
          color: 'white',
          padding: '28px 24px 20px 24px',
          textAlign: 'center',
          borderBottom: '3px solid #A60D25'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            color: '#C8102E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '1.75rem',
            margin: '0 auto 12px auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontFamily: 'Outfit, sans-serif'
          }}>
            M
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.5px' }}>
            Mark-UP <span style={{ fontSize: '0.75rem', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '999px', verticalAlign: 'middle' }}>MITS</span>
          </h1>
          <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '4px' }}>
            MITS Faculty Answer Booklet Evaluation Portal
          </p>
        </div>

        {/* Mode Selector Tabs (Sign In / Sign Up) */}
        {mode !== 'forgot' && (
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #E5E0E0',
            backgroundColor: '#FAFAFA'
          }}>
            <button
              onClick={() => setMode('signin')}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '0.92rem',
                fontWeight: '700',
                color: mode === 'signin' ? '#C8102E' : '#666666',
                borderBottom: mode === 'signin' ? '3px solid #C8102E' : '3px solid transparent',
                backgroundColor: mode === 'signin' ? '#FFFFFF' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '0.92rem',
                fontWeight: '700',
                color: mode === 'signup' ? '#C8102E' : '#666666',
                borderBottom: mode === 'signup' ? '3px solid #C8102E' : '3px solid transparent',
                backgroundColor: mode === 'signup' ? '#FFFFFF' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        <div style={{ padding: '28px 24px' }}>

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1A1A1A', display: 'block', marginBottom: '6px' }}>
                  Faculty Email ID <span style={{ color: '#C8102E' }}>*</span>
                </label>
                <input
                  type="email"
                  className="input-field"
                  style={{ fontSize: '0.95rem' }}
                  value={signInEmail}
                  onChange={e => setSignInEmail(e.target.value)}
                  placeholder="e.g. teacher@mits.ac.in"
                  required
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1A1A1A' }}>
                    Password <span style={{ color: '#C8102E' }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    style={{ fontSize: '0.8rem', color: '#C8102E', fontWeight: '600' }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    style={{ fontSize: '0.95rem', paddingRight: '42px' }}
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.78rem',
                      color: '#666',
                      fontWeight: '600'
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#C8102E', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '0.85rem', color: '#555555', cursor: 'pointer' }}>
                  Remember me on this device
                </label>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem', marginTop: '6px' }}
              >
                Sign In to Mark-UP
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1A1A1A', display: 'block', marginBottom: '6px' }}>
                  Full Name <span style={{ color: '#C8102E' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  style={{ fontSize: '0.95rem' }}
                  value={signUpName}
                  onChange={e => setSignUpName(e.target.value)}
                  placeholder="e.g. Dr. Ananya Nair"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1A1A1A', display: 'block', marginBottom: '6px' }}>
                  MITS Email ID <span style={{ color: '#C8102E' }}>*</span>
                </label>
                <input
                  type="email"
                  className="input-field"
                  style={{ fontSize: '0.95rem' }}
                  value={signUpEmail}
                  onChange={e => setSignUpEmail(e.target.value)}
                  placeholder="e.g. ananya@mits.ac.in"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1A1A1A', display: 'block', marginBottom: '6px' }}>
                  Department / Branch
                </label>
                <select
                  className="input-field"
                  style={{ fontSize: '0.95rem' }}
                  value={signUpDept}
                  onChange={e => setSignUpDept(e.target.value)}
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science (AI & DS)</option>
                  <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                  <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
                  <option value="Civil Engineering">Civil Engineering (CE)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1A1A1A', display: 'block', marginBottom: '6px' }}>
                  Password <span style={{ color: '#C8102E' }}>*</span>
                </label>
                <input
                  type="password"
                  className="input-field"
                  style={{ fontSize: '0.95rem' }}
                  value={signUpPassword}
                  onChange={e => setSignUpPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1A1A1A', display: 'block', marginBottom: '6px' }}>
                  Confirm Password <span style={{ color: '#C8102E' }}>*</span>
                </label>
                <input
                  type="password"
                  className="input-field"
                  style={{ fontSize: '0.95rem' }}
                  value={signUpConfirmPassword}
                  onChange={e => setSignUpConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem', marginTop: '6px' }}
              >
                Create Teacher Account
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1A1A1A' }}>
                  Reset Teacher Password
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#666666', marginTop: '4px' }}>
                  Enter your registered MITS email address and we'll send you a password reset link.
                </p>
              </div>

              {resetSent ? (
                <div style={{
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #6EE7B7',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  color: '#065F46'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px auto'
                  }}>
                    <IconCheck className="w-6 h-6" />
                  </div>
                  <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>Reset Link Sent!</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                    Check your inbox at <strong>{forgotEmail}</strong> for instructions to reset your password.
                  </p>
                  <button
                    onClick={() => { setResetSent(false); setMode('signin'); }}
                    className="btn-secondary"
                    style={{ marginTop: '16px', fontSize: '0.85rem' }}
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1A1A1A', display: 'block', marginBottom: '6px' }}>
                      MITS Email ID <span style={{ color: '#C8102E' }}>*</span>
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      style={{ fontSize: '0.95rem' }}
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="e.g. teacher@mits.ac.in"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem' }}
                  >
                    Send Reset Link
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    style={{ fontSize: '0.88rem', color: '#666666', fontWeight: '600', marginTop: '4px' }}
                  >
                    ← Back to Sign In
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Download Android APK Button */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #E5E0E0', textAlign: 'center' }}>
            <a
              href="/api/download-apk"
              className="btn-outline-red"
              style={{ fontSize: '0.85rem', width: '100%', justifyContent: 'center', textDecoration: 'none' }}
              download
            >
              📲 Download Android App (.apk)
            </a>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: '#FAFAFA',
          borderTop: '1px solid #E5E0E0',
          padding: '14px 24px',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: '#888888'
        }}>
          Muthoot Institute of Technology & Science • Internal Evaluation System
        </div>

      </div>
    </div>
  );
};
