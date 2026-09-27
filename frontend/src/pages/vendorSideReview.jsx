import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star } from "lucide-react";
import axios from "axios";
import VendorNavbar from "../components/VendorNavbar";
const VendorSideReview = () => {
    const { vendorId } = useParams(); // ← MUST NOT BE undefined
    const [reviews, setReviews] = useState([]);
    const [vendorInfo, setVendorInfo] = useState({});
    useEffect(() => {
        if (!vendorId)
            return;
        const vendor = JSON.parse(localStorage.getItem("vendor") || "{}");
        async function fetchReviews() {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/review/vendor/${vendorId}`);
                setReviews(res.data.reviews || []);
                setVendorInfo({
                    hotelName: res.data.hotelName || vendor?.hotelName,
                    averageRating: res.data.averageRating || vendor?.averageRating,
                    totalReviews: res.data.totalReviews || vendor?.totalReviews,
                });
            }
            catch (err) {
                console.log("Error fetching reviews:", err);
            }
        }
        fetchReviews();
    }, [vendorId]);
    return (<div className="min-h-screen bg-base-200 text-base-content flex flex-col">
      <VendorNavbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-grow">

        <h1 className="text-3xl font-extrabold mb-2 text-base-content">
          {vendorInfo.hotelName || "Hotel Reviews"}
        </h1>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((num) => (<Star key={num} size={20} className={num <= Math.round(Number(vendorInfo.averageRating) || 0)
                ? "text-yellow-500 fill-yellow-500"
                : "text-base-300"}/>))}

          <span className="font-bold text-base-content">
            {(Number(vendorInfo.averageRating) || 0).toFixed(1)} / 5
          </span>

          <span className="text-base-content/60 text-sm">
            ({Number(vendorInfo.totalReviews) || 0} reviews)
          </span>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (<p className="text-base-content/60 py-6">No reviews yet.</p>) : (reviews.map((r) => (<div key={r._id} className="border border-base-300 p-5 mb-4 rounded-2xl bg-base-200/50 shadow-sm">

              <div className="flex items-center gap-3 mb-3">
                <img src={r.userId?.profilePic || "/default-user.png"} className="w-12 h-12 rounded-full border border-primary object-cover"/>
                <div>
                  <p className="font-bold text-base-content">{r.userId?.name || r.user_name || "User"}</p>
                  <p className="text-base-content/60 text-xs">
                    {new Date(r.date || r.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex mb-2">
                {[1, 2, 3, 4, 5].map((star) => (<Star key={star} size={18} className={star <= r.rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-base-300"}/>))}
              </div>

              <p className="text-base-content/80 text-sm mt-1 leading-relaxed">{r.comment}</p>
            </div>)))}
      </div>
    </div>);
};
export default VendorSideReview;
