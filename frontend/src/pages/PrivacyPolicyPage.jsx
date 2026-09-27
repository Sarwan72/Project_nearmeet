import React from "react";
import { ShieldCheck, Info, User, Lock, Mail } from "lucide-react";
const PrivacyPolicyPage = () => {
    const sections = [
        {
            icon: <Info className="w-6 h-6 text-primary"/>,
            title: "Introduction",
            content: "Meeting new people is exciting, but you should always be cautious when interacting with someone you don’t know. Use your best judgment and put your safety first — whether you are exchanging initial messages or meeting in person. While you can’t control the actions of others, there are things you can do to help you stay safe during your NearMeet experience."
        },
        {
            icon: <User className="w-6 h-6 text-primary"/>,
            title: "In-Person Safety",
            content: (<ul className="list-disc ml-5 space-y-2">
          <li>
            <strong>Meet in Public Settings:</strong> Always choose public venues for your first few meetings — cafés, community centers, or public parks. Avoid private or secluded areas until you feel fully comfortable.
          </li>
          <li>
            <strong>Inform Someone You Trust:</strong> Tell a friend or family member where you're going, who you're meeting, and when you expect to return. Share your location if possible.
          </li>
          <li>
            <strong>Plan Your Own Transportation:</strong> Drive yourself, use public transport, or a ride-share service. Avoid relying on your date for transportation.
          </li>
          <li>
            <strong>Stay Sober and Alert:</strong> Alcohol and drugs can impair your judgment. Stay aware of your surroundings.
          </li>
          <li>
            <strong>Guard Your Personal Belongings:</strong> Keep your phone, wallet, and valuables with you at all times. Never leave drinks or items unattended.
          </li>
          <li>
            <strong>End the Date If Needed:</strong> Trust your instincts. If uncomfortable, leave early. Your safety comes first.
          </li>
        </ul>)
        },
        {
            icon: <Lock className="w-6 h-6 text-primary"/>,
            title: "General Offline Safety Tips",
            content: (<ul className="list-disc ml-5 space-y-2">
          <li>
            <strong>Don’t Share Sensitive Info Too Soon:</strong> Avoid sharing home address, financial info, or private details until trust is built.
          </li>
          <li>
            <strong>Be Wary of Overly Pushy Behavior:</strong> Anyone pressuring for quick physical contact or personal info is a red flag.
          </li>
          <li>
            <strong>Observe Body Language and Vibe:</strong> Trust tone, energy, and body language. If something feels off, it might be.
          </li>
          <li>
            <strong>Exit Strategy Ready:</strong> Have a plan to leave quickly if needed.
          </li>
        </ul>)
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-primary"/>,
            title: "Consent and Communication",
            content: (<ul className="list-disc ml-5 space-y-2">
          <li>
            <strong>Always Ask, Never Assume:</strong> Consent is critical. Respect a "no" or hesitation immediately.
          </li>
          <li>
            <strong>Talk Openly and Respectfully:</strong> Discuss boundaries and comfort levels early.
          </li>
          <li>
            <strong>Respect Boundaries & Content Rules:</strong> Public profiles must remain appropriate. Private messages require consent.
          </li>
          <li>
            <strong>Share Thoughtfully:</strong> Keep personal information private. Never share sensitive data.
          </li>
          <li>
            <strong>Avoid Harmful Content:</strong> Violent or disturbing content has no place on NearMeet.
          </li>
          <li>
            <strong>Be Authentic:</strong> No fake profiles or impersonations.
          </li>
          <li>
            <strong>Adults Only:</strong> You must be 18+ to use NearMeet.
          </li>
          <li>
            <strong>Follow the Law:</strong> Illegal activity is prohibited.
          </li>
          <li>
            <strong>One Person = One Account:</strong> Don’t share accounts or create multiple accounts.
          </li>
          <li>
            <strong>Use NearMeet Responsibly:</strong> No spam, scams, or misuse of support system.
          </li>
        </ul>)
        },
        {
            icon: <Mail className="w-6 h-6 text-primary"/>,
            title: "Reporting & Enforcement",
            content: (<>
          <p className="mb-2">
            <strong>Reporting:</strong> See something that violates rules? Report it. Your report is confidential and helps keep NearMeet safe.
          </p>
          <p>
            <strong>Enforcement & Impact:</strong> Violations may result in removal from the platform without refund. Includes off-app actions involving NearMeet users.
          </p>
          <p className="mt-2">We aim to foster a respectful, inclusive space for all. Let’s keep NearMeet a place where real connections thrive.</p>
        </>)
        }
    ];
    return (<div className="min-h-screen bg-base-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ShieldCheck className="w-8 h-8 text-primary"/>
          </div>
          <h1 className="text-4xl font-bold text-base-content mb-4 tracking-tight">
            Privacy & Safety Policy
          </h1>
          <p className="text-lg text-base-content/70">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })}
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-6">
          {sections.map((section, index) => (<div key={index} className="bg-base-200/70 border border-base-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">{section.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-base-content mb-3">
                    {section.title}
                  </h3>
                  <div className="text-base-content/80 leading-relaxed">{section.content}</div>
                </div>
              </div>
            </div>))}
        </div>
      </div>
    </div>);
};
export default PrivacyPolicyPage;
