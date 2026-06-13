import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

export default function LottiePlayer({ url, loop = true, className = "w-32 h-32" }) {
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
        if (!url) return;
        let isMounted = true;
        
        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (isMounted) setAnimationData(data);
            })
            .catch(err => console.error("Failed to load lottie", err));

        return () => { isMounted = false; };
    }, [url]);

    if (!animationData) return <div className={`animate-pulse bg-slate-100 rounded-full ${className}`} />;

    return (
        <div className={className}>
            <Lottie animationData={animationData} loop={loop} />
        </div>
    );
}
