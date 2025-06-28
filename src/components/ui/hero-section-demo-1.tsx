"use client";

import { motion } from "framer-motion";
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import { Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

export default function HeroSectionOne() {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  const handleExploreClick = () => {
    if (isSignedIn) {
      navigate('/editor');
    } else {
      // If not signed in, show sign in modal or redirect to sign in
      // For now, we'll just navigate to editor and let the component handle the redirect
      navigate('/editor');
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Navbar />
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="py-10 md:py-20">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-white md:text-4xl lg:text-7xl tracking-wide">
          {"AI Code Editor for Devs, by Devs"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.8,
          }}
          className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-gray-300"
        >
          An intelligent code editor designed to accelerate your practice, correct your bugs,
          and guide your growth—one line at a time.
        </motion.p>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1,
          }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button 
            onClick={handleExploreClick}
            className="w-60 transform rounded-lg bg-white px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-200"
          >
            {isSignedIn ? 'Go to Code Editor' : 'Explore Now'}
          </button>
          <button className="w-60 transform rounded-lg border border-gray-600 bg-transparent px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800">
            Contact Support
          </button>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: 1.2,
          }}
          className="relative z-10 mt-20 mx-auto max-w-7xl rounded-3xl border border-gray-700 bg-gray-800 p-4 shadow-md"
        >
          <div className="w-full overflow-hidden rounded-xl border border-gray-600">
            <img
              src="https://assets.aceternity.com/pro/aceternity-landing.webp"
              alt="Landing page preview"
              className="aspect-[16/9] h-auto w-full object-cover"
              height={600}
              width={800}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-gray-700 px-4 py-4 bg-black/20 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Logo size="md" />
        <h1 
          onClick={() => navigate('/')}
          className="text-base font-bold md:text-2xl text-white cursor-pointer hover:text-gray-300 transition-colors"
        >
          CodeSprint
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        {isSignedIn ? (
          <div className="flex items-center space-x-3">
            <span className="hidden sm:block text-sm text-gray-300">
              Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
            </span>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <SignInButton mode="modal">
              <button className="w-24 transform rounded-lg bg-white px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-200 md:w-32">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="w-24 transform rounded-lg border border-gray-600 bg-transparent px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        )}
      </div>
    </nav>
  );
}; 