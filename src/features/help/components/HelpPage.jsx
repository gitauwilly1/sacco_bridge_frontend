import React, { useState } from 'react';
import { HelpCircle, Mail, Phone, MessageSquare, Search, ChevronDown, ChevronUp, ShieldCheck, Landmark, Users2, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const faqs = [
  {
    category: 'investments',
    question: 'How do I link my SACCO account to Sacco Bridge?',
    answer: 'Navigate to your Profile page, click on the Link SACCO button, select your SACCO from the list, and enter your member identification number. We will verify your credentials securely with your SACCO API system.',
  },
  {
    category: 'investments',
    question: 'How does secondary market share trading work?',
    answer: 'Members holding shares in supported SACCOs can create a Liquidity Request to sell their shares at a negotiated price. Other verified members can view these opportunities, express interest, enter negotiation rooms, and complete transactions securely via escrow.',
  },
  {
    category: 'chamas',
    question: 'What is a Chama and how do I manage one?',
    answer: 'A Chama is a traditional cooperative investment group. Sacco Bridge allows you to create groups, invite members, schedule meetings, host polls, track recurring contributions, and request collective loans backed by SACCO share holdings.',
  },
  {
    category: 'security',
    question: 'How is transaction security and settlement guaranteed?',
    answer: 'Sacco Bridge utilizes a double-lien escrow mechanism. When a trade is accepted, the seller\'s SACCO shares are locked, and the buyer\'s cash funds are held in lien. Once the transfer is approved by the cooperative operations team, the shares are credited and the funds released simultaneously.',
  },
  {
    category: 'security',
    question: 'What happens if a dispute arises during a transaction?',
    answer: 'If there is any disagreement, either party can click "Raise Dispute" on the transaction page. This locks the escrow lien and escalates the transaction to Platform Support agents who review the audit logs and ledger entries to resolve the dispute fairly.',
  },
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-up">
      
      {/* Header Banner */}
      <div className="text-center py-8 px-6 bg-slate-900 rounded-2xl text-white shadow-elevated relative overflow-hidden">
        <div className="absolute inset-0 bg-auth-gradient opacity-10 pointer-events-none" />
        <h1 className="text-2xl font-bold font-heading mb-2">Help Center & FAQ</h1>
        <p className="text-sm text-gray-300 max-w-md mx-auto mb-6">
          Find fast answers to common questions about Sacco Bridge operations, chamas, and share settlements.
        </p>
        
        {/* Search Box */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search FAQs (e.g. escrow, linking, chama)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 bg-white text-slate border-none rounded-xl w-full shadow-medium text-xs font-semibold focus-visible:ring-terracotta"
          />
        </div>
      </div>

      {/* Category Toggles */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none justify-center">
        {[
          { id: 'all', label: 'All FAQs', icon: HelpCircle },
          { id: 'investments', label: 'Investments', icon: Landmark },
          { id: 'chamas', label: 'Chama Groups', icon: Users2 },
          { id: 'security', label: 'Trust & Escrow', icon: ShieldCheck },
        ].map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setExpandedIndex(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-terracotta text-white shadow-subtle'
                  : 'bg-sand-light border border-sand/40 text-slate hover:bg-sand/35 hover:text-terracotta'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3.5">
        <h2 className="text-base font-bold text-slate px-1">Frequently Asked Questions</h2>
        {filteredFaqs.length > 0 ? (
          <div className="space-y-2.5">
            {filteredFaqs.map((faq, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <Card 
                  key={index} 
                  className={`border-sand/40 overflow-hidden transition-all duration-200 ${
                    isExpanded ? 'ring-1 ring-terracotta/20 bg-sand-light/25 shadow-subtle' : 'hover:border-terracotta/25'
                  }`}
                >
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleExpand(index)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-slate text-xs sm:text-sm hover:text-terracotta transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4.5 w-4.5 text-terracotta flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4.5 w-4.5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-500 leading-relaxed border-t border-sand/30 bg-white/40">
                        {faq.answer}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-sand-light/30 rounded-xl border border-dashed border-sand">
            <Info className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400 font-semibold">No FAQs found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div className="pt-4 border-t border-sand/40">
        <h2 className="text-base font-bold text-slate text-center mb-6">Still need assistance?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card: Email */}
          <Card className="border-sand/50 shadow-subtle hover:shadow-md transition-shadow">
            <CardContent className="p-5 text-center flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-sand-light flex items-center justify-center">
                <Mail className="h-5 w-5 text-terracotta" />
              </div>
              <div>
                <h3 className="font-bold text-slate text-xs sm:text-sm">Email Support</h3>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Response within 24 hours</p>
              </div>
              <a 
                href="mailto:support@saccobridge.co.ke"
                className="text-xs font-semibold text-terracotta hover:underline mt-1"
              >
                support@saccobridge.co.ke
              </a>
            </CardContent>
          </Card>

          {/* Card: Phone */}
          <Card className="border-sand/50 shadow-subtle hover:shadow-md transition-shadow">
            <CardContent className="p-5 text-center flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-sand-light flex items-center justify-center">
                <Phone className="h-5 w-5 text-terracotta" />
              </div>
              <div>
                <h3 className="font-bold text-slate text-xs sm:text-sm">Telephone Hotline</h3>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Mon - Fri, 8 AM - 5 PM</p>
              </div>
              <a 
                href="tel:+254700000000"
                className="text-xs font-semibold text-terracotta hover:underline mt-1"
              >
                +254 700 000 000
              </a>
            </CardContent>
          </Card>

          {/* Card: WhatsApp */}
          <Card className="border-sand/50 shadow-subtle hover:shadow-md transition-shadow">
            <CardContent className="p-5 text-center flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-sand-light flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-terracotta" />
              </div>
              <div>
                <h3 className="font-bold text-slate text-xs sm:text-sm">Live WhatsApp Chat</h3>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Fast responses on mobile</p>
              </div>
              <a 
                href="https://wa.me/254700000000" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-semibold text-terracotta hover:underline mt-1"
              >
                Start Quick Chat
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
      
    </div>
  );
}
