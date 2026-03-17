import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import RightPanel from "../components/RightPanel";

function Payments() {
    const [selectedPlan, setSelectedPlan] = useState(null);

    const plans = [
        {
            id: "monthly",
            name: "Monthly",
            price: 9.99,
            period: "month",
            features: [
                "Unlimited problem access",
                "AI assistance anytime",
                "Progress tracking",
                "Company problems"
            ]
        },
        {
            id: "yearly",
            name: "Yearly",
            price: 79.99,
            period: "year",
            popular: true,
            savings: "Save 33%",
            features: [
                "Everything in Monthly",
                "Priority support",
                "Exclusive tutorials",
                "Certificate of completion",
                "Early access to new features"
            ]
        }
    ];

    return (
        <>
            <Navbar />
            <div className="dashboard-layout">
                <Sidebar />
                
                <main className="dashboard-main">
                    <div className="payments-container">
                        <div className="payments-header">
                            <h1 className="page-title">💎 Upgrade to Premium</h1>
                            <p>Unlock your full potential with SkillForge Premium</p>
                        </div>

                        <div className="plans-grid">
                            {plans.map(plan => (
                                <div 
                                    key={plan.id} 
                                    className={`plan-card ${plan.popular ? "popular" : ""} ${selectedPlan === plan.id ? "selected" : ""}`}
                                    onClick={() => setSelectedPlan(plan.id)}
                                >
                                    {plan.popular && <span className="popular-badge">Most Popular</span>}
                                    {plan.savings && <span className="savings-badge">{plan.savings}</span>}
                                    
                                    <h2 className="plan-name">{plan.name}</h2>
                                    <div className="plan-price">
                                        <span className="currency">$</span>
                                        <span className="amount">{plan.price}</span>
                                        <span className="period">/{plan.period}</span>
                                    </div>

                                    <ul className="plan-features">
                                        {plan.features.map((feature, index) => (
                                            <li key={index}>
                                                <span className="check">✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button className={`plan-btn ${plan.popular ? "primary" : ""}`}>
                                        {selectedPlan === plan.id ? "Selected" : "Choose Plan"}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="faq-section">
                            <h2>Frequently Asked Questions</h2>
                            <div className="faq-grid">
                                <div className="faq-item">
                                    <h3>Can I cancel anytime?</h3>
                                    <p>Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
                                </div>
                                <div className="faq-item">
                                    <h3>Is there a free trial?</h3>
                                    <p>We offer a 7-day free trial for new users. You can cancel anytime during the trial period.</p>
                                </div>
                                <div className="faq-item">
                                    <h3>What payment methods do you accept?</h3>
                                    <p>We accept all major credit cards, debit cards, and PayPal.</p>
                                </div>
                                <div className="faq-item">
                                    <h3>Can I switch plans?</h3>
                                    <p>Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.</p>
                                </div>
                            </div>
                        </div>

                        <div className="testimonials">
                            <h2>What Our Users Say</h2>
                            <div className="testimonial-grid">
                                <div className="testimonial-card">
                                    <p>"SkillForge Premium helped me land my dream job at Google! The AI assistance is incredibly helpful."</p>
                                    <span>- Sarah K., Software Engineer</span>
                                </div>
                                <div className="testimonial-card">
                                    <p>"The company-specific problems were a game changer for my interview prep."</p>
                                    <span>- Mike T., Product Manager</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <RightPanel />
            </div>

            <style>{`
                .payments-container { max-width: 1000px; }
                .payments-header { text-align: center; margin-bottom: 40px; }
                .payments-header p { color: #888; margin-top: 8px; }
                .plans-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 48px; }
                .plan-card { background: #1a1a1a; border-radius: 16px; padding: 32px; cursor: pointer; transition: all 0.3s; position: relative; border: 2px solid transparent; }
                .plan-card:hover { transform: translateY(-4px); }
                .plan-card.popular { border-color: #ffa116; }
                .plan-card.selected { border-color: #ffa116; background: #1f1f1f; }
                .popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #ffa116; color: #000; padding: 4px 16px; border-radius: 12px; font-size: 12px; font-weight: bold; }
                .savings-badge { position: absolute; top: 12px; right: 12px; background: #0f3; color: #000; padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: bold; }
                .plan-name { font-size: 24px; margin-bottom: 16px; }
                .plan-price { margin-bottom: 24px; }
                .currency { font-size: 20px; vertical-align: top; }
                .amount { font-size: 48px; font-weight: bold; }
                .period { color: #888; }
                .plan-features { list-style: none; margin-bottom: 24px; }
                .plan-features li { padding: 8px 0; color: #ccc; display: flex; gap: 8px; }
                .check { color: #0f3; }
                .plan-btn { width: 100%; padding: 14px; border-radius: 8px; border: 2px solid #ffa116; background: transparent; color: #ffa116; font-weight: bold; cursor: pointer; transition: all 0.2s; }
                .plan-btn.primary { background: #ffa116; color: #000; }
                .plan-btn:hover { transform: scale(1.02); }
                .faq-section, .testimonials { margin-bottom: 40px; }
                .faq-section h2, .testimonials h2 { margin-bottom: 24px; }
                .faq-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
                .faq-item { background: #1a1a1a; padding: 20px; border-radius: 12px; }
                .faq-item h3 { font-size: 16px; margin-bottom: 8px; color: #ffa116; }
                .faq-item p { color: #888 14px;; font-size: line-height: 1.5; }
                .testimonial-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
                .testimonial-card { background: #1a1a1a; padding: 20px; border-radius: 12px; }
                .testimonial-card p { font-style: italic; margin-bottom: 12px; color: #ccc; }
                .testimonial-card span { color: #888; font-size: 14px; }
                @media (max-width: 768px) { .plans-grid, .faq-grid, .testimonial-grid { grid-template-columns: 1fr; } }
            `}</style>
        </>
    );
}

export default Payments;
