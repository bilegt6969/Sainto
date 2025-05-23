'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Props for the ContactOption component
type ContactOptionProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  linkText: string;
};

// Component for displaying a single contact method (Email, Phone, Location)
const ContactOption: React.FC<ContactOptionProps> = ({ icon, title, description, link, linkText }) => (
  <motion.div
    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
    whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
  >
    <div className="text-blue-400 mb-4">{icon}</div>
    <h3 className="text-lg font-medium text-white mb-2 tracking-tight">{title}</h3>
    <p className="text-neutral-400 mb-4">{description}</p>
    <a
      href={link}
      className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
    >
      {linkText} <ArrowRightIcon />
    </a>
  </motion.div>
);

// Props for the FormField component
type FormFieldProps = {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  textarea?: boolean;
};

// Reusable Form Field component (handles input and textarea)
const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type = 'text',
  placeholder,
  required = false,
  value,
  onChange,
  textarea = false,
}) => (
  <div className="mb-6">
    <label htmlFor={id} className="block mb-2 text-sm font-medium text-neutral-300">
      {label} {required && <span className="text-blue-400">*</span>}
    </label>
    {textarea ? (
      <textarea
        id={id}
        name={id} // Added name attribute for consistency
        rows={5}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:border-blue-400 focus:outline-none transition-colors"
      />
    ) : (
      <input
        id={id}
        name={id} // Added name attribute for consistency
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:border-blue-400 focus:outline-none transition-colors"
      />
    )}
  </div>
);

// --- SVG Icons ---

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1 mt-0.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// --- Main Contact Page Component ---

const ContactPage = () => {
  // State for form fields
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    orderNumber: '',
  });

  // State to track form submission status
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handler for form field changes
  // FIX: Use specific event type instead of any
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for form submission
  // FIX: Use specific event type instead of any
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, you would submit to your backend here (e.g., using fetch or axios)
    console.log('Form submitted:', formState);
    setIsSubmitted(true); // Show success message

    // Reset form after submission (optional)
    setFormState({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      orderNumber: '',
    });

    // Hide success message after a delay (optional)
    // In a real app, this might happen after successful API response
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000); // Hide after 5 seconds
  };

  return (
    <div className="min-h-screen bg-black font-sans antialiased">
      <main className="max-w-6xl mx-auto px-6 py-20 md:py-32">
        {/* Page Header */}
        <motion.h1
          className="text-3xl md:text-4xl font-semibold text-white text-center mb-6 tracking-tight"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Contact Us
        </motion.h1>

        <motion.p
          className="text-center text-neutral-400 mb-16 md:mb-24 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Our team is ready to assist you with any questions or concerns. Choose your preferred contact method or fill out the form below.
        </motion.p>

        {/* Contact Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <ContactOption
              icon={<EmailIcon />}
              title="Email Us"
              description="Get in touch via email for non-urgent inquiries. We typically respond within 24 hours."
              link="mailto:support@saint.mn"
              linkText="support@saint.mn"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ContactOption
              icon={<PhoneIcon />}
              title="Call Us"
              description="For urgent matters, our support team is available Monday-Friday, 10AM-6PM."
              link="tel:+97677123456"
              linkText="+976 7712 3456"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <ContactOption
              icon={<LocationIcon />}
              title="Visit Us"
              description="Our flagship store and authentication center is located in central Ulaanbaatar."
              link="https://maps.google.com/?q=Central+Tower+Ulaanbaatar" // Example valid maps link
              linkText="Get directions"
            />
          </motion.div>
        </div>

        {/* Contact Form & Business Info Grid */}
        <motion.div
          className="grid md:grid-cols-2 gap-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Contact Form Section */}
          <div>
            <h2 className="text-2xl font-medium text-white mb-8 tracking-tight">Send Us a Message</h2>

            {isSubmitted ? (
              // Success Message
              <motion.div
                className="flex flex-col items-center justify-center py-16 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-green-400 mb-4">
                  <CheckCircleIcon />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Message Sent!</h3>
                {/* FIX: Use &apos; for single quote */}
                <p className="text-neutral-400 max-w-sm">Thank you for contacting us. We&apos;ll get back to you as soon as possible.</p>
              </motion.div>
            ) : (
              // Actual Form
              <form onSubmit={handleSubmit} className="bg-black">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Full Name"
                    id="name"
                    placeholder="Your name"
                    required={true}
                    value={formState.name}
                    onChange={handleChange}
                  />

                  <FormField
                    label="Email Address"
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    required={true}
                    value={formState.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Phone Number"
                    id="phone"
                    type="tel"
                    placeholder="+976 XXXX XXXX"
                    value={formState.phone}
                    onChange={handleChange}
                  />

                  <FormField
                    label="Order Number (if applicable)"
                    id="orderNumber"
                    placeholder="SAI-XXXXXX"
                    value={formState.orderNumber}
                    onChange={handleChange}
                  />
                </div>

                <FormField
                  label="Subject"
                  id="subject"
                  placeholder="What's this about?"
                  required={true}
                  value={formState.subject}
                  onChange={handleChange}
                />

                <FormField
                  label="Message"
                  id="message"
                  placeholder="Tell us how we can help you..."
                  required={true}
                  value={formState.message}
                  onChange={handleChange}
                  textarea={true}
                />

                <motion.button
                  type="submit"
                  className="mt-2 px-8 py-3 bg-blue-500 text-white font-medium rounded-full focus:outline-none transition hover:bg-blue-600 active:bg-blue-700" // Added hover/active states
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  Send Message
                </motion.button>
              </form>
            )}
          </div>

          {/* Business Info Section */}
          <div>
            <h2 className="text-2xl font-medium text-white mb-8 tracking-tight">Business Hours & Location</h2>

            {/* Store Hours */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-3 tracking-tight">Store Hours</h3>
              <table className="w-full text-neutral-400 text-sm">
                <tbody>
                  <tr className="border-b border-neutral-800">
                    <td className="py-3 pr-6">Monday - Friday</td>
                    <td className="py-3 font-medium text-white text-right">10:00 AM - 8:00 PM</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="py-3 pr-6">Saturday</td>
                    <td className="py-3 font-medium text-white text-right">11:00 AM - 6:00 PM</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6">Sunday</td>
                    <td className="py-3 font-medium text-white text-right">12:00 PM - 5:00 PM</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Support Hours */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-3 tracking-tight">Customer Support Hours</h3>
              <table className="w-full text-neutral-400 text-sm">
                <tbody>
                  <tr className="border-b border-neutral-800">
                    <td className="py-3 pr-6">Phone Support</td>
                    <td className="py-3 font-medium text-white text-right">Mon-Fri, 10:00 AM - 6:00 PM</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6">Email & Chat</td>
                    <td className="py-3 font-medium text-white text-right">7 days a week (24hr response)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3 tracking-tight">Store Location</h3>
              <p className="text-neutral-400 mb-4 text-sm leading-relaxed">
                Central Tower, 5th Floor<br />
                Great Chinggis Khaan Square<br />
                Sukhbaatar District<br />
                Ulaanbaatar, Mongolia
              </p>

              {/* Placeholder Map */}
              <div className="aspect-video bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                {/* In a real app, use an actual map component (e.g., Google Maps React, Mapbox GL JS) */}
                <div className="w-full h-full flex items-center justify-center">
                   {/* Using a placeholder image for now */}
                   <Image
                    src="https://placehold.co/600x400/111827/4b5563?text=Map+Placeholder" // Placeholder image URL
                    alt="Map location placeholder"
                    width={600}
                    height={400}
                    className="object-cover w-full h-full"
                    unoptimized // Recommended for external placeholder services
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-neutral-800">
        <p className="text-xs text-neutral-500">
          Copyright © {new Date().getFullYear()} Saint Mongolia LLC. All rights reserved.
        </p>
        <div className="mt-4 space-x-6">
          <a href="/privacy" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
            Terms of Service
          </a>
        </div>
      </footer>

      {/* Global Styles (Optional - can be handled in global CSS) */}
      <style jsx global>{`
        /* Example using a local font file - ensure files are in /public/fonts */
        /* @font-face {
          font-family: 'SF Pro Display';
          src: url('/fonts/sf-pro-display-regular.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'SF Pro Display';
          src: url('/fonts/sf-pro-display-medium.woff2') format('woff2');
          font-weight: 500;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'SF Pro Display';
          src: url('/fonts/sf-pro-display-semibold.woff2') format('woff2');
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        } */
        body {
          /* font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, Helvetica, Arial, sans-serif; */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: black; /* Ensure body background is black */
          color: #f5f5f7; /* Default text color */
        }
      `}</style>
    </div>
  );
};

export default ContactPage;
