import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, HelpCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
        contactReason: 'general'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const contactMethods = [
        {
            icon: <Mail className="w-8 h-8"/>,
            title: "Email Us",
            description: "Reach out via email",
            contact: "support@nearmeet.com",
            subtext: "We respond within 24 hours",
            action: "mailto:support@nearmeet.com"
        },
        {
            icon: <Phone className="w-8 h-8"/>,
            title: "Call Us",
            description: "Talk directly with our team",
            contact: "+1 (555) 987-6543",
            subtext: "Mon-Fri, 9AM-6PM",
            action: "tel:+15559876543"
        },
        {
            icon: <Users className="w-8 h-8"/>,
            title: "Community Support",
            description: "Join our meetup discussions",
            contact: "Online Forum",
            subtext: "Available 24/7",
            action: "#"
        },
        {
            icon: <HelpCircle className="w-8 h-8"/>,
            title: "Help Center",
            description: "Find answers to common questions",
            contact: "100+ Articles",
            subtext: "Safety and Meetup Guidelines",
            action: "#"
        }
    ];
    const contactReasons = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'support', label: 'Technical Support' },
        { value: 'partnership', label: 'Partnership' },
        { value: 'feedback', label: 'Feedback' },
        { value: 'press', label: 'Press & Media' },
        { value: 'careers', label: 'Careers' }
    ];
    const socialLinks = [
        { name: 'Twitter', url: '#', color: 'bg-blue-500' },
        { name: 'Instagram', url: '#', color: 'bg-pink-500' },
        { name: 'Facebook', url: '#', color: 'bg-blue-600' },
        { name: 'LinkedIn', url: '#', color: 'bg-blue-700' }
    ];
    const offices = [
        {
            city: "Jhansi",
            address: "Biet Jhansi",
            timezone: "IST (UTC+5:30)",
            isHeadquarters: true
        }
    ];
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSubmitStatus('success');
        setIsSubmitting(false);
        setTimeout(() => {
            setFormData({
                name: '', email: '', company: '', subject: '', message: '', contactReason: 'general'
            });
            setSubmitStatus(null);
        }, 3000);
    };
    return (<div className="min-h-screen bg-base-100 text-base-content px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-base-content">
          Get in Touch with NearMeet
        </h1>
        <p className="text-lg md:text-xl text-base-content/70">
          Have questions about planning meetups, safety, or account issues? Contact our team and we’ll help you.
        </p>
      </div>

      {/* Contact Methods */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {contactMethods.map((method, index) => (<div key={index} className="bg-base-200/60 rounded-3xl p-6 shadow-sm hover:shadow-xl transition cursor-pointer border border-base-300" onClick={() => method.action.startsWith('#') ? null : window.open(method.action, '_blank')}>
            <div className="mb-4 p-3 bg-primary/20 rounded-2xl inline-block text-primary">{method.icon}</div>
            <h3 className="text-xl font-bold mb-1 text-base-content">{method.title}</h3>
            <p className="text-base-content/70 mb-2 text-sm">{method.description}</p>
            <p className="font-bold text-primary">{method.contact}</p>
            <p className="text-xs text-base-content/60 mt-1">{method.subtext}</p>
          </div>))}
      </div>

      {/* Contact Form and Offices */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
        {/* Form */}
        <div className="lg:col-span-2 bg-base-200/50 border border-base-300 rounded-3xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold mb-6 text-base-content">Send Us a Message</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-base-content/80">Reason for Contact</label>
            <select name="contactReason" value={formData.contactReason} onChange={handleInputChange} className="select select-bordered w-full bg-base-100 text-base-content">
              {contactReasons.map(reason => (<option key={reason.value} value={reason.value}>{reason.label}</option>))}
            </select>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Full Name *" value={formData.name} onChange={handleInputChange} required className="input input-bordered w-full bg-base-100 text-base-content"/>
              <input type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleInputChange} required className="input input-bordered w-full bg-base-100 text-base-content"/>
            </div>
            <input type="text" name="company" placeholder="Company (Optional)" value={formData.company} onChange={handleInputChange} className="input input-bordered w-full bg-base-100 text-base-content"/>
            <input type="text" name="subject" placeholder="Subject *" value={formData.subject} onChange={handleInputChange} required className="input input-bordered w-full bg-base-100 text-base-content"/>
            <textarea name="message" placeholder="Message *" rows={5} value={formData.message} onChange={handleInputChange} required className="textarea textarea-bordered w-full bg-base-100 text-base-content"/>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full shadow-lg">
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          {submitStatus === 'success' && (<div className="mt-4 p-3 bg-success/20 border border-success/40 text-success font-semibold rounded-xl text-center">
              Message sent successfully! We'll get back to you soon.
            </div>)}
        </div>

        {/* Offices */}
        <div className="space-y-6">
          <div className="bg-base-200/50 border border-base-300 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-base-content">Our Offices</h3>
            {offices.map((office, index) => (<div key={index} className="bg-base-100 border border-base-300 p-4 rounded-2xl mb-3">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-base-content">{office.city}</h4>
                  {office.isHeadquarters && <span className="badge badge-primary badge-sm font-bold">HQ</span>}
                </div>
                <p className="text-base-content/70 text-sm flex items-center mt-1"><MapPin className="w-4 h-4 mr-1 text-primary shrink-0"/> {office.address}</p>
                <p className="text-base-content/50 text-xs flex items-center mt-1"><Clock className="w-4 h-4 mr-1 shrink-0"/> {office.timezone}</p>
              </div>))}
          </div>

          {/* Social Links */}
          <div className="bg-base-200/50 border border-base-300 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-base-content">Follow Us</h3>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (<a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 flex items-center justify-center rounded-2xl text-white font-bold shadow ${social.color}`}>
                  {social.name[0]}
                </a>))}
            </div>
          </div>
        </div>
      </div>

      {/* Help Center */}
      <div className="max-w-4xl mx-auto text-center mb-12 bg-base-200/40 border border-base-300 rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-2 text-base-content">Need Immediate Help?</h2>
        <p className="text-base-content/70 mb-5 text-sm">Check our safety guidelines, meetup tips, and venue policies.</p>
        <Link to="/about" className="btn btn-outline btn-primary px-8">
          Learn More About Safety
        </Link>
      </div>

    </div>);
};
export default Contact;
