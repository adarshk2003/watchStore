import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Rating from 'react-rating-stars-component';
import { useParams } from 'react-router-dom';

function Review() {
    const { sellerId } = useParams();
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`/reviews/${sellerId}`);
                setReviews(response.data);
            } catch (error) {
                setError('Failed to fetch reviews');
            }
        };

        const fetchUserData = async () => {
            try {
                const response = await axios.get('https://watchstore-backends.onrender.com/user'); 
                setUser(response.data);
            } catch (error) {
                setError('Failed to fetch user data');
            }
        };

        fetchReviews();
        fetchUserData();
    }, [sellerId]);

    const handleRatingChange = (newRating) => {
        setRating(newRating);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://watchstore-backends.onrender.com/reviews', {
                userId: user.id,
                sellerId,
                rating,
                comment
            });
            setRating(0);
            setComment('');
            fetchReviews();
        } catch (error) {
            setError('Failed to submit review');
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-emerald-900">Reviews</h2>
            
            {reviews.map((review) => (
                <div key={review._id} className="mb-4 border-b pb-4">
                    <div className="flex items-center mb-2">
                        <div className="mr-2 text-sm font-bold text-gray-700">{review.userId.name}</div>
                        <Rating
                            value={review.rating}
                            edit={false}
                            size={20}
                            activeColor="#ffd700"
                        />
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
            ))}

            <h3 className="text-xl font-semibold mb-4 text-emerald-900">Leave a Review</h3>
            {user ? (
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Rating</label>
                        <Rating
                            count={5}
                            onChange={handleRatingChange}
                            size={30}
                            activeColor="#ffd700"
                            value={rating}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white rounded-md p-4 font-mono text-center hover:bg-emerald-900">
                        Submit Review
                    </button>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </form>
            ) : (
                <p className="text-gray-700">Loading user data...</p>
            )}
        </div>
    );
};

export default Review;

