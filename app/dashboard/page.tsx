"use client";
import { Button } from "@/components/ui/button";

const ArtistJoinPage = () => {
  return (
    <>
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-white to-gray-100 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="text-center relative z-10 px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 ">Join us as an Artist</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-raleway">
            Join the leading digital art marketplace. Let&apos;s build your profile. This should only take 2-3 minutes.
          </p>

          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg font-raleway"
            onClick={() => (window.location.href = "/dashboard/profile")}
          >
            Get started
          </Button>
        </div>
      </div>
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .font-playfair {
          font-family: "Playfair Display", serif;
        }
        .font-raleway {
          font-family: "Raleway", sans-serif;
        }
      `}</style>
    </>
  );
};

export default ArtistJoinPage;
