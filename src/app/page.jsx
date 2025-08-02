"use client";
import React from "react";

function MainComponent() {
  const [employeeName, setEmployeeName] = React.useState("");
  const [isAgreed, setIsAgreed] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [certificateGenerated, setCertificateGenerated] = React.useState(false);
  const [certificateData, setCertificateData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = React.useState(false);
  const [certificatePreview, setCertificatePreview] = React.useState(null);

  // Ref for certificate section
  const certificateSectionRef = React.useRef(null);

  const handleSubmit = async () => {
    if (!employeeName.trim() || !isAgreed) {
      alert("Please fill in your name and agree to participate");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-pdf-certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeName: employeeName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate certificate");
      }

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        setCertificateGenerated(true);
        setCertificateData({
          pdfBase64: result.pdfBase64,
          fileName: result.fileName,
          employeeName: employeeName.trim(),
        });
        
        // Auto scroll to certificate section after a brief delay
        setTimeout(() => {
          certificateSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 500);
      } else {
        throw new Error(result.error || "Failed to generate certificate");
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certificateData || !certificateData.employeeName) {
      alert("Certificate data not available");
      return;
    }

    setIsGeneratingCertificate(true);
    setCertificatePreview(null);

    try {
      // Step 1: Generate the name image
      const nameImageResponse = await fetch('/api/generate-name-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: certificateData.employeeName
        })
      });

      if (!nameImageResponse.ok) {
        throw new Error('Failed to generate name image');
      }

      const nameImageData = await nameImageResponse.json();
      
      if (!nameImageData.success) {
        throw new Error(nameImageData.error || 'Failed to generate name image');
      }

      // Create a preview of the name image
      const namePreviewUrl = `data:image/png;base64,${nameImageData.nameImage}`;
      setCertificatePreview(namePreviewUrl);
      
      // Step 2: Composite the certificate with the name image
      const composeResponse = await fetch('/api/compose-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameImageBase64: nameImageData.nameImage,
          employeeName: certificateData.employeeName
        })
      });
      
      if (!composeResponse.ok) {
        throw new Error('Failed to generate final certificate');
      }
      
      const composeData = await composeResponse.json();
      
      if (!composeData.success) {
        throw new Error(composeData.error || 'Failed to generate final certificate');
      }
      
      // Step 3: Download the final certificate
      const downloadResponse = await fetch('/api/download-final-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateImageBase64: composeData.certificateImage,
          fileName: composeData.fileName
        })
      });
      
      if (!downloadResponse.ok) {
        throw new Error('Failed to download certificate');
      }
      
      // Convert response to blob and trigger download
      const certificateBlob = await downloadResponse.blob();
      const url = window.URL.createObjectURL(certificateBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = composeData.fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Final certificate generated and downloaded successfully');
    } catch (error) {
      console.error("Certificate generation error:", error);
      alert("Failed to generate certificate. Please try again. Error: " + error.message);
    } finally {
      setIsGeneratingCertificate(false);
      setCertificatePreview(null);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1509391366360-2e959784a276?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHxzb2xhciUyMHBhbmVsc3xlbnwwfHx8fDE3NTQwNTg0MDl8MA&ixlib=rb-4.1.0&q=85')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* 45% intensity overlay */}
      <div className="min-h-screen bg-white bg-opacity-45 w-full flex flex-col">
        {/* Header */}
        <div className="bg-white bg-opacity-60 backdrop-blur-sm py-4 sm:py-6 px-3 sm:px-4 w-full">
          <div className="max-w-6xl mx-auto">
            {/* Logo Section */}
            <div className="flex justify-center items-center mb-3 sm:mb-4 px-2 sm:px-4">
              {/* IAC Lumax Logo */}
              <div className="flex items-center">
                <img 
                  src="/IAC _ Lumax logo.jpeg" 
                  alt="IAC Lumax Logo" 
                  className="h-16 sm:h-18 md:h-20 lg:h-24 w-auto max-w-full"
                />
              </div>
            </div>
            
            {/* Title Section */}
            <div className="text-center px-2 sm:px-4">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2 leading-tight">
                908 KWp Solar Power Plant Inauguration
              </h1>
              <p className="text-teal-600 text-sm sm:text-base md:text-lg font-medium mb-1 leading-tight">
                Renewable Energy Development Program
              </p>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-tight">
                IAC Nashik - Employee Participation Portal
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-3 sm:space-y-4 md:space-y-6 w-full">
          {/* Certificate Preview */}
          <div 
            ref={certificateSectionRef}
            className="bg-white bg-opacity-60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-8 w-full"
          >
            <div className="text-center py-6 sm:py-8 md:py-16">
              {isGeneratingCertificate ? (
                <div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                    <i className="fas fa-spinner fa-spin text-white text-lg sm:text-xl md:text-2xl lg:text-3xl"></i>
                  </div>
                  <p className="text-blue-600 text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">
                    Generating Your Certificate...
                  </p>
                  <p className="text-gray-800 mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base leading-tight">
                    Please wait while we create your participation certificate
                  </p>
                  {certificatePreview && (
                    <div className="mt-4 flex justify-center">
                      <div className="bg-white p-4 rounded-lg shadow-lg">
                        <p className="text-gray-700 text-sm mb-2">Name Preview:</p>
                        <img 
                          src={certificatePreview} 
                          alt="Name Preview" 
                          className="max-w-full h-auto rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : certificateGenerated ? (
                <div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                    <i className="fas fa-check-circle text-white text-lg sm:text-xl md:text-2xl lg:text-3xl"></i>
                  </div>
                  <p className="text-green-600 text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">
                    Certificate Generated Successfully!
                  </p>
                  <p className="text-gray-800 mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base leading-tight">
                    Your participation certificate for{" "}
                    <strong>{employeeName}</strong> is ready
                  </p>
                  <button
                    onClick={downloadCertificate}
                    className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg font-medium hover:from-green-600 hover:to-teal-600 transition-all duration-200 flex items-center justify-center gap-2 mx-auto text-xs sm:text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-105 touch-manipulation"
                  >
                    <i className="fas fa-certificate text-sm sm:text-base"></i>
                    <span className="whitespace-nowrap">Generate Certificate</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gray-200 bg-opacity-70 rounded-full flex items-center justify-center">
                    <i className="fas fa-file-certificate text-gray-600 text-lg sm:text-xl md:text-2xl lg:text-3xl"></i>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-tight">
                    Certificate preview will appear here
                  </p>
                  <p className="text-gray-600 text-xs sm:text-xs md:text-sm mt-2 sm:mt-3 md:mt-4 leading-tight">
                    Complete the form and agreement to generate your certificate
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Participation Form */}
          <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-8 w-full">
            <div className="text-center mb-4 sm:mb-6 md:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 md:mb-4 bg-teal-500 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-white text-lg sm:text-xl md:text-2xl"></i>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1 sm:mb-2 leading-tight">
                Confirm Your Participation
              </h2>
              <p className="text-gray-700 text-xs sm:text-sm md:text-base leading-tight">
                Be part of our renewable energy initiative and receive your
                participation certificate
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <div>
                <label className="block text-gray-800 font-medium mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">
                  Employee Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Enter employee full name"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 border border-gray-300 bg-white bg-opacity-80 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-xs sm:text-sm md:text-base touch-manipulation"
                    disabled={isSubmitted}
                  />
                  <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base"></i>
                </div>
              </div>

              <div className="bg-green-50 bg-opacity-70 border border-green-200 rounded-lg p-2 sm:p-3 md:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <i className="fas fa-check-circle text-green-600 mt-1 text-xs sm:text-sm md:text-base flex-shrink-0"></i>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">
                      Participation Agreement
                    </h3>
                    <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
                      <div className="relative mt-1 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isAgreed}
                          onChange={(e) => setIsAgreed(e.target.checked)}
                          className="w-4 h-4 opacity-0 absolute"
                          disabled={isSubmitted}
                        />
                        <div className="w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center bg-white">
                          {isAgreed && (
                            <i className="fas fa-check text-black text-xs"></i>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-800 text-xs sm:text-xs md:text-sm leading-relaxed">
                        I am agreed to actively participated in the Renewable
                        Energy Program, demonstrating commitment and awareness
                        toward sustainable energy solutions and contributing to
                        a cleaner, greener future.
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitted || !employeeName.trim() || !isAgreed || isLoading
                }
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 sm:py-4 px-3 sm:px-4 md:px-6 rounded-lg font-medium text-sm sm:text-base md:text-lg hover:from-teal-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 touch-manipulation"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin text-sm sm:text-base"></i>
                    <span className="text-xs sm:text-sm md:text-base">Generating Certificate...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle text-sm sm:text-base"></i>
                    <span className="text-xs sm:text-sm md:text-base">
                      {isSubmitted
                        ? "Participation Confirmed"
                        : "Confirm Participation"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-8 w-full">
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-teal-100 bg-opacity-80 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-info-circle text-teal-600 text-sm sm:text-lg md:text-xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-1 sm:mb-2 md:mb-3 leading-tight">
                  About the Solar Plant Inauguration
                </h3>
                <p className="text-gray-700 leading-relaxed text-xs sm:text-sm md:text-base">
                  Join IAC Nashik in celebrating the inauguration of our new
                  solar plant. By participating in this renewable energy
                  development program, you contribute to environmental
                  sustainability and demonstrate your commitment to a greener
                  future.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white bg-opacity-60 backdrop-blur-sm py-3 sm:py-4 px-3 sm:px-4 w-full mt-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <p className="text-gray-700 text-xs sm:text-sm md:text-base font-medium">
                IAC - Nashik Plant 2025
              </p>
              <p className="text-gray-500 text-xs sm:text-xs md:text-sm mt-1">
                Renewable Energy Development Program
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;