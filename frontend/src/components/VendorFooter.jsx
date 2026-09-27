import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaTwitter } from "react-icons/fa";
import { Link } from "react-router";
import { Building2 } from "lucide-react";
const VendorFooter = () => {
    const currentYear = new Date().getFullYear();
    const socialLinks = [
        { icon: <FaGithub className="w-5 h-5"/>, url: "https://github.com/sarwan72", label: "GitHub" },
        { icon: <FaLinkedin className="w-5 h-5"/>, url: "https://www.linkedin.com/in/sarwan-maurya/", label: "LinkedIn" },
        { icon: <FaEnvelope className="w-5 h-5"/>, url: "mailto:sarwan.maurya@example.com", label: "Email" },
        { icon: <FaTwitter className="w-5 h-5"/>, url: "https://x.com/sarwan_maurya", label: "Twitter" },
    ];
    const footerLinks = [
        {
            title: "Quick Links",
            links: [
                { name: "About Us", to: "/about" },
                { name: "Features", to: "/features" },
                { name: "Contact", to: "/contact" },
                { name: "Privacy Policy", to: "/privacy" },
            ],
        },
    ];
    return (<footer className="bg-base-200 text-base-content border-t border-base-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-xl">
                <Building2 className="w-6 h-6 text-white"/>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                NearMeet Vendor
              </span>
            </div>
            <p className="text-sm text-base-content/70">
              Helping vendors connect with users through trusted experiences.
            </p>
            <div className="flex space-x-4 pt-2">
              {socialLinks.map((social, index) => (<a key={index} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="p-2 rounded-full bg-base-300 hover:bg-base-300/80 transition-colors duration-200">
                  {social.icon}
                </a>))}
            </div>
          </div>

          {/* Navigation Links */}
          {footerLinks.map((section, index) => (<div key={index} className="space-y-4">
              <h3 className="text-lg font-semibold text-base-content">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (<li key={linkIndex}>
                    <Link to={link.to} className="text-sm text-base-content/70 hover:text-primary transition-colors duration-200">
                      {link.name}
                    </Link>
                  </li>))}
              </ul>
            </div>))}

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-base-content">Newsletter</h3>
            <p className="text-sm text-base-content/70">
              Subscribe to get updates on vendor tools and opportunities.
            </p>
            <div className="flex space-x-2">
              <input type="email" placeholder="Your email" className="input input-bordered input-sm w-full max-w-xs bg-base-100"/>
              <button className="btn btn-primary btn-sm">Subscribe</button>
            </div>
            <p className="text-xs text-base-content/50 mt-2">
              We care about your data. Read our{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-base-300 mt-12 pt-8 text-center text-sm text-base-content/50">
          <p>
            &copy; {currentYear} NearMeet Vendor. All rights reserved. Built with ❤️ by Sarwan
            Maurya
          </p>
        </div>
      </div>
    </footer>);
};
export default VendorFooter;
