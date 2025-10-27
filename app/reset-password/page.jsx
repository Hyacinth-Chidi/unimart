'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const validateRequestForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = () => {
    const newErrors = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Verification code is required';
    } else if (!/^\d{6}$/.test(formData.code)) {
      newErrors.code = 'Code must be a 6-digit number';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
    setSuccessMessage('');
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!validateRequestForm()) return;
    
    setLoading(true);
    setApiError('');
    setSuccessMessage('');
    
    try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Added for consistency
        body: JSON.stringify({
          email: formData.email
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset code');
      }
      
      setSuccessMessage('Reset code sent to your email!');
      setTimeout(() => {
        setStep('reset');
        setSuccessMessage('');
      }, 2000);
      
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validateResetForm()) return;
    
    setLoading(true);
    setApiError('');
    setSuccessMessage('');
    
    try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Added for consistency
        body: JSON.stringify({
          email: formData.email,
          code: formData.code,
          newPassword: formData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
      setSuccessMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/login'); // Updated to use Next.js router
      }, 2000);
      
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* UniMart Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">🛒</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">UniMart</h2>
            </div>
          </div>
          <p className="text-muted-foreground">Student Marketplace</p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {step === 'request' ? 'Reset Your Password' : 'Create New Password'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === 'request' 
                ? 'Enter your email address to receive a reset code'
                : 'Enter the verification code we sent to your email'}
            </p>
          </div>

          {apiError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{apiError}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-accent/20 border border-accent/30 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-accent">{successMessage}</p>
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input ${
                      errors.email ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 focus:ring-4 focus:ring-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending Code...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input ${
                    errors.code ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-destructive">{errors.code}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input ${
                      errors.newPassword ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-destructive">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input ${
                      errors.confirmPassword ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 focus:ring-4 focus:ring-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => setStep('request')}
                className="w-full flex items-center justify-center gap-2 text-primary hover:underline py-2 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to email entry
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <a href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By resetting your password, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}



// 'use client';

// import { useState } from 'react';
// import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

// export default function ResetPassword() {
//   const [step, setStep] = useState('request'); // 'request' or 'reset'
//   const [formData, setFormData] = useState({
//     email: '',
//     code: '',
//     newPassword: '',
//     confirmPassword: ''
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [apiError, setApiError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');

//   const validateRequestForm = () => {
//     const newErrors = {};
    
//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Email is invalid';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const validateResetForm = () => {
//     const newErrors = {};
    
//     if (!formData.code.trim()) {
//       newErrors.code = 'Verification code is required';
//     }
    
//     if (!formData.newPassword) {
//       newErrors.newPassword = 'New password is required';
//     } else if (formData.newPassword.length < 8) {
//       newErrors.newPassword = 'Password must be at least 8 characters';
//     }
    
//     if (formData.newPassword !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//     setApiError('');
//     setSuccessMessage('');
//   };

//   const handleRequestReset = async (e) => {
//     e.preventDefault();
    
//     if (!validateRequestForm()) return;
    
//     setLoading(true);
//     setApiError('');
//     setSuccessMessage('');
    
//     try {
//       const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email: formData.email
//         })
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to send reset code');
//       }
      
//       setSuccessMessage('Reset code sent to your email!');
//       setTimeout(() => {
//         setStep('reset');
//         setSuccessMessage('');
//       }, 2000);
      
//     } catch (error) {
//       setApiError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResetPassword = async (e) => {
//     e.preventDefault();
    
//     if (!validateResetForm()) return;
    
//     setLoading(true);
//     setApiError('');
//     setSuccessMessage('');
    
//     try {
//       const response = await fetch('http://localhost:5000/api/auth/reset-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email: formData.email,
//           code: formData.code,
//           newPassword: formData.newPassword
//         })
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to reset password');
//       }
      
//       setSuccessMessage('Password reset successful! Redirecting to login...');
//       setTimeout(() => {
//         window.location.href = '/auth/login';
//       }, 2000);
      
//     } catch (error) {
//       setApiError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         {/* UniMart Logo/Header */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center mb-4">
//             <div className="flex items-center gap-2">
//               <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
//                 <span className="text-primary-foreground font-bold text-lg">🛒</span>
//               </div>
//               <h2 className="text-2xl font-bold text-foreground">UniMart</h2>
//             </div>
//           </div>
//           <p className="text-muted-foreground">Student Marketplace</p>
//         </div>

//         <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
//           <div className="text-center mb-6">
//             <h1 className="text-2xl font-bold text-foreground mb-2">
//               {step === 'request' ? 'Reset Your Password' : 'Create New Password'}
//             </h1>
//             <p className="text-sm text-muted-foreground">
//               {step === 'request' 
//                 ? 'Enter your email address to receive a reset code'
//                 : 'Enter the verification code we sent to your email'}
//             </p>
//           </div>

//           {apiError && (
//             <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
//               <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
//               <p className="text-sm text-destructive">{apiError}</p>
//             </div>
//           )}

//           {successMessage && (
//             <div className="mb-4 p-3 bg-accent/20 border border-accent/30 rounded-lg flex items-start gap-2">
//               <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
//               <p className="text-sm text-accent">{successMessage}</p>
//             </div>
//           )}

//           {step === 'request' ? (
//             <form onSubmit={handleRequestReset} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-foreground mb-1">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input ${
//                       errors.email ? 'border-destructive' : 'border-border'
//                     }`}
//                     placeholder="you@example.com"
//                   />
//                 </div>
//                 {errors.email && (
//                   <p className="mt-1 text-sm text-destructive">{errors.email}</p>
//                 )}
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 focus:ring-4 focus:ring-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? 'Sending Code...' : 'Send Reset Code'}
//               </button>
//             </form>
//           ) : (
//             <form onSubmit={handleResetPassword} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-foreground mb-1">
//                   Verification Code
//                 </label>
//                 <input
//                   type="text"
//                   name="code"
//                   value={formData.code}
//                   onChange={handleChange}
//                   className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input ${
//                     errors.code ? 'border-destructive' : 'border-border'
//                   }`}
//                   placeholder="Enter 6-digit code"
//                   maxLength={6}
//                 />
//                 {errors.code && (
//                   <p className="mt-1 text-sm text-destructive">{errors.code}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-foreground mb-1">
//                   New Password
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     name="newPassword"
//                     value={formData.newPassword}
//                     onChange={handleChange}
//                     className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input ${
//                       errors.newPassword ? 'border-destructive' : 'border-border'
//                     }`}
//                     placeholder="••••••••"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                   >
//                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//                 {errors.newPassword && (
//                   <p className="mt-1 text-sm text-destructive">{errors.newPassword}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-foreground mb-1">
//                   Confirm New Password
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
//                   <input
//                     type={showConfirmPassword ? 'text' : 'password'}
//                     name="confirmPassword"
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input ${
//                       errors.confirmPassword ? 'border-destructive' : 'border-border'
//                     }`}
//                     placeholder="••••••••"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                   >
//                     {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//                 {errors.confirmPassword && (
//                   <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
//                 )}
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 focus:ring-4 focus:ring-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? 'Resetting Password...' : 'Reset Password'}
//               </button>

//               <button
//                 type="button"
//                 onClick={() => setStep('request')}
//                 className="w-full flex items-center justify-center gap-2 text-primary hover:underline py-2 font-medium"
//               >
//                 <ArrowLeft className="w-4 h-4" />
//                 Back to email entry
//               </button>
//             </form>
//           )}

//           <p className="mt-6 text-center text-sm text-muted-foreground">
//             Remember your password?{' '}
//             <a href="/login" className="text-primary font-semibold hover:underline">
//               Sign in
//             </a>
//           </p>
//         </div>

//         <p className="text-center text-xs text-muted-foreground mt-6">
//           By resetting your password, you agree to our Terms of Service and Privacy Policy
//         </p>
//       </div>
//     </div>
//   );
// }