'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Phone, Building2 } from 'lucide-react';

// Sample Nigerian schools - you can expand this list
const NIGERIAN_SCHOOLS = [
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'Covenant University',
  'Lagos State University (LASU)',
  'Babcock University',
  'Obafemi Awolowo University (OAU)',
  'University of Nigeria, Nsukka (UNN)',
  'Nnamdi Azikiwe University',
  'Ahmadu Bello University (ABU)',
  'University of Benin (UNIBEN)',
  'Bayero University Kano (BUK)',
  'Federal University of Technology Minna (FUTMINNA)',
  'University of Ilorin (UNILORIN)',
  'University of Port Harcourt (UNIPORT)',
  'Rivers State University (RSU)',
  'Abubakar Tafawa Balewa University (ATBU)',
  'Federal University of Agriculture, Abeokuta (FUNAAB)',
  'Lagos Business School',
  'Pan-Atlantic University',
  'African University of Science and Technology',
];

export default function SignUp() {
  const [step, setStep] = useState('register'); // 'register', 'complete-profile', 'success'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    school: '',
    whatsappNumber: '',
    isVendor: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const validateWhatsApp = (number) => {
    // Nigerian WhatsApp format: +234XXXXXXXXXX or 0XXXXXXXXXX
    const whatsappRegex = /^(\+234|0)[0-9]{10}$/;
    return whatsappRegex.test(number.replace(/\s/g, ''));
  };

  const validateRegisterForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!formData.school) {
      newErrors.school = 'School is required';
    }
    
    if (!formData.whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'WhatsApp number is required';
    } else if (!validateWhatsApp(formData.whatsappNumber)) {
      newErrors.whatsappNumber = 'Invalid Nigerian WhatsApp number (e.g., +2348012345678)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) return;
    
    setLoading(true);
    setApiError('');
    
    try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send HTTP-only cookie
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          isVendor: formData.isVendor,
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Sign up failed');
      }
      
      // Move to profile completion step
      setStep('complete-profile');
      
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;
    
    setLoading(true);
    setApiError('');
    
    try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/complete-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send HTTP-only cookie
        body: JSON.stringify({
          email: formData.email,
          school: formData.school,
          whatsappNumber: formData.whatsappNumber.replace(/\s/g, ''),
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Profile completion failed');
      }
      
      // No token/user storage needed; cookie is set by backend
      console.log('Profile completed:', data.user);
      setStep('success');
      setSuccessMessage('Profile completed! Redirecting to your dashboard...');
      setTimeout(() => {
        router.push(data.user.isVendor ? '/dashboard' : '/vendor-dashboard');
      }, 2000);
      
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
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
          {step === 'register' && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">Create Your Account</h1>
                <p className="text-sm text-muted-foreground">Join UniMart and start selling</p>
              </div>

              {apiError && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input ${
                        errors.name ? 'border-destructive' : 'border-border'
                      }`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

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

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input ${
                        errors.password ? 'border-destructive' : 'border-border'
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
                  {errors.password && (
                    <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Confirm Password
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

                <div className="bg-secondary/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground text-center">
                    ✓ You are registering as a <span className="font-semibold text-foreground">Vendor</span> to list products on UniMart
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 focus:ring-4 focus:ring-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Continue'}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignUp}
                  className="mt-4 w-full flex items-center justify-center gap-3 bg-card border border-border text-foreground py-2.5 rounded-lg font-medium hover:bg-secondary/30 focus:ring-4 focus:ring-primary/20 transition"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <a href="/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </a>
              </p>
            </>
          )}

          {step === 'complete-profile' && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">Complete Your Profile</h1>
                <p className="text-sm text-muted-foreground">Just a few more details to get started</p>
              </div>

              {apiError && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleCompleteProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Select Your School
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
                    <select
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input appearance-none ${
                        errors.school ? 'border-destructive' : 'border-border'
                      }`}
                    >
                      <option value="">Choose your school...</option>
                      {NIGERIAN_SCHOOLS.map((school) => (
                        <option key={school} value={school}>
                          {school}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.school && (
                    <p className="mt-1 text-sm text-destructive">{errors.school}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    WhatsApp Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      placeholder="+2348012345678"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input ${
                        errors.whatsappNumber ? 'border-destructive' : 'border-border'
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Format: +2348012345678 or 08012345678
                  </p>
                  {errors.whatsappNumber && (
                    <p className="mt-1 text-sm text-destructive">{errors.whatsappNumber}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 focus:ring-4 focus:ring-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Completing Profile...' : 'Complete Profile'}
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to UniMart!</h2>
              <p className="text-muted-foreground mb-6">
                {successMessage}
              </p>
              <div className="animate-spin inline-block">
                <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full"></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}



// 'use client';

// import { useState } from 'react';
// import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Phone, Building2 } from 'lucide-react';

// // Sample Nigerian schools - you can expand this list
// const NIGERIAN_SCHOOLS = [
//   'University of Lagos (UNILAG)',
//   'University of Ibadan (UI)',
//   'Covenant University',
//   'Lagos State University (LASU)',
//   'Babcock University',
//   'Obafemi Awolowo University (OAU)',
//   'University of Nigeria, Nsukka (UNN)',
//   'Nnamdi Azikiwe University',
//   'Ahmadu Bello University (ABU)',
//   'University of Benin (UNIBEN)',
//   'Bayero University Kano (BUK)',
//   'Federal University of Technology Minna (FUTMINNA)',
//   'University of Ilorin (UNILORIN)',
//   'University of Port Harcourt (UNIPORT)',
//   'Rivers State University (RSU)',
//   'Abubakar Tafawa Balewa University (ATBU)',
//   'Federal University of Agriculture, Abeokuta (FUNAAB)',
//   'Lagos Business School',
//   'Pan-Atlantic University',
//   'African University of Science and Technology',
// ];

// export default function SignUp() {
//   const [step, setStep] = useState('register'); // 'register', 'complete-profile', 'success'
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     school: '',
//     whatsappNumber: '',
//     isVendor: true,
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [apiError, setApiError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');

//   const validateWhatsApp = (number) => {
//     // Nigerian WhatsApp format: +234XXXXXXXXXX or 0XXXXXXXXXX
//     const whatsappRegex = /^(\+234|0)[0-9]{10}$/;
//     return whatsappRegex.test(number.replace(/\s/g, ''));
//   };

//   const validateRegisterForm = () => {
//     const newErrors = {};
    
//     if (!formData.name.trim()) {
//       newErrors.name = 'Name is required';
//     }
    
//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Email is invalid';
//     }
    
//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     } else if (formData.password.length < 8) {
//       newErrors.password = 'Password must be at least 8 characters';
//     }
    
//     if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const validateProfileForm = () => {
//     const newErrors = {};
    
//     if (!formData.school) {
//       newErrors.school = 'School is required';
//     }
    
//     if (!formData.whatsappNumber.trim()) {
//       newErrors.whatsappNumber = 'WhatsApp number is required';
//     } else if (!validateWhatsApp(formData.whatsappNumber)) {
//       newErrors.whatsappNumber = 'Invalid Nigerian WhatsApp number (e.g., +2348012345678)';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({ 
//       ...prev, 
//       [name]: type === 'checkbox' ? checked : value 
//     }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//     setApiError('');
//   };

//   const handleRegisterSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateRegisterForm()) return;
    
//     setLoading(true);
//     setApiError('');
    
//     try {
//       const response = await fetch('http://localhost:5000/api/auth/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           name: formData.name,
//           email: formData.email,
//           password: formData.password,
//           isVendor: formData.isVendor,
//         })
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.message || 'Sign up failed');
//       }
      
//       // Move to profile completion step
//       setStep('complete-profile');
      
//     } catch (error) {
//       setApiError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCompleteProfile = async (e) => {
//     e.preventDefault();
    
//     if (!validateProfileForm()) return;
    
//     setLoading(true);
//     setApiError('');
    
//     try {
//       const response = await fetch('http://localhost:5000/api/auth/complete-profile', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email: formData.email,
//           school: formData.school,
//           whatsappNumber: formData.whatsappNumber.replace(/\s/g, ''),
//         })
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.message || 'Profile completion failed');
//       }
      
//       // Save token and user data
//       if (data.token) {
//         localStorage.setItem('token', data.token);
//         localStorage.setItem('user', JSON.stringify(data.user));
//       }
      
//       setStep('success');
//       setSuccessMessage('Profile completed! Redirecting to your dashboard...');
//       setTimeout(() => {
//         window.location.href = '/dashboard';
//       }, 2000);
      
//     } catch (error) {
//       setApiError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSignUp = () => {
//     window.location.href = 'http://localhost:5000/api/auth/google';
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
//           {step === 'register' && (
//             <>
//               <div className="text-center mb-6">
//                 <h1 className="text-2xl font-bold text-foreground mb-2">Create Your Account</h1>
//                 <p className="text-sm text-muted-foreground">Join UniMart and start selling</p>
//               </div>

//               {apiError && (
//                 <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
//                   <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
//                   <p className="text-sm text-destructive">{apiError}</p>
//                 </div>
//               )}

//               <form onSubmit={handleRegisterSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-foreground mb-1">
//                     Full Name
//                   </label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
//                     <input
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input ${
//                         errors.name ? 'border-destructive' : 'border-border'
//                       }`}
//                       placeholder="John Doe"
//                     />
//                   </div>
//                   {errors.name && (
//                     <p className="mt-1 text-sm text-destructive">{errors.name}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-foreground mb-1">
//                     Email Address
//                   </label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
//                     <input
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input ${
//                         errors.email ? 'border-destructive' : 'border-border'
//                       }`}
//                       placeholder="you@example.com"
//                     />
//                   </div>
//                   {errors.email && (
//                     <p className="mt-1 text-sm text-destructive">{errors.email}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-foreground mb-1">
//                     Password
//                   </label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       name="password"
//                       value={formData.password}
//                       onChange={handleChange}
//                       className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input ${
//                         errors.password ? 'border-destructive' : 'border-border'
//                       }`}
//                       placeholder="••••••••"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                     >
//                       {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                     </button>
//                   </div>
//                   {errors.password && (
//                     <p className="mt-1 text-sm text-destructive">{errors.password}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-foreground mb-1">
//                     Confirm Password
//                   </label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
//                     <input
//                       type={showConfirmPassword ? 'text' : 'password'}
//                       name="confirmPassword"
//                       value={formData.confirmPassword}
//                       onChange={handleChange}
//                       className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input ${
//                         errors.confirmPassword ? 'border-destructive' : 'border-border'
//                       }`}
//                       placeholder="••••••••"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                     >
//                       {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                     </button>
//                   </div>
//                   {errors.confirmPassword && (
//                     <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
//                   )}
//                 </div>

//                 <div className="bg-secondary/50 p-3 rounded-lg">
//                   <p className="text-xs text-muted-foreground text-center">
//                     ✓ You are registering as a <span className="font-semibold text-foreground">Vendor</span> to list products on UniMart
//                   </p>
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 focus:ring-4 focus:ring-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {loading ? 'Creating Account...' : 'Continue'}
//                 </button>
//               </form>

//               <div className="mt-6">
//                 <div className="relative">
//                   <div className="absolute inset-0 flex items-center">
//                     <div className="w-full border-t border-border"></div>
//                   </div>
//                   <div className="relative flex justify-center text-xs">
//                     <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
//                   </div>
//                 </div>

//                 <button
//                   onClick={handleGoogleSignUp}
//                   className="mt-4 w-full flex items-center justify-center gap-3 bg-card border border-border text-foreground py-2.5 rounded-lg font-medium hover:bg-secondary/30 focus:ring-4 focus:ring-primary/20 transition"
//                 >
//                   <svg className="w-5 h-5" viewBox="0 0 24 24">
//                     <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                     <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                     <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//                     <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//                   </svg>
//                   Sign up with Google
//                 </button>
//               </div>

//               <p className="mt-6 text-center text-sm text-muted-foreground">
//                 Already have an account?{' '}
//                 <a href="/login" className="text-primary font-semibold hover:underline">
//                   Sign in
//                 </a>
//               </p>
//             </>
//           )}

//           {step === 'complete-profile' && (
//             <>
//               <div className="text-center mb-6">
//                 <h1 className="text-2xl font-bold text-foreground mb-2">Complete Your Profile</h1>
//                 <p className="text-sm text-muted-foreground">Just a few more details to get started</p>
//               </div>

//               {apiError && (
//                 <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
//                   <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
//                   <p className="text-sm text-destructive">{apiError}</p>
//                 </div>
//               )}

//               <form onSubmit={handleCompleteProfile} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-foreground mb-1">
//                     Select Your School
//                   </label>
//                   <div className="relative">
//                     <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
//                     <select
//                       name="school"
//                       value={formData.school}
//                       onChange={handleChange}
//                       className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input appearance-none ${
//                         errors.school ? 'border-destructive' : 'border-border'
//                       }`}
//                     >
//                       <option value="">Choose your school...</option>
//                       {NIGERIAN_SCHOOLS.map((school) => (
//                         <option key={school} value={school}>
//                           {school}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   {errors.school && (
//                     <p className="mt-1 text-sm text-destructive">{errors.school}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-foreground mb-1">
//                     WhatsApp Number
//                   </label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
//                     <input
//                       type="tel"
//                       name="whatsappNumber"
//                       value={formData.whatsappNumber}
//                       onChange={handleChange}
//                       placeholder="+2348012345678"
//                       className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-input ${
//                         errors.whatsappNumber ? 'border-destructive' : 'border-border'
//                       }`}
//                     />
//                   </div>
//                   <p className="mt-1 text-xs text-muted-foreground">
//                     Format: +2348012345678 or 08012345678
//                   </p>
//                   {errors.whatsappNumber && (
//                     <p className="mt-1 text-sm text-destructive">{errors.whatsappNumber}</p>
//                   )}
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 focus:ring-4 focus:ring-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {loading ? 'Completing Profile...' : 'Complete Profile'}
//                 </button>
//               </form>
//             </>
//           )}

//           {step === 'success' && (
//             <div className="text-center py-8">
//               <div className="flex justify-center mb-4">
//                 <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
//                   <CheckCircle className="w-8 h-8 text-accent" />
//                 </div>
//               </div>
//               <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to UniMart!</h2>
//               <p className="text-muted-foreground mb-6">
//                 Your vendor account is ready. Redirecting to your dashboard...
//               </p>
//               <div className="animate-spin inline-block">
//                 <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full"></div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <p className="text-center text-xs text-muted-foreground mt-6">
//           By signing up, you agree to our Terms of Service and Privacy Policy
//         </p>
//       </div>
//     </div>
//   );
// }