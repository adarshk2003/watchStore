import { useState } from 'react';
import { FaEnvelope, FaPhoneAlt } from 'react-icons/fa'; // React Icons
import { toast } from 'react-toastify';

export default function ContactSupport() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !message) {
      toast.error('All fields are required!');
      return;
    }

    setLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <FaEnvelope className="mr-2 text-blue-600" /> Contact Support
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-600 font-medium">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-600 font-medium">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your email"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-gray-600 font-medium">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Describe your issue or inquiry"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-md w-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400`}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-gray-600">
          <h3 className="text-lg font-semibold">Other ways to reach us:</h3>
          <div className="mt-2 flex items-center">
            <FaPhoneAlt className="text-blue-600 mr-2" />
            <span>+1 (234) 567-890</span>
          </div>
          <div className="mt-2 flex items-center">
            <FaEnvelope className="text-blue-600 mr-2" />
            <span>support@clyro.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
