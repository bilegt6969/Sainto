'use client'
import React, { useState } from 'react';
 
export default function App() {
  const [formStatus, setFormStatus] = useState('');
  const [formData, setFormData] = useState({
    companySize: '',
    companyName: '',
    firstName: '',
    lastName: '',
    workEmail: '',
    phoneNumber: '',
    productInterest: '',
    businessNeeds: ''
  });
  const [showSubmitAgain, setShowSubmitAgain] = useState(false); // New state for "Submit again" button
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // State for individual field errors

  // Define the type for formData keys to resolve TypeScript error
  type FormDataKeys = keyof typeof formData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for the field when user starts typing/selecting
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    // If a general form status is showing (e.g., "fill all fields"), clear it on input
    if (formStatus && !showSubmitAgain) {
      setFormStatus('');
    }
  };

  const resetForm = () => {
    setFormData({
      companySize: '',
      companyName: '',
      firstName: '',
      lastName: '',
      workEmail: '',
      phoneNumber: '',
      productInterest: '',
      businessNeeds: ''
    });
    setFormStatus('');
    setShowSubmitAgain(false);
    setErrors({}); // Clear all errors on reset
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    const requiredFields: FormDataKeys[] = ['companySize', 'companyName', 'firstName', 'lastName', 'workEmail', 'phoneNumber', 'productInterest'];

    // Validate required fields
    requiredFields.forEach(field => {
      if (!formData[field] || String(formData[field]).trim() === '') {
        newErrors[field] = 'Энэ талбарыг бөглөнө үү.';
      }
    });

    // Validate email format
    if (formData.workEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.workEmail)) {
      newErrors.workEmail = 'Бодит имэйл хаяг оруулна уу.';
    }
    // Specific check for Gmail domain if desired, but general regex is usually sufficient
    // if (formData.workEmail && !formData.workEmail.endsWith('@gmail.com')) {
    //   newErrors.workEmail = 'Please enter a valid Gmail address.';
    // }


    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormStatus('Шаардлагатай бүх талбарыг бөглөнө үү эсвэл алдааг засна уу.');
      setShowSubmitAgain(false); // Ensure form is not in success state
      return;
    }

    // IMPORTANT: For this Canvas environment, we'll use the provided URL directly.
    // In a real Next.js application, you would use process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL
    // and ensure it's properly configured in your .env.local file and build process.
    const discordWebhookUrl = 'https://discord.com/api/webhooks/1382680453835657237/uTlQfIFGK7BhX5ErU2dq3VV16SJe1_FQeqLK0mZB-9bx0Fqtz5Rj54_hBr1v9g6EZU0P';

    if (!discordWebhookUrl || !discordWebhookUrl.startsWith('https://discord.com/api/webhooks/')) {
        setFormStatus('Discord Webhook URL тохируулагдаагүй эсвэл буруу байна.');
        // No timeout here, let it persist until user interacts
        return;
    }

    // Structure the data for the Discord embed
    const discordPayload = {
        embeds: [{
            title: 'Шинэ борлуулалтын хүсэлт',
            color: 5814783, // A nice blue color
            fields: [
                { name: 'Компанийн нэр', value: formData.companyName, inline: true },
                { name: 'Компанийн хэмжээ', value: formData.companySize, inline: true },
                { name: 'Нэр', value: `${formData.firstName} ${formData.lastName}` },
                { name: 'Имэйл', value: formData.workEmail, inline: true },
                { name: 'Утасны дугаар', value: formData.phoneNumber, inline: true },
                { name: 'Сонирхож буй үйлчилгээ', value: formData.productInterest },
                { name: 'Бизнесийн хэрэгцээ', value: formData.businessNeeds || 'Оруулсангүй' }
            ],
            timestamp: new Date().toISOString()
        }]
    };

    try {
        const response = await fetch(discordWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discordPayload),
        });

        if (response.ok) {
            setFormStatus('Баярлалаа! Манай борлуулалтын баг тантай удахгүй холбогдох болно.');
            setShowSubmitAgain(true); // Show "Submit again" button on success
            setErrors({}); // Clear any previous errors on success
        } else {
            setFormStatus('Хүсэлт илгээхэд алдаа гарлаа. Дахин оролдоно уу.');
            setShowSubmitAgain(false);
        }
    } catch (error) {
        console.error('Discord webhook error:', error);
        setFormStatus('Сүлжээний алдаа гарлаа. Дахин оролдоно уу.');
        setShowSubmitAgain(false);
    } finally {
        // No timeout for formStatus here, it will be cleared by resetForm or new input
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center py-16 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-medium mb-4">Борлуулалтын багтай холбогдох</h1>
          <p className="text-base text-gray-300">
          Хамтран ажиллах шинэ санаа байна уу? Тэгвэл Saint-тай хамт эхэлье.
          </p>
        </div>

        {!showSubmitAgain ? ( // Conditionally render form or success message
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Size */}
            <div>
              <label htmlFor="companySize" className="block text-xs font-medium mb-2">
                Компанийн хэмжээ <span className="text-white">*</span>
              </label>
              <div className="relative">
                <select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
                  className={`w-full bg-transparent border rounded-xs px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500 pr-10 ${errors.companySize ? 'border-red-500' : 'border-[#FFFFFF33]'}`}
                >
                  <option value="" disabled className="bg-gray-900 text-gray-500">Сонгоно уу</option>
                  <option value="1-10 ажилтантай" className="bg-gray-900">1-10 ажилтантай</option>
                  <option value="11-50 ажилтантай" className="bg-gray-900">11-50 ажилтантай</option>
                  <option value="51-200 ажилтантай" className="bg-gray-900">51-200 ажилтантай</option>
                  <option value="201-500 ажилтантай" className="bg-gray-900">201-500 ажилтантай</option>
                  <option value="500+ ажилтантай" className="bg-gray-900">500+ ажилтантай</option>
                </select>
               </div>
              {errors.companySize && <p className="text-red-500 text-xs mt-1">{errors.companySize}</p>}
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-xs font-medium mb-2">
                Компанийн нэр <span className="text-white">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className={`w-full bg-transparent border rounded-xs px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500 ${errors.companyName ? 'border-red-500' : 'border-[#FFFFFF33]'}`}
              />
              {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
            </div>

            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-xs font-medium mb-2">
                  Нэр <span className="text-white">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full bg-transparent border rounded-xs px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500 ${errors.firstName ? 'border-red-500' : 'border-[#FFFFFF33]'}`}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-medium mb-2">
                  Овог <span className="text-white">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full bg-transparent border rounded-xs px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500 ${errors.lastName ? 'border-red-500' : 'border-[#FFFFFF33]'}`}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Work Email and Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="workEmail" className="block text-xs font-medium mb-2">
                  Ажлын имэйл <span className="text-white">*</span>
                </label>
                <input
                  type="email"
                  id="workEmail"
                  name="workEmail"
                  value={formData.workEmail}
                  onChange={handleInputChange}
                  className={`w-full bg-transparent border rounded-xs px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500 ${errors.workEmail ? 'border-red-500' : 'border-[#FFFFFF33]'}`}
                />
                {errors.workEmail && <p className="text-red-500 text-xs mt-1">{errors.workEmail}</p>}
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-xs font-medium mb-2">
                  Утасны дугаар <span className="text-white">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={`w-full bg-transparent border rounded-xs px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500 ${errors.phoneNumber ? 'border-red-500' : 'border-[#FFFFFF33]'}`}
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
              </div>
            </div>

            {/* Product Interest */}
            <div>
              <label htmlFor="productInterest" className="block text-xs font-medium mb-2">
                Та манай ямар бүтээгдэхүүн, үйлчилгээг сонирхож байна вэ? <span className="text-white">*</span>
              </label>
              <div className="relative">
                  <select
                    id="productInterest"
                    name="productInterest"
                    value={formData.productInterest}
                    onChange={handleInputChange}
                    className={`w-full bg-transparent border rounded-xs px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500 pr-10 ${errors.productInterest ? 'border-red-500' : 'border-[#FFFFFF33]'}`}
                  >
                    <option value="" disabled className="bg-gray-900 text-gray-500">Доорх сонголтуудаас нэгийг сонгоно уу</option>
                    <option value="Түншлэлийн лавлагаа" className="bg-gray-900">Түншлэлийн лавлагаа</option>
                    <option value="Худалдагчийн бүртгэлийн дэмжлэг" className="bg-gray-900">Худалдагчийн бүртгэлийн дэмжлэг</option>
                    <option value="Бөөнөөр худалдан авах" className="bg-gray-900">Бөөнөөр худалдан авах</option>
                    <option value="API холболт" className="bg-gray-900">API холболт</option>
                    <option value="Бусад" className="bg-gray-900">Бусад</option>
                  </select>
               </div>
              {errors.productInterest && <p className="text-red-500 text-xs mt-1">{errors.productInterest}</p>}
            </div>

            {/* Business Needs */}
            <div>
              <label htmlFor="businessNeeds" className="block text-xs font-medium mb-2">
                Та бизнесийн хэрэгцээ, тулгамдаж буй асуудлынхаа талаар хуваалцана уу?
              </label>
              <textarea
                id="businessNeeds"
                name="businessNeeds"
                value={formData.businessNeeds}
                onChange={handleInputChange}
                rows={5} // Changed to number
                className="w-full bg-transparent border border-[#FFFFFF33] rounded-xs px-3 py-2 text-sm text-white resize-none focus:outline-4 focus:border-[#FFFFFF33]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Илгээх
              </button>
            </div>

              
          </form>
        ) : (
          <div className="text-center mt-12">
            <p className="text-lg text-[#FFFFFF80] mb-6">{formStatus}</p>
            <button
              onClick={resetForm}
              className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-full text-base font-medium transition-colors"
            >
              Дахин илгээх
            </button>
          </div>
        )}

        {/* General Status Message (for errors or initial messages) */}
        {formStatus && !showSubmitAgain && (
          <div className={`mt-6 p-4 rounded-md ${formStatus.includes('амжилттай') ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
            <p className={`text-center ${formStatus.includes('амжилттай') ? 'text-green-400' : 'text-red-400'}`}>{formStatus}</p>
          </div>
        )}
      </div>
      <style>{`
        body {
          background-color: black;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .font-sans {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
