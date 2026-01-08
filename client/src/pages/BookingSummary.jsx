import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { jsPDF } from 'jspdf';
import { CreditCard, Download, CheckCircle, ShieldCheck, Lock, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode'; 
import { assets } from '../assets/assets';

const BookingSummary = () => {
  const { bookingId } = useParams();
  const { axios, user } = useAppContext();
  const [booking, setBooking] = useState(null);
  const [step, setStep] = useState('summary'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardType, setCardType] = useState('visa');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await axios.get(`/api/booking/details/${bookingId}`);
        if (data.success) setBooking(data.booking);
      } catch (err) { toast.error("Booking not found"); }
    };
    fetchDetails();
  }, [bookingId]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const { data } = await axios.post('/api/booking/confirm-payment', { bookingId });
      if (data.success) {
        toast.success("Payment successful! Your tickets are ready.");
        setBooking(data.booking);
        setStep('success'); 
      } else {
        toast.error(data.message || "Payment verification failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateInvoice = async (data) => {
    if (!data) return toast.error("No booking data found");

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // FIXED: Robust Image to Base64 converter
    const getBase64ImageFromURL = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.setAttribute("crossOrigin", "anonymous"); 
        img.src = url + (url.includes('?') ? '&' : '?') + 't=' + new Date().getTime(); // Anti-cache bypass
        
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg", 0.8)); // 0.8 quality to keep PDF size small
        };
        img.onerror = (error) => reject(error);
      });
    };

    try {
      toast.loading("Generating your ticket...");
      
      // 1. Setup Background
      doc.setFillColor(15, 15, 15);
      doc.rect(0, 0, 210, 297, 'F');

      // 2. Handle Logo (Centered and adjusted)
      if (assets && assets.logo) {
        doc.addImage(assets.logo, 'PNG', 85, 5, 40, 20); // Adjusted height for better aspect ratio
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("MOVIE BOOKING CONFIRMATION", 105, 32, { align: 'center' });
      doc.setDrawColor(60, 60, 60);
      doc.line(20, 38, 190, 38);

      // 3. FIXED: Movie Poster Logic
      const posterUrl = `https://image.tmdb.org/t/p/w500${data.show.movie.poster_path}`;
      try {
        const posterBase64 = await getBase64ImageFromURL(posterUrl);
        doc.addImage(posterBase64, 'JPEG', 20, 45, 50, 75); 
      } catch (e) {
        console.error("Poster load error:", e);
        // Fallback: draw a colored box if image is blocked
        doc.setFillColor(30, 30, 30);
        doc.rect(20, 45, 35, 52, 'F');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text("POSTER", 37.5, 71, { align: 'center' });
      }

      // 4. Booking Details (Same as before)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text("Booking Details", 80, 50);
      doc.setFontSize(9);
      doc.setTextColor(180, 180, 180);
      doc.text(`Movie Title: ${data.show.movie.title}`, 80, 58);
      doc.text(`Booking ID: #${data._id.toUpperCase()}`, 80, 64);
      doc.text(`Date: ${new Date(data.show.showDateTime).toLocaleDateString()}`, 80, 70);
      
      const showTime = new Date(data.show.showDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      doc.text(`Time: ${showTime}`, 80, 76); 

      doc.text(`Cinema: Prime IMAX - B2`, 80, 84);
      doc.setTextColor(255, 61, 0); 
      doc.text(`Seats: ${data.bookedSeats.join(', ')}`, 80, 90);

      // 5. Ticket Table (Moved down slightly to give room for poster)
      autoTable(doc, {
        startY: 140,
        margin: { left: 20, right: 20 },
        head: [['Type', 'Quantity', 'Price/Ticket', 'Total']],
        body: [
          ['Standard Tickets', data.bookedSeats.length.toString(), `$${data.show.showPrice}`, `$${data.amount}.00`],
          ['Booking Fee', '1', '$0.00', '$0.00'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [30, 30, 30], textColor: [255, 61, 0], fontSize: 9 },
        styles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontSize: 8, cellPadding: 4, lineColor: [40, 40, 40] },
        columnStyles: { 3: { halign: 'right' } },
      });

      // 6, 7, 8: QR Code & Payment Summary (Moved further down as requested)
      const finalY = doc.lastAutoTable.finalY + 30; // Increased spacing to move to bottom of page

      const qrData = `VALID_TICKET_${data._id}`;
      const qrCodeBase64 = await QRCode.toDataURL(qrData, { 
          margin: 1, 
          color: { dark: '#FFFFFF', light: '#00000000' } 
      });
      doc.addImage(qrCodeBase64, 'PNG', 150, finalY - 5, 35, 35);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.text("Payment Summary", 20, finalY);
      doc.setFontSize(9);
      doc.setTextColor(180, 180, 180);
      doc.text(`Subtotal: $${data.amount}.00`, 20, finalY + 8);
      doc.setTextColor(255, 61, 0);
      doc.setFontSize(11);
      doc.text(`Grand Total: $${data.amount}.00`, 20, finalY + 18);

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("Scan for E-Ticket & Entry", 167.5, finalY + 35, { align: 'center' });

      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for choosing PrimeShow!", 105, 285, { align: 'center' });

      toast.dismiss();
      doc.save(`PrimeShow_Ticket_${data._id.substring(0, 6)}.pdf`);

    } catch (error) {
      toast.dismiss();
      console.error("PDF Error:", error);
      toast.error("Error generating full ticket. Saving basic version.");
      doc.save(`PrimeShow_Invoice_Basic.pdf`);
    }
  };

  if (!booking) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pt-50 pb-20 px-4 flex justify-center min-h-screen bg-[#050505] text-white">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Order Details (Cinema Style) */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-xl">
                <img 
                    src={booking.show.movie.poster_path ? `https://image.tmdb.org/t/p/w500${booking.show.movie.poster_path}` : 'https://via.placeholder.com/300x450'} 
                    alt="poster" 
                    className="w-full rounded-2xl mb-6 shadow-2xl"
                />
                <h2 className="text-xl font-bold mb-2">{booking.show.movie.title}</h2>
                <div className="space-y-3 text-sm text-gray-400">
                    <p className="flex justify-between"><span>Date:</span> <span className="text-white">{new Date(booking.show.showDateTime).toLocaleDateString()}</span></p>
                    <p className="flex justify-between"><span>Seats:</span> <span className="text-primary font-bold">{booking.bookedSeats.join(', ')}</span></p>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center text-lg">
                        <span>Total Payable</span>
                        <span className="text-primary font-black text-2xl">${booking.amount}</span>
                    </div>
                </div>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center gap-3">
                <ShieldCheck className="text-primary" size={24}/>
                <p className="text-xs text-gray-300">Your transaction is protected by 256-bit SSL encryption.</p>
            </div>
        </div>

        {/* Right Side: Gateway Flow */}
        <div className="lg:col-span-8">
            <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                
                {/* Step Header */}
                <div className="flex border-b border-white/5">
                    {['Review', 'Payment', 'Finish'].map((label, i) => (
                        <div key={label} className={`flex-1 py-4 text-center text-[10px] uppercase tracking-widest font-bold ${
                            (i === 0 && step === 'summary') || (i === 1 && step === 'payment') || (i === 2 && step === 'success') ? 'text-primary bg-primary/5' : 'text-gray-600'
                        }`}>
                            {i + 1}. {label}
                        </div>
                    ))}
                </div>

                <div className="p-8 md:p-12">
                {step === 'summary' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-3xl font-bold mb-2">Review Your Booking</h2>
                    <p className="text-gray-500 mb-8 text-sm">Please verify the details before proceeding to payment.</p>
                    
                    <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Customer</p>
                                <p className="font-medium">{user.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Location</p>
                                <p className="font-medium">PrimeShow IMAX - Theater B3</p>
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={() => setStep('payment')} className="w-full bg-primary hover:bg-orange-700 h-16 rounded-2xl font-black text-lg transition-all shadow-lg shadow-primary/20">
                        Continue to Payment
                    </button>
                    </div>
                )}

                {step === 'payment' && (
                    <form onSubmit={handlePayment} className="animate-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center gap-4 mb-8">
                        <button type="button" onClick={() => setStep('summary')} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
                            <ChevronLeft size={24}/>
                        </button>
                        <h2 className="text-2xl font-bold">Secure Payment</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                             {/* Card Type Selector */}
                            <div className="flex gap-3">
                                {['visa', 'mastercard', 'amex'].map((type) => (
                                <div 
                                    key={type}
                                    onClick={() => setCardType(type)}
                                    className={`flex-1 border p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-center ${cardType === type ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5 opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={`https://img.icons8.com/color/48/${type === 'amex' ? 'amex' : type}.png`} alt={type} className="h-6" />
                                </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="text-[10px] text-gray-500 ml-1 mb-1 block uppercase font-bold">Card Number</label>
                                    <div className="relative">
                                        <input type="text" required placeholder="0000 0000 0000 0000" className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-primary transition-all font-mono text-lg" />
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] text-gray-500 ml-1 mb-1 block uppercase font-bold">Expiry</label>
                                        <input type="text" placeholder="MM / YY" maxLength="5" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-primary text-center" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 ml-1 mb-1 block uppercase font-bold">CVV</label>
                                        <input type="password" placeholder="***" maxLength="3" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-primary text-center" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Card Preview */}
                        <div className="hidden md:flex flex-col justify-center">
                            <div className="aspect-[1.58/1] w-full bg-gradient-to-br from-gray-800 to-black rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <img src={`https://img.icons8.com/color/96/${cardType === 'amex' ? 'amex' : cardType}.png`} alt="logo" className="w-20" />
                                </div>
                                <div className="w-12 h-10 bg-yellow-500/80 rounded-lg mb-8 shadow-inner"></div>
                                <div className="space-y-4">
                                    <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                                    <div className="h-4 w-1/2 bg-white/10 rounded"></div>
                                </div>
                                <div className="absolute bottom-8 left-8">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Card Holder</p>
                                    <p className="text-sm font-bold">{user.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button disabled={isProcessing} className="w-full bg-primary py-5 rounded-2xl font-black mt-10 flex items-center justify-center gap-3 text-lg hover:shadow-primary/30 shadow-xl transition-all disabled:opacity-50">
                        {isProcessing ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <><Lock size={20}/> Pay Now ${booking.amount}</>
                        )}
                    </button>
                    </form>
                )}

                {step === 'success' && (
                    <div className="text-center animate-in zoom-in-95 duration-700 py-10">
                        <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/20 border border-green-500/30">
                            <CheckCircle size={48} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-4xl font-black mb-3">Booking Confirmed!</h2>
                        <p className="text-gray-400 mb-10 max-w-sm mx-auto">We've sent your tickets and a receipt to <span className="text-white font-medium">{user.email}</span></p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                            <button onClick={() => generateInvoice(booking)} className="bg-white/10 hover:bg-white/20 h-14 rounded-2xl font-bold flex items-center justify-center gap-2 border border-white/5 transition-all">
                                <Download size={20}/> Download Invoice
                            </button>
                            <button onClick={() => navigate('/my-bookings')} className="bg-primary hover:bg-orange-700 h-14 rounded-2xl font-bold transition-all">
                                Go to My Bookings
                            </button>
                        </div>
                    </div>
                )}
                </div>
            </div>
            <div className="mt-8 text-center text-gray-600 text-[10px] uppercase tracking-[0.2em]">
                Secure Payment Powered by PrimeShow Gateway © 2024
            </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;