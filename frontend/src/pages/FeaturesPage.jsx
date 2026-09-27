import React, { useState } from "react";
import { Users, MapPin, Shield, Calendar, HeartHandshake, Star, CheckCircle, Coffee, Clock, } from "lucide-react";
const Features = () => {
    const [activeFeature, setActiveFeature] = useState(0);
    // Main features for NearMeet
    const mainFeatures = [
        {
            icon: <Users className="w-8 h-8"/>,
            title: "Meet Real People",
            description: "Connect with verified singles near you for genuine offline dating.",
            details: "NearMeet helps you discover like-minded people around your city. We focus on real conversations and building authentic connections — no endless swipes.",
            benefits: [
                "Verified profiles",
                "Nearby connections",
                "Authentic interactions",
                "Meaningful relationships",
            ],
        },
        {
            icon: <MapPin className="w-8 h-8"/>,
            title: "Find Safe Spots",
            description: "Choose from trusted hotels, cafés, and public spaces.",
            details: "Our platform suggests safe and verified places for your offline meetups. Whether it’s a cozy café, a quiet restaurant, or a trusted hotel, your safety comes first.",
            benefits: ["Trusted venues", "Easy bookings", "Convenient locations", "Privacy guaranteed"],
        },
        {
            icon: <Calendar className="w-8 h-8"/>,
            title: "Book Meetup Slots",
            description: "Plan your dates with simple slot-based bookings.",
            details: "No more confusion about timing. Pick a slot that works for both of you and meet at the suggested venue without hassle.",
            benefits: ["Flexible scheduling", "Time-slot booking", "Easy cancellations", "Reminders"],
        },
        {
            icon: <HeartHandshake className="w-8 h-8"/>,
            title: "Build Real Bonds",
            description: "Go beyond texting — build relationships offline.",
            details: "We believe true chemistry can only be felt in person. NearMeet creates opportunities to meet face-to-face and experience real emotions.",
            benefits: ["Face-to-face dating", "Meaningful talks", "Shared experiences", "Long-term bonds"],
        },
    ];
    // Technical features for trust
    const techFeatures = [
        { icon: <Shield className="w-6 h-6"/>, title: "Verified Profiles", desc: "Every user goes through ID & photo verification" },
        { icon: <Coffee className="w-6 h-6"/>, title: "Trusted Venues", desc: "We partner with safe public & private spaces" },
        { icon: <Clock className="w-6 h-6"/>, title: "Flexible Timing", desc: "Pick time slots that match your lifestyle" },
        { icon: <Star className="w-6 h-6"/>, title: "Quality Matches", desc: "Smart recommendations based on interests" },
    ];
    return (<div className="min-h-screen ">
      {/* Hero Section */}
      <section className="py-16 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 ">
          NearMeet Features
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
          Discover how NearMeet makes offline dating simple, safe, and meaningful.
        </p>
      </section>

      {/* Main Features */}
      <section className="py-12 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-base-content">
          Core Features
        </h2>
        <div className="grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
          {/* Feature Navigation */}
          <div className="space-y-4">
            {mainFeatures.map((feature, index) => (<div key={index} onClick={() => setActiveFeature(index)} className={`cursor-pointer p-6 rounded-2xl transition-all duration-300 border ${activeFeature === index
                ? "bg-primary text-primary-content border-primary shadow-lg"
                : "bg-base-100 border-base-300 shadow hover:bg-base-200 text-base-content"}`}>
                <div className="flex items-center mb-3">
                  <div className={`p-2 rounded-lg mr-4 ${activeFeature === index ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                </div>
                <p className={activeFeature === index ? "text-primary-content/90" : "text-base-content/70"}>
                  {feature.description}
                </p>
              </div>))}
          </div>

          {/* Feature Detail Panel */}
          <div className="bg-base-100 border border-base-300 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="bg-primary p-4 rounded-2xl mr-4 text-primary-content shadow-md">
                {mainFeatures[activeFeature].icon}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-base-content">
                {mainFeatures[activeFeature].title}
              </h3>
            </div>
            <p className="text-base-content/80 text-lg mb-6 leading-relaxed">
              {mainFeatures[activeFeature].details}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mainFeatures[activeFeature].benefits.map((benefit, i) => (<div key={i} className="flex items-center bg-base-200/70 border border-base-300/60 p-3.5 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-primary mr-2 flex-shrink-0"/>
                  <span className="text-base-content text-sm font-medium">{benefit}</span>
                </div>))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-16 px-4 bg-base-200/40">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-base-content">
          Why Choose NearMeet?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {techFeatures.map((feature, i) => (<div key={i} className="bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all">
              <div className="bg-primary/10 p-3 rounded-xl w-fit mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-base-content mb-2">{feature.title}</h3>
              <p className="text-base-content/70 text-sm leading-relaxed">{feature.desc}</p>
            </div>))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="bg-gradient-to-r from-rose-600 to-pink-500 text-white rounded-3xl p-10 max-w-3xl mx-auto shadow-lg">
          <HeartHandshake className="w-12 h-12 mx-auto mb-4"/>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Meet Someone Special?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join NearMeet today and start building real connections offline.
          </p>
          <button className="bg-white text-rose-600 px-8 py-4 rounded-full font-semibold text-lg shadow hover:scale-105 transition">
            Get Started
          </button>
        </div>
      </section>
    </div>);
};
export default Features;
