"use client";
import Link from "next/link";
import LoginForm from "@/components/partials/auth/login-form";
import Social from "@/components/partials/auth/social";
import useDarkMode from "@/hooks/useDarkMode";
// image import

const Login = () => {
  const [isDark] = useDarkMode();
  return (
    <>
      <div className="loginwrapper min-h-screen">
      <div className="lg-inner-column h-full">
        <div className="left-column relative z-[1] hidden lg:block">
          <div className="max-w-full h-screen flex items-center justify-center px-4">
            <Link href="/" className="block">
              <img 
                src="/assets/images/auth/CMS.png"
                alt="USPizza Logo" 
                className="mx-auto max-w-[200px] w-full h-auto object-contain"
              />
            </Link>
          </div>
        </div>
        
        <div className="right-column relative w-full lg:w-1/2">
          <div className="inner-content min-h-screen flex flex-col bg-white dark:bg-slate-800">
            <div className="auth-box flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8">
              <div className="mobile-logo text-center mb-6 lg:hidden">
                <Link href="/" className="inline-block">
                  <img
                    src="/assets/images/auth/CMS.png"
                    alt="USPizza Logo"
                    className="mx-auto w-24 h-24 sm:w-32 sm:h-32 object-contain"
                  />
                </Link>
              </div>
              
              {/* Sign in header */}
              <div className="text-center mb-6 sm:mb-8 2xl:mb-10">
                <h4 className="font-medium text-xl sm:text-2xl mb-2">Sign in</h4>
                <div className="text-slate-500 text-sm sm:text-base px-2">
                  Sign in to your account to start using BlinkCode Admin Panel
                </div>
              </div>
              
              {/* Login form */}
              <div className="w-full max-w-md mx-auto">
                <LoginForm />
              </div>
            </div>
            
            {/* Footer */}
            <div className="auth-footer text-center">
              <div className="site-footer px-6 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 py-4">
                  <div className="grid-cols-1 md:gap-5 text-center">
                    <div className=" text-[14px] whitespace-nowrap">
                      <p>| All rights Reserved |</p> Developed by <a href="https://blinkcodedev.com" target="_blank" 
                      rel="noopener noreferrer" className="hover:underline">BlinkCodeDev</a>
                      {/* <span className="text-[8px]"> 202001024359 (1380679-X)</span> */}
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;
