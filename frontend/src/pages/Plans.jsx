import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { upgradePlan, verifyPayment } from '../features/auth/authSlice';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Shield } from 'lucide-react';
import { API_BASE_URL } from '../configs/api';


const Plans = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '₹1',
      storage: '1 GB',
      features: ['Secure Cloud Storage', 'Basic Support', 'Community Access'],
      icon: <Shield size={40} color="#64748b" />,
      color: '#64748b'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '₹50',
      storage: '2 GB',
      features: ['Faster Uploads', 'Priority Support', 'Advanced Security', 'File Versioning'],
      icon: <Zap size={40} color="#3b82f6" />,
      color: '#3b82f6',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '₹100',
      storage: '5 GB',
      features: ['Unlimited Bandwidth', '24/7 Dedicated Support', 'Enterprise Security', 'API Access'],
      icon: <Crown size={40} color="#f59e0b" />,
      color: '#f59e0b'
    }
  ];

  const handleUpgrade = async (planId) => {
    if (user.plan === planId) return;

    try {
      // 1. Get Razorpay Key
      const keyRes = await fetch(`${API_BASE_URL}/api/payment/get-key`, { credentials: 'include' });
      if (!keyRes.ok) throw new Error("Failed to fetch Razorpay Key. Please check server logs.");
      const { key } = await keyRes.json();

      // 2. Create Order
      const orderRes = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
        credentials: 'include'
      });
      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.message || "Failed to create payment order.");
      }
      const { order } = await orderRes.json();

      if (!order) throw new Error("Could not create order details.");

      // 3. Open Razorpay
      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: "CLOUDAVI",
        description: `Upgrade to ${planId.toUpperCase()} Plan`,
        order_id: order.id,
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "UPI / QR",
                instruments: [
                  {
                    method: "upi",
                    vpa: true,    // This enables the UPI ID input field
                    collect: true // This enables the QR code
                  },
                ],
              },
            },
            sequence: ["block.upi", "block.card"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        handler: async (response) => {
          try {
            // 4. Verify Payment
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId
            };
            
            const result = await dispatch(verifyPayment(verifyData)).unwrap();
            if (result) {
              alert("Upgrade Successful! Your storage has been increased.");
            }
          } catch (verifyErr) {
            console.error("Verification Error:", verifyErr);
            alert(`Payment verification failed: ${verifyErr.message || verifyErr}`);
          }
        },
        prefill: {
          name: user.fullname,
          email: user.email,
        },
        theme: {
          color: "#ef4444",
        },
        modal: {
          ondismiss: () => {
            console.log("Checkout modal closed");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment Step Failed:", error);
      alert(`Error: ${error.message || "Payment cancelled or failed."}`);
    }
  };

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>Choose Your Plan</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Upgrade your storage and unlock premium features today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ y: -10 }}
            className="glass-panel"
            style={{
              padding: '3rem 2rem',
              borderRadius: '32px',
              border: plan.popular ? `2px solid ${plan.color}` : '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              background: plan.popular ? 'var(--bg-secondary)' : 'transparent'
            }}
          >
            {plan.popular && (
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: plan.color, color: 'white', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                POPULAR
              </div>
            )}
            <div style={{ marginBottom: '1.5rem' }}>{plan.icon}</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{plan.name}</h2>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              {plan.price}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>/mo</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: plan.color, marginBottom: '2rem' }}>{plan.storage} Storage</div>

            <div style={{ width: '100%', marginBottom: '2.5rem' }}>
              {plan.features.map((feature, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `${plan.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={12} color={plan.color} />
                  </div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={loading || user.plan === plan.id}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '16px',
                border: 'none',
                background: user.plan === plan.id ? 'var(--border-color)' : plan.color,
                color: 'white',
                fontWeight: '800',
                fontSize: '1rem',
                cursor: user.plan === plan.id ? 'default' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {user.plan === plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Plans;
