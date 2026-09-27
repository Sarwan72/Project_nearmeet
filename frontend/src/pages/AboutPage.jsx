import React from "react";
import { Target, Eye, Lightbulb, Workflow, Shield, Users, Sparkles, Rocket, ArrowRight, } from "lucide-react";
import { Link } from "react-router";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
const AboutPage = () => {
    // Timeline data
    const timelineData = [
        {
            year: "2024",
            title: "Our Mission",
            description: "Helping people find meaningful relationships by bringing dating back to real-life interactions instead of endless swipes.",
            icon: <Target className="w-6 h-6 text-primary"/>,
        },
        {
            year: "Q1 2024",
            title: "Our Vision",
            description: "To create the most trusted offline dating community where real connections grow into lifelong bonds.",
            icon: <Eye className="w-6 h-6 text-primary"/>,
        },
        {
            year: "Q2 2024",
            title: "Why Offline Dating?",
            description: "We believe genuine chemistry is best felt face-to-face. NearMeet focuses on safe offline meetups to make dating authentic again.",
            icon: <Lightbulb className="w-6 h-6 text-primary"/>,
        },
        {
            year: "Q3 2024",
            title: "How It Works",
            description: "Simple steps: create your profile → discover nearby people → connect → plan real-life meetups safely.",
            icon: <Workflow className="w-6 h-6 text-primary"/>,
        },
        {
            year: "Q4 2024",
            title: "Safety First",
            description: "Your security matters. Verified profiles, smart safety tips, and trusted meetup spots ensure safe offline dating.",
            icon: <Shield className="w-6 h-6 text-primary"/>,
        },
        {
            year: "Present",
            title: "Community & Belonging",
            description: "NearMeet is more than an app — it’s a growing community of people who value real conversations and authentic bonds.",
            icon: <Users className="w-6 h-6 text-primary"/>,
        },
        {
            year: "Present",
            title: "Unique Features",
            description: "• Location-based matches\n• Event & meetup suggestions\n• Privacy-focused design\n• No fake swipes, only real connections",
            icon: <Sparkles className="w-6 h-6 text-primary"/>,
        },
        {
            year: "Future",
            title: "Future Goals",
            description: "We aim to expand NearMeet into events, offline dating festivals, and global communities that redefine modern love.",
            icon: <Rocket className="w-6 h-6 text-primary"/>,
        },
    ];
    return (<div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              About
            </span>
            <span className="block text-base-content">NearMeet</span>
          </h1>

          <p className="text-lg md:text-2xl text-base-content/80 max-w-3xl mx-auto leading-relaxed">
            Connecting cultures, breaking barriers, and building bridges through
            the power of conversation, meetings & parties.
          </p>

          <div className="mt-10">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg hover:scale-105 transition">
              Discover Our Story
            </button>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-base-content">
            Our Purpose
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-base-200/70 border border-base-300 rounded-3xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-primary/20 p-3 rounded-2xl mr-4">
                  <Target className="w-8 h-8 text-primary"/>
                </div>
                <h3 className="text-2xl font-bold text-base-content">
                  Our Mission
                </h3>
              </div>
              <p className="text-base-content/75 text-lg leading-relaxed">
                At NearMeet, our mission is to move dating beyond screens and
                bring real human connections back to life. We aim to create
                safe, meaningful, and genuine offline experiences where people
                can meet face-to-face, build trust, and discover true
                compatibility in the real world.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-base-200/70 border border-base-300 rounded-3xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-secondary/20 p-3 rounded-2xl mr-4">
                  <Eye className="w-8 h-8 text-secondary"/>
                </div>
                <h3 className="text-2xl font-bold text-base-content">
                  Our Vision
                </h3>
              </div>
              <p className="text-base-content/75 text-lg leading-relaxed">
                To become the most trusted offline dating community where people
                around the world can safely discover meaningful relationships,
                build genuine bonds, and experience love beyond digital screens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-6 md:px-12 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Our Story</h2>
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute left-1/2 w-1 h-full bg-primary/20 -translate-x-1/2"></div>
          <div className="space-y-12">
            {timelineData.map((item, index) => (<div key={index} className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className="md:w-1/2 px-4">
                  <div className="p-6 bg-base-200 rounded-xl shadow-lg">
                    <div className="flex items-center mb-2">
                      <div className="p-2 rounded-full bg-primary/10 mr-3">
                        {item.icon}
                      </div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                    </div>
                    <p className="text-sm text-base-content/70">
                      {item.description}
                    </p>
                    <div className="mt-3 text-sm font-medium text-primary">
                      {item.year}
                    </div>
                  </div>
                </div>
                {/* Dot */}
                <div className="absolute left-1/2 w-6 h-6 bg-primary rounded-full -translate-x-1/2 flex items-center justify-center z-10">
                  <div className="w-3 h-3 bg-base-100 rounded-full"></div>
                </div>
                <div className="md:w-1/2"></div>
              </div>))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 pb-20">
        <div className="bg-primary/10 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Offline Random Dating Journey?
          </h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of singles building real connections through face-to-face conversations, not endless swipes. NearMeet helps you discover meaningful relationships,friends, safely and authentically
          </p>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Get Started <ArrowRight className="w-5 h-5 ml-2"/>
          </Link>
        </div>
      </section>

      {/* Founder Card */}
      <section className="py-20 bg-base-200/50 px-6 flex justify-center">
        <div className="bg-base-100 border border-base-300 p-10 rounded-3xl shadow-2xl max-w-md text-center text-base-content">
          <img src="/profile.jpg" className="w-36 h-36 mx-auto rounded-full mb-4 object-cover border-4 border-primary" alt="sarwan pic"/>
          <h3 className="text-3xl font-extrabold text-base-content">Sarwan Maurya</h3>
          <p className="text-base-content/70 mt-2 font-medium">Founder & Developer</p>
          <div className="flex justify-center gap-6 mt-6 text-indigo-600">
            <a href="https://github.com/sarwan2333" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-800 transition">
              <FaGithub size={30}/>
            </a>
            <a href="https://linkedin.com/in/sarwan-maurya/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-800 transition">
              <FaLinkedin size={30}/>
            </a>
            <a href="https://x.com/sarwan_maurya" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-800 transition">
              <FaTwitter size={30}/>
            </a>
          </div>
        </div>
      </section>
    </div>);
};
export default AboutPage;
