import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { cn } from '../../lib/utils';

const students = [
    "ABHISHEK (DCST).jpg", "ADIL (DCST).jpg", "ADITYA (ADCA).jpg", "ADITYA (DCST).jpg",
    "AJAY (DFA).jpg", "AMAN (DCST).jpg", "AMAR (TALLY).jpg", "AMIR (ADCA).jpg",
    "ANIKET (DCST).jpg", "ANISH (TALLY0.jpg", "ANUJ (DCST).jpg", "ARFAT (ADCA).jpg",
    "ARIF (DCST).jpg", "ARISH (DCA).jpg", "ARVIND (DCST).jpg", "AYAAN (ADCA).jpg",
    "AYAN (CCC).jpg", "AZHAR (TALLY).jpg", "DEEPAK (ADCA).jpg", "DHEERAJ (DCST).jpg",
    "DHRUV (DCST).jpg", "DIVYANSH (ADCA).jpg", "GAURAV (DCST).jpg", "GAURAV (TALLY).jpg",
    "GUNJIT (DCST).jpg", "HIMANSHU (DCA).jpg", "HIMANSHU (DCST).jpg", "IFRAJ (ADCA).jpg",
    "JABIR (TALLY).jpg", "JUNAID (CCC).jpg", "JUNAID (DCA).jpg", "KASIM (DCA).jpg",
    "KAUSHAL (DCA).jpg", "KRISHNA (DCA).jpg", "KUNAL (DCST).jpg", "LALIT (MDCA).jpg",
    "LALTA (CSC).jpg", "MANJEET (ADCA).jpg", "MANOJ (MDCA).jpg", "MOHIT (ADCA).jpg",
    "NAZIL (ADCA).jpg", "NITESH (ADCA).jpg", "NITIN (CCC).jpg", "PAWAN (DFA).jpg",
    "PRINCE (ADCA).jpg", "RACHIT (DCST).jpg", "RAGHAV (DCST).jpg", "RAHUL (DFA).jpg",
    "RAJ (DCA).jpg", "RAJESH (DCA).jpg", "RAMLAKHAN (DCA).jpg", "RISHAV (DCST).jpg",
    "RITESH (MDCA).jpg", "ROHIT (DCST).jpg", "RUPENDRA (ADCA).jpg", "SANJEEV (DCST).jpg",
    "SARHAN (ADCA).jpg", "SAURABH (DCA).jpg", "SAURAV (DCST).jpg", "SHAHIL (DCST).jpg",
    "SHIVAM (ADCA).jpg", "SHRIRAM (ADCA).jpg", "SHRIYANSH (DCST).jpg", "SURAJBHAN  (ADCA0.jpg",
    "SURAJPAL (MS EXCEL).jpg", "TARIQ (TALLY).jpg", "UMAR (MS EXCEL).jpg", "VIKAS (ADCA).jpg",
    "VIKRAM (DCST).jpg", "VINAY (MDCA).jpg", "VINOD (MS OFFICE).jpg", "VISHNU (ADCA).jpg"
];

const DomeGallery = () => {
    const containerRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseMove = (e) => {
        if (isMobile) return;
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const x = (clientX / innerWidth - 0.5) * 20;
        const y = (clientY / innerHeight - 0.5) * -20;
        setMousePos({ x, y });
    };

    const springConfig = { damping: 20, stiffness: 100 };
    const springX = useSpring(mousePos.x, springConfig);
    const springY = useSpring(mousePos.y, springConfig);

    useEffect(() => {
        springX.set(mousePos.x);
        springY.set(mousePos.y);
    }, [mousePos, springX, springY]);

    return (
        <div
            className="w-full min-h-[600px] md:min-h-[800px] flex items-center justify-center overflow-hidden bg-slate-950 py-20 px-4"
            onMouseMove={handleMouseMove}
        >
            <motion.div
                ref={containerRef}
                style={{
                    rotateY: springX,
                    rotateX: springY,
                    perspective: "1200px",
                    transformStyle: "preserve-3d"
                }}
                className="relative grid grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 md:gap-5 w-full max-w-7xl mx-auto items-center justify-center"
            >
                {students.map((file, i) => {
                    const match = file.match(/^(.+)\s\((.+)\)\.jpg$/);
                    const name = match ? match[1] : file.replace('.jpg', '').replace('.png', '');
                    const course = match ? match[2] : "Student";

                    // Simple logic to create a "dome" effect by varying depth based on position
                    const col = i % (isMobile ? 4 : 9);
                    const row = Math.floor(i / (isMobile ? 4 : 9));
                    const totalCols = isMobile ? 4 : 9;
                    const totalRows = Math.ceil(students.length / totalCols);

                    const distFromCenterX = Math.abs(col - (totalCols - 1) / 2);
                    const distFromCenterY = Math.abs(row - (totalRows - 1) / 2);
                    const dist = Math.sqrt(distFromCenterX ** 2 + distFromCenterY ** 2);

                    const z = -dist * (isMobile ? 15 : 40);
                    const scale = 1 - dist * 0.05;

                    return (
                        <motion.div
                            key={file}
                            whileHover={{
                                scale: 1.15,
                                z: 50,
                                transition: { duration: 0.2 }
                            }}
                            style={{
                                transformStyle: "preserve-3d",
                                z: z,
                                scale: scale
                            }}
                            className="relative group aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-slate-900 cursor-pointer"
                        >
                            <img
                                src={`/images/students/${file}`}
                                alt={name}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 md:p-4">
                                <span className="text-white text-[8px] md:text-[10px] font-black uppercase tracking-tighter line-clamp-1">{name}</span>
                                <span className="text-blue-400 text-[6px] md:text-[8px] font-bold uppercase tracking-widest">{course}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default DomeGallery;
