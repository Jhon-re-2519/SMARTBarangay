import React, { useState, useEffect, useRef } from 'react';
// 1. IMPORT YOUR MODEL (Adjust path as needed)
import { LoginModel } from '../Hooks/graphql/Login_model'; 
import './styles/Login_modal.css';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (token: string) => void; 
}

type ModalView = 
  | 'LOGIN' 
  | 'RECOVER_SELECT' 
  | 'RECOVER_EMAIL' 
  | 'RECOVER_PHONE' 
  | 'RECOVER_OTP' 
  | 'RECOVER_SUCCESS';

const Login_modal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState<ModalView>('LOGIN');
  
  // Data Inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // OWASP UI: Client-Side Rate Limit Tracking (Visual only, Model handles real enforcement)
  const [attempts, setAttempts] = useState(0); 
  const [isLocked, setIsLocked] = useState(false);

  // --- MEMORY LEAK PROTECTION ---
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // --- NAVIGATION ---
  const handleBack = () => {
    setError('');
    if (view === 'RECOVER_SELECT') setView('LOGIN');
    else if (view === 'RECOVER_EMAIL' || view === 'RECOVER_PHONE') setView('RECOVER_SELECT');
    else if (view === 'RECOVER_OTP') setView('RECOVER_PHONE');
  };

  // --- ACTION: SIGN IN ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Client-Side Lockout Check
    if (isLocked) {
      setError('Too many attempts. Please wait 30 seconds.');
      return;
    }

    if (!username || !password) {
      setError('Credentials are required.');
      return;
    }

    setLoading(true);

    try {
      // 2. CALL THE MODEL (Passes data to your secure endpoint)
      // Assuming LoginModel.authenticate returns { success: true, token: '...' }
      const response = await LoginModel.authenticate(username, password);

      if (!isMounted.current) return;

      if (response && response.token) {
        // Success
        setAttempts(0);
        setPassword(''); // OWASP: Clear sensitive memory
        onSuccess(response.token);
      } else {
        throw new Error('Authentication failed');
      }

    } catch (err: any) {
      if (!isMounted.current) return;
      
      // 3. HANDLE FAILURE SECURELY
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPassword(''); // Clear password immediately
      
      // OWASP: Generic Error (Don't reveal if User exists)
      setError('Invalid username or password.'); 

      // 4. TRIGGER LOCKOUT IF NEEDED
      if (newAttempts >= 5) {
        setIsLocked(true);
        setError('Too many failed attempts. Locked for 30s.');
        setTimeout(() => {
          if (isMounted.current) {
            setIsLocked(false);
            setAttempts(0);
            setError('');
          }
        }, 30000);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // --- ACTION: SEND EMAIL RESET ---
  const handleEmailRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await LoginModel.requestEmailReset(email);
      if (isMounted.current) setView('RECOVER_SUCCESS');
    } catch (err) {
      // Even if email not found, show success to prevent enumeration (OWASP)
      if (isMounted.current) setView('RECOVER_SUCCESS'); 
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // --- ACTION: SEND OTP ---
  const startPhoneRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await LoginModel.sendOtp(phone);
      if (isMounted.current) setView('RECOVER_OTP');
    } catch (err) {
      if (isMounted.current) setError('Failed to send OTP. Please check the number.');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // --- ACTION: VERIFY OTP ---
  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await LoginModel.verifyOtp(phone, otp);
      if (isMounted.current) setView('RECOVER_SUCCESS');
    } catch (err) {
      if (isMounted.current) {
        setError('Invalid OTP code.');
        setOtp(''); // Clear invalid input
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  return (
    <div className="LM_MODAL_OVERLAY" onClick={onClose}>
      <div className="LM_MODAL_CARD" onClick={(e) => e.stopPropagation()}>
        
        {/* Navigation */}
        {view !== 'LOGIN' && view !== 'RECOVER_SUCCESS' && (
          <button className="LM_BACK_LINK" onClick={handleBack}>
            <i className="fas fa-chevron-left"></i> Back
          </button>
        )}

        <button className="LM_CLOSE_BTN" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        {/* --- VIEW: LOGIN --- */}
        {view === 'LOGIN' && (
          <>
            <div className="LM_HEADER">
              <div className="LM_ICON"><i className="fas fa-user-shield"></i></div>
              <h2>Official Access</h2>
              <p>Enter your administrative credentials</p>
            </div>
            
            <form className="LM_FORM" onSubmit={handleSignIn}>
              {error && <div className="LM_ERROR_MSG">{error}</div>}
              
              <div className="LM_INPUT_GROUP">
                <label>Username</label>
                <div className="LM_INPUT_WRAPPER">
                  <i className="fas fa-user"></i>
                  <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    disabled={loading || isLocked}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="LM_INPUT_GROUP">
                <label>Password</label>
                <div className="LM_INPUT_WRAPPER">
                  <i className="fas fa-lock"></i>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    disabled={loading || isLocked}
                    autoComplete="current-password"
                  />
                  {/* FIXED EYE TOGGLE: Inside wrapper, using your CSS */}
                  <button 
                    type="button" 
                    className="LM_EYE_TOGGLE" 
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="LM_SUBMIT_BTN" 
                disabled={loading || isLocked}
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : isLocked ? 'Locked' : 'Authenticate'}
              </button>
              
              <button 
                type="button" 
                className="LM_FORGOT_LINK" 
                onClick={() => { setView('RECOVER_SELECT'); setError(''); }}
              >
                Forgot password?
              </button>
            </form>
          </>
        )}

        {/* --- VIEW: RECOVERY SELECTION --- */}
        {view === 'RECOVER_SELECT' && (
          <>
            <div className="LM_HEADER">
              <div className="LM_ICON"><i className="fas fa-key"></i></div>
              <h2>Account Recovery</h2>
              <p>Select your verification method</p>
            </div>
            <div className="LM_RECOVERY_OPTIONS">
              <button className="LM_RECOVERY_BTN" onClick={() => setView('RECOVER_EMAIL')}>
                <i className="fas fa-envelope"></i>
                <span>Recover via Email</span>
              </button>
              <button className="LM_RECOVERY_BTN" onClick={() => setView('RECOVER_PHONE')}>
                <i className="fas fa-mobile-alt"></i>
                <span>Recover via Phone Number</span>
              </button>
            </div>
          </>
        )}

        {/* --- VIEW: EMAIL RECOVERY --- */}
        {view === 'RECOVER_EMAIL' && (
          <form className="LM_FORM" onSubmit={handleEmailRecovery}>
            <div className="LM_HEADER">
              <h2>Email Recovery</h2>
              <p>Enter your registered email address.</p>
            </div>
            <div className="LM_INPUT_GROUP">
              <label>Email Address</label>
              <div className="LM_INPUT_WRAPPER">
                <i className="fas fa-at"></i>
                <input 
                  type="email" 
                  placeholder="admin@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <button className="LM_SUBMIT_BTN" disabled={loading}>
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {/* --- VIEW: PHONE RECOVERY --- */}
        {view === 'RECOVER_PHONE' && (
          <form className="LM_FORM" onSubmit={startPhoneRecovery}>
            <div className="LM_HEADER">
              <h2>Phone Verification</h2>
              <p>Enter your registered mobile number.</p>
            </div>
            {error && <div className="LM_ERROR_MSG">{error}</div>}
            <div className="LM_INPUT_GROUP">
              <label>Phone Number</label>
              <div className="LM_INPUT_WRAPPER">
                <i className="fas fa-phone"></i>
                <input 
                  type="tel" 
                  placeholder="09XXXXXXXXX" 
                  value={phone} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, ''); 
                    if (val.length <= 11) setPhone(val);
                  }} 
                  required 
                />
              </div>
            </div>
            <button className="LM_SUBMIT_BTN" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP Code'}
            </button>
          </form>
        )}

        {/* --- VIEW: OTP INPUT --- */}
        {view === 'RECOVER_OTP' && (
          <form className="LM_FORM" onSubmit={verifyOtp}>
            <div className="LM_HEADER">
              <h2>Enter OTP</h2>
              <p>We sent a code to {phone.replace(/.(?=.{4})/g, '*')}</p>
            </div>
            {error && <div className="LM_ERROR_MSG">{error}</div>}
            <div className="LM_INPUT_GROUP">
              <input 
                type="text" 
                className="LM_OTP_INPUT" 
                maxLength={6} 
                placeholder="000000" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                required 
                autoFocus
              />
            </div>
            <button className="LM_SUBMIT_BTN" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <p className="LM_RESEND_TEXT">
              Didn't get the code? <button type="button" onClick={() => LoginModel.sendOtp(phone)}>Resend</button>
            </p>
          </form>
        )}

        {/* --- VIEW: SUCCESS --- */}
        {view === 'RECOVER_SUCCESS' && (
          <div className="LM_SUCCESS_AREA">
            <i className="fas fa-check-circle"></i>
            <h2>Identity Verified</h2>
            <p>Your request has been approved. Please check your device for the final link.</p>
            <button className="LM_SUBMIT_BTN" onClick={() => { setView('LOGIN'); setError(''); }}>
              Return to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login_modal;