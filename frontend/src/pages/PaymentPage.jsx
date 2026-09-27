import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast, { Toaster } from "react-hot-toast";
const PaymentPage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const status = params.get("status");
    const bookingId = params.get("bookingId");
    const [loading, setLoading] = useState(status === "success");
    const [confirmedBooking, setConfirmedBooking] = useState(null);
    const [payError, setPayError] = useState("");
    useEffect(() => {
        const completePayment = async () => {
            if (status !== "success" || !bookingId)
                return;
            try {
                setLoading(true);
                // Mark booking as paid in backend database
                const res = await axiosInstance.post(`/bookings/${bookingId}/pay`);
                if (res.data?.booking) {
                    setConfirmedBooking(res.data.booking);
                }
                toast.success("Payment confirmed! Chat is now unlocked. 🎉");
            }
            catch (err) {
                console.error("Payment confirmation failed:", err);
                setPayError(err.response?.data?.message || "Payment confirmation error");
            }
            finally {
                setLoading(false);
            }
        };
        completePayment();
    }, [status, bookingId]);
    if (loading) {
        return (<div className="h-screen flex flex-col items-center justify-center bg-base-100 text-base-content p-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-base-content/70 mt-4 text-base font-medium">
          Confirming Stripe payment with venue...
        </p>
      </div>);
    }
    if (status === "success") {
        const vendorId = confirmedBooking?.vendor_id || confirmedBooking?.vendorId;
        return (<div className="min-h-screen flex items-center justify-center bg-base-200 p-6 text-base-content">
        <Toaster position="top-center"/>
        <div className="card bg-base-100 border border-base-300 shadow-2xl rounded-3xl p-8 sm:p-10 text-center max-w-md w-full animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12"/>
          </div>

          <span className="badge badge-success text-xs font-bold uppercase tracking-wider mb-2">
            Stripe Payment Confirmed
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
            Table Reserved & Paid!
          </h1>
          <p className="text-sm text-base-content/70 mt-2 leading-relaxed">
            Your table reservation has been confirmed. You can now chat directly with the venue team in real-time.
          </p>

          <div className="divider my-6"></div>

          <div className="space-y-3">
            {vendorId ? (<Link to={`/chat/${vendorId}`} className="btn btn-primary w-full rounded-2xl font-bold shadow-md shadow-primary/25 gap-2">
                <MessageSquare className="w-4 h-4"/>
                Chat with Venue Now
              </Link>) : (<Link to="/hotels" className="btn btn-primary w-full rounded-2xl font-bold shadow-md shadow-primary/25 gap-2">
                View Reserved Venue
              </Link>)}

            <Link to="/hotels" className="btn btn-ghost w-full rounded-2xl text-xs font-semibold text-base-content/70 hover:bg-base-200">
              Back to Hotels
            </Link>
          </div>
        </div>
      </div>);
    }
    if (status === "cancel" || status === "failed") {
        return (<div className="min-h-screen flex items-center justify-center bg-base-200 p-6 text-base-content">
        <div className="card bg-base-100 border border-base-300 shadow-2xl rounded-3xl p-8 sm:p-10 text-center max-w-md w-full animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-error/15 text-error flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12"/>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
            Payment Incomplete
          </h1>
          <p className="text-sm text-base-content/70 mt-2 leading-relaxed">
            The payment was cancelled or could not be completed. You can try again from the venue page.
          </p>

          <div className="divider my-6"></div>

          <Link to="/hotels" className="btn btn-primary w-full rounded-2xl font-bold shadow-md">
            Back to Hotels
          </Link>
        </div>
      </div>);
    }
    return (<div className="min-h-screen flex items-center justify-center bg-base-200 p-6 text-base-content">
      <div className="card bg-base-100 border border-base-300 p-8 rounded-3xl text-center max-w-sm">
        <p className="text-sm text-base-content/70 mb-4">Invalid or expired payment link.</p>
        <Link to="/hotels" className="btn btn-primary rounded-xl">
          Return to Hotels
        </Link>
      </div>
    </div>);
};
export default PaymentPage;
