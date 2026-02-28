/**
 * Bytecore Course Data
 * This file contains comprehensive details for all courses offered at Bytecore.
 * This powers both the Course Listing and the Dynamic Detail Pages.
 */

export const courses = [
    {
        id: 1,
        title: "Full Stack Development",
        description: "Master frontend and backend technologies to build complete web applications.",
        detailed_description: "Our Full Stack Development program is an intensive, industry-aligned course that transforms you into 360-degree developer. You will master the MERN stack—MongoDB, Express, React, and Node.js—along with modern DevOps practices to build scalable, high-performance web applications.",
        duration: "6 Months",
        enrolled: "150+",
        price: 35000,
        rating: "4.9",
        tags: ["popular", "career"],
        category: "Web Development",
        level: "Intermediate",
        color: "from-blue-600 to-indigo-700",
        image: "assets/img/courses/fullstack_web.png",
        what_you_will_learn: [
            "Advanced JavaScript & ES6+ Mastery",
            "Single Page App development with React",
            "RESTful API design with Node.js & Express",
            "Database Modeling with MongoDB & SQL",
            "Deployment and Cloud Hosting Foundations"
        ],
        syllabus: [
            {
                module: "Frontend Engineering",
                topics: ["HTML5 & Canvas", "Modern CSS & SASS", "Tailwind CSS & Material UI", "React.js & Hook Architecture", "Redux State Management"]
            },
            {
                module: "Backend & Systems",
                topics: ["Node.js Runtime", "Express.js Framework", "Authentication (JWT & OAuth)", "API Security Best Practices"]
            },
            {
                module: "Database & DevOps",
                topics: ["MongoDB Atlas", "PostgreSQL Basics", "Git & GitHub Workflow", "Docker Basics", "AWS/Vercel Deployment"]
            }
        ],
        requirements: ["Basic programming logic", "A passion for building things", "Laptop (8GB RAM recommended)"]
    },
    {
        id: 2,
        title: "Data Science & AI",
        description: "Learn machine learning, deep learning and data analysis techniques with Python.",
        detailed_description: "Unlock the power of data. This course covers the entire data science lifecycle, from statistics and data wrangling to building complex machine learning models. You'll work on real-world datasets to extract actionable insights and build AI systems.",
        duration: "8 Months",
        enrolled: "95+",
        price: 45000,
        rating: "4.8",
        tags: ["high-demand", "ai"],
        category: "Data Science",
        level: "Advanced",
        color: "from-purple-600 to-pink-700",
        what_you_will_learn: [
            "Statistical Analysis & Probability",
            "Data Visualization with Matplotlib & Seaborn",
            "Machine Learning Algorithms (Supervised/Unsupervised)",
            "Deep Learning with TensorFlow & Keras",
            "Big Data Processing foundations"
        ],
        syllabus: [
            {
                module: "Foundation & Math",
                topics: ["Linear Algebra for AI", "Calculus Essentials", "Statistical Hypothesis Testing", "Probability Distributions"]
            },
            {
                module: "Data Manipulation",
                topics: ["Python for Data Science", "Numpy & Pandas Mastery", "Data Cleaning & Preprocessing", "SQL for Data Analysis"]
            },
            {
                module: "Machine Learning Masterclass",
                topics: ["Linear & Logistic Regression", "Decision Trees & Random Forests", "Clustering & PCA", "Natural Language Processing (NLP)"]
            }
        ],
        requirements: ["Strong Mathematical background", "Basic Python knowledge preferably"]
    },
    {
        id: 10,
        title: "Python Programming",
        description: "Learn Python from basics to advanced concepts with real-world projects.",
        detailed_description: "Master the world's most versatile language. From simple scripts to complex web backends and data automation, this course covers Python in its entirety. Ideal for beginners and those looking to diversify their tech stack.",
        duration: "4 Months",
        enrolled: "220+",
        price: 18000,
        rating: "4.9",
        tags: ["beginner-friendly", "popular"],
        category: "Programming",
        level: "Beginner",
        color: "from-blue-500 to-indigo-600",
        what_you_will_learn: [
            "Object-Oriented Programming (OOP)",
            "Functional Programming in Python",
            "File Handling & Automation",
            "Working with Third-party APIs",
            "Writing Clean, Pythonic Code"
        ],
        syllabus: [
            {
                module: "Basics of Programming",
                topics: ["Syntax & Variables", "Control Flow & Loops", "Lists, Tuples & Dictionaries", "List Comprehensions"]
            },
            {
                module: "OOP Concepts",
                topics: ["Classes & Objects", "Inheritance & Polymorphism", "Decorators & Generators", "Exception Handling"]
            }
        ],
        requirements: ["Logical thinking", "No prior coding experience needed"]
    },
    {
        id: 11,
        title: "Java Programming",
        description: "Master Java programming language with OOP concepts and enterprise applications.",
        detailed_description: "Build secure, robust, and scalable applications with Java. This course is essential for enterprise-level development. You'll master everything from core syntax to high-level multithreading and database connectivity.",
        duration: "5 Months",
        enrolled: "110+",
        price: 20000,
        rating: "4.7",
        tags: ["enterprise", "stable"],
        category: "Programming",
        level: "Intermediate",
        color: "from-red-600 to-orange-700",
        what_you_will_learn: [
            "Solid Foundation in OOP Principles",
            "Java Collection Framework",
            "Exception Handling & Debugging",
            "Connecting Apps to Databases (JDBC)",
            "Multithreading & Concurrent Programming"
        ],
        syllabus: [
            {
                module: "Core Java",
                topics: ["Classes & Methods", "Static vs Instance Members", "Interfaces & Abstract Classes", "Enums & Records"]
            },
            {
                module: "Advanced Concepts",
                topics: ["Generics", "Lambda Expressions", "File I/O in Java", "Networking Basics"]
            }
        ],
        requirements: ["Basic understanding of programming"]
    },
    {
        id: 18,
        title: "Tally Prime (Professional Accounting)",
        description: "Digital accounting with GST, Taxation, and Inventory Management.",
        detailed_description: "Tally Prime is the industry standard for accounting in India. This course provides comprehensive training in GST, TDS, Payroll, and sophisticated inventory management, making you ready for accounting roles in any business.",
        duration: "4 Months",
        enrolled: "180+",
        price: 16000,
        rating: "4.9",
        tags: ["popular", "job-oriented"],
        category: "Accounting",
        level: "Intermediate",
        color: "from-indigo-600 to-cyan-700",
        image: "assets/img/courses/accounting_tally.png",
        what_you_will_learn: [
            "GST Returns & E-Way Bills",
            "Professional Voucher Entry",
            "Tax Deducted at Source (TDS)",
            "Inventory & Stock Management",
            "Payroll & Salary Structure"
        ],
        syllabus: [
            {
                module: "Accounts Management",
                topics: ["Company Creation", "Double Entry System", "Ledger & Grouping", "Bank Reconciliation"]
            },
            {
                module: "Taxation (GST/TDS)",
                topics: ["GST Configuration", "Tax Invoice Generation", "TDS Entries", "Monthly Report Generation"]
            }
        ],
        requirements: ["10th or 12th pass", "Basic Computer Knowledge"]
    },
    {
        id: 8,
        title: "ADCA (Advanced Diploma in Computer Applications)",
        description: "Comprehensive course covering DTP, accounting, programming and more.",
        detailed_description: "ADCA is our most popular one-year diploma. It prepares you for a wide range of office roles by combining computer fundamentals, graphic design, accounting, and basic programming into one powerful certificate.",
        duration: "12 Months",
        enrolled: "250+",
        price: 36000,
        rating: "4.8",
        tags: ["diploma", "comprehensive"],
        category: "Certification",
        level: "Intermediate",
        color: "from-sky-500 to-blue-700",
        image: "assets/img/courses/adca_mdca.png",
        what_you_will_learn: [
            "Expert Level MS-Office (Word/Excel/PowerPoint)",
            "Desktop Publishing (Photoshop & PageMaker)",
            "Tally Accounting Essentials",
            "Basic Web Technologies (HTML/CSS)",
            "Operating Systems & Hardware Basics"
        ],
        syllabus: [
            {
                module: "Semester 1",
                topics: ["Computer Fundamentals", "Operating Systems (Win/Linux)", "Office Suite Mastery", "Excel Data Analysis"]
            },
            {
                module: "Semester 2",
                topics: ["Graphic Design (CorelDraw/Photoshop)", "Tally Prime Basics", "Web Design Foundations", "Final Project"]
            }
        ],
        requirements: ["High school qualification"]
    },
    {
        id: 6,
        title: "O Level (NIELIT)",
        description: "Government recognized certification for high-level IT jobs.",
        detailed_description: "The 'O' Level course is essential for many government positions in India. We provide intensive coaching for all four modules (M1-M4), ensuring you pass the NIELIT exams with flying colors.",
        duration: "6-12 Months",
        enrolled: "300+",
        price: 22000,
        rating: "4.8",
        tags: ["govt-certified", "popular"],
        category: "Certification",
        level: "Beginner",
        color: "from-violet-600 to-fuchsia-700",
        what_you_will_learn: [
            "M1: IT Tools & Network Basics",
            "M2: Web Designing & Publishing",
            "M3: Problem Solving using Python",
            "M4: Internet of Things (IoT) Basics"
        ],
        syllabus: [
            {
                module: "Module 1 & 2",
                topics: ["IT Hardware & Software", "Styling with CSS", "JavaScript Logic", "Responsive Web Design"]
            },
            {
                module: "Module 3 & 4",
                topics: ["Python Scripting", "IoT Sensors & Protocols", "Microcontrollers", "Exam Preparation"]
            }
        ],
        requirements: ["Intermediate (10+2) or equivalent"]
    },
    {
        id: 20,
        title: "Graphic Design Mastery",
        description: "Master Photoshop, Illustrator, and CorelDraw for stunning visual creations.",
        detailed_description: "Stop just consuming content; start creating it. This course covers the artistic and technical aspects of design, focusing on the industry's most powerful software to build a stunning professional portfolio.",
        duration: "6 Months",
        enrolled: "80+",
        price: 25000,
        rating: "4.9",
        tags: ["creative", "design"],
        category: "Design",
        level: "Intermediate",
        color: "from-pink-600 to-rose-700",
        what_you_will_learn: [
            "Advanced Image Manipulation (Photoshop)",
            "Logo & Branding Design (Illustrator)",
            "Print Production & Layouts (CorelDraw)",
            "Typography and Color Theory",
            "Packaging Design"
        ],
        syllabus: [
            {
                module: "Design Foundations",
                topics: ["Color Psychology", "Composition Mastery", "File Formats & Resolution", "Stock Asset Selection"]
            },
            {
                module: "Tool Mastery",
                topics: ["Vector vs Raster", "Pen Tool Precision", "Blending Modes", "Visual Effects"]
            }
        ],
        requirements: ["Creative interest", "Visual aesthetic sense"]
    },
    {
        id: 3,
        title: "UI/UX Design Masterclass",
        description: "Design intuitive digital experiences for web and mobile platforms.",
        detailed_description: "Learn to build user-centered products. This course bridges the gap between design and development, teaching you a research-based approach to creating functional and beautiful interfaces using Figma.",
        duration: "5 Months",
        enrolled: "65+",
        price: 30000,
        rating: "4.7",
        tags: ["product-design", "new"],
        category: "Design",
        level: "Advanced",
        color: "from-amber-600 to-orange-700",
        what_you_will_learn: [
            "User Research & Personas",
            "Wireframing & Prototyping in Figma",
            "Mobile-first Design Principles",
            "Interactive Design Systems",
            "Usability Testing Basics"
        ],
        syllabus: [
            {
                module: "UUX Foundations",
                topics: ["User Journeys", "Information Architecture", "UX Documentation", "Accessibility basics"]
            },
            {
                module: "UI Engineering",
                topics: ["Micro-interactions", "Constraint Layouts", "Component libraries", "Handoff to developers"]
            }
        ],
        requirements: ["Basic computer usage", "Eye for detail"]
    },
    {
        id: 4,
        title: "Cyber Security & Ethical Hacking",
        description: "Protect digital assets and learn the basics of network security.",
        detailed_description: "Learn to think like a hacker and defend like a pro. This course covers the fundamentals of network security, system vulnerabilities, and ethical hacking techniques to secure modern digital infrastructures.",
        duration: "6 Months",
        enrolled: "90+",
        price: 32000,
        rating: "4.9",
        tags: ["security", "high-level"],
        category: "Programming",
        level: "Advanced",
        color: "from-rose-600 to-red-700",
        what_you_will_learn: [
            "Network Penetration Testing",
            "Linux Server Security",
            "Vulnerability Assessment",
            "Cryptography Basics",
            "Identifying Web Attacks"
        ],
        syllabus: [
            {
                module: "Networking & Linux",
                topics: ["TCP/IP Protocols", "Linux Architecture", "Command Line mastery", "Packet Analysis"]
            },
            {
                module: "Hacking Techniques",
                topics: ["SQL Injection", "XSS & CSRF", "Social Engineering", "Wireless Security"]
            }
        ],
        requirements: ["Good understanding of OS", "Networking basics help"]
    },
    {
        id: 5,
        title: "Cloud Computing (AWS/Azure)",
        description: "Build and manage scalable infrastructure on the cloud.",
        detailed_description: "The world is moving to the cloud. Gain professional competence in managing virtual servers, storage, and databases on leading platforms like Amazon Web Services and Microsoft Azure.",
        duration: "5 Months",
        enrolled: "75+",
        price: 28000,
        rating: "4.6",
        tags: ["cloud", "enterprise"],
        category: "Programming",
        level: "Intermediate",
        color: "from-blue-600 to-cyan-700",
        what_you_will_learn: [
            "Cloud Infrastructure Management",
            "Working with AWS EC2 & S3",
            "Serverless Architecture Basics",
            "Cloud Security Protocols",
            "Cost Optimization Strategies"
        ],
        syllabus: [
            {
                module: "Cloud Essentials",
                topics: ["IaaS vs PaaS vs SaaS", "Virtualization Concepts", "Hypervisors", "Cloud Identity Management"]
            },
            {
                module: "Platform Mastery",
                topics: ["AWS Lambda", "Azure App Services", "Cloud Storage types", "Load Balancing"]
            }
        ],
        requirements: ["Basic computer networking"]
    },
    {
        id: 9,
        title: "MDCA (Master Diploma in Computer Applications)",
        description: "Master level diploma for advanced computer applications expertise.",
        detailed_description: "Our most advanced diploma program. MDCA builds upon ADCA with more complex software engineering modules, database management, and advanced project work to make you a tech expert.",
        duration: "15 Months",
        enrolled: "85+",
        price: 48000,
        rating: "4.7",
        tags: ["master-diploma", "advanced"],
        category: "Certification",
        level: "Advanced",
        color: "from-cyan-600 to-blue-700",
        image: "assets/img/courses/adca_mdca.png",
        what_you_will_learn: [
            "Advanced Software System Analysis",
            "Relational Database Management (RDBMS)",
            "Enterprise Office Automation",
            "Web Development Masterclass",
            "Project Management Foundations"
        ],
        syllabus: [
            {
                module: "Advanced Systems",
                topics: ["Database Management Systems", "Advanced C++ Concepts", "Financial Modeling with Excel"]
            },
            {
                module: "Professional Portfolio",
                topics: ["Content Management Systems (CMS)", "Digital Presence", "Industry Internship/Project"]
            }
        ],
        requirements: ["12th pass with basic IT knowledge"]
    },
    {
        id: 14,
        title: "Machine Learning Foundations",
        description: "Introduction to smart algorithms and predictive data modeling.",
        detailed_description: "Begin your journey into Artificial Intelligence. Focus on the core algorithms that allow computers to 'learn'—covering regression, classification, and implementation using Python's Scikit-learn.",
        duration: "5 Months",
        enrolled: "80+",
        price: 30000,
        rating: "4.6",
        tags: ["ai", "math-heavy"],
        category: "Data Science",
        level: "Intermediate",
        color: "from-purple-600 to-pink-700",
        what_you_will_learn: [
            "Supervised vs Unsupervised Learning",
            "Regression & Classification logic",
            "Model Training & Deployment",
            "Feature Engineering Basics",
            "Overfitting & Regularization"
        ],
        syllabus: [
            {
                module: "Modeling Basics",
                topics: ["Bias-Variance Tradeoff", "Training-Test Splitting", "Performance Metrics", "Sci-kit Learn Pipeline"]
            },
            {
                module: "Algorithms",
                topics: ["K-Nearest Neighbors", "Support Vector Machines", "Clustering (K-Means)", "Principal Component Analysis"]
            }
        ],
        requirements: ["Basic Python", "College-level Mathematics"]
    },
    {
        id: 15,
        title: "Digital Marketing Pro",
        description: "Learn to grow brands online with SEO, SEM, and social media.",
        detailed_description: "Dominate the digital landscape. This course teaches you to build and execute high-impact digital marketing strategies that drive real business growth using Google Ads, Meta Ads, and SEO.",
        duration: "4 Months",
        enrolled: "140+",
        price: 18000,
        rating: "4.5",
        tags: ["job-oriented", "business"],
        category: "Business",
        level: "Beginner",
        color: "from-green-500 to-teal-700",
        what_you_will_learn: [
            "Search Engine Optimization (SEO)",
            "High-impact Content Marketing",
            "Facebook & Instagram Ads Mastery",
            "Google Search & Display Ads",
            "Email Marketing Automation"
        ],
        syllabus: [
            {
                module: "Content & SEO",
                topics: ["Keyword Research", "On-page vs Off-page SEO", "Technical SEO Audit", "Blogging & Analytics"]
            },
            {
                module: "Paid Advertising",
                topics: ["Campaign Structure", "Audience Targeting", "Retargeting Pixels", "A/B Testing Strategies"]
            }
        ],
        requirements: ["Common sense", "Basic internet knowledge"]
    },
    {
        id: 16,
        title: "C++ Programming Mastery",
        description: "High-performance coding with object-oriented C++.",
        detailed_description: "The cornerstone of system software. Master the language used in game engines, operating systems, and high-performance financial systems. Focus on memory management and high-level logic building.",
        duration: "4 Months",
        enrolled: "70+",
        price: 15000,
        rating: "4.8",
        tags: ["foundation", "advanced"],
        category: "Programming",
        level: "Intermediate",
        color: "from-blue-700 to-purple-800",
        what_you_will_learn: [
            "Pointers & Memory Allocation",
            "Object-Oriented Programming (OOP) in depth",
            "Standard Template Library (STL)",
            "Data Structures & Algorithm implementations",
            "C++ Template Meta-programming"
        ],
        syllabus: [
            {
                module: "Core Syntax",
                topics: ["Reference vs Value", "Classes & Constructors", "Operator Overloading", "Smart Pointers"]
            },
            {
                module: "Adv. Logic",
                topics: ["Virtual Functions", "Abstract Base Classes", "Streams & File handling", "STL Algorithms"]
            }
        ],
        requirements: ["Basic C knowledge recommended"]
    },
    {
        id: 17,
        title: "C Programming Foundation",
        description: "Understand computer logic and memory at the lowest level.",
        detailed_description: "Every great developer starts here. Learn the mother of all modern languages. We focus heavily on pointers, structures, and building logical efficiency from the ground up.",
        duration: "3 Months",
        enrolled: "125+",
        price: 12000,
        rating: "4.7",
        tags: ["essential", "beginner"],
        category: "Programming",
        level: "Beginner",
        color: "from-slate-600 to-slate-800",
        what_you_will_learn: [
            "Logic building with Loops and Conditions",
            "Mastery over C Pointers",
            "Understanding Dynamic Memory (Malloc/Free)",
            "Building custom Data Structures with Structs",
            "Writing efficient system code"
        ],
        syllabus: [
            {
                module: "Foundations",
                topics: ["Algorithm Flowcharts", "Data Types", "Conditionals", "Arrays & Strings"]
            },
            {
                module: "Advanced Concepts",
                topics: ["Pointers logic", "Structures & Unions", "File Operations", "Recursion Mastery"]
            }
        ],
        requirements: ["High school logic skills"]
    },
    {
        id: 19,
        title: "MS Office Professional",
        description: "Master Word, Excel, and PowerPoint for every office role.",
        detailed_description: "More than just typing. Learn to automate reports in Excel, design corporate presentations in PowerPoint, and handle professional correspondence in Word to become an office automation expert.",
        duration: "3 Months",
        enrolled: "200+",
        price: 10000,
        rating: "4.6",
        tags: ["job-essential"],
        category: "Certification",
        level: "Beginner",
        color: "from-blue-500 to-blue-700",
        what_you_will_learn: [
            "Expert Level Excel Functions & Pivot Tables",
            "Professional Word Document formatting",
            "Designing High-impact Presentations",
            "Outlook for Corporate Communication",
            "Access for simple database management"
        ],
        syllabus: [
            {
                module: "Excel Masterclass",
                topics: ["VLOOKUP/HLOOKUP", "Conditional Formatting", "Data Validation", "Macro Recording basics"]
            },
            {
                module: "Presentation & Design",
                topics: ["Slide Master usage", "Animation & Transitions", "Mail Merge in Word", "Email signatures"]
            }
        ],
        requirements: ["Basic typing skills"]
    },
    {
        id: 22,
        title: "DFA (Diploma in Financial Accounting)",
        description: "Professional accounting training with Tally and Taxation focus.",
        detailed_description: "Specifically designed for the finance sector. This six-month diploma covers the practical and theoretical aspects of computerized bookkeeping, GST filing, and financial reporting.",
        duration: "6 Months",
        enrolled: "95+",
        price: 18000,
        rating: "4.9",
        tags: ["finance", "professional"],
        category: "Accounting",
        level: "Intermediate",
        color: "from-emerald-600 to-teal-700",
        what_you_will_learn: [
            "Computerized Accounting Foundations",
            "Professional Tally ERP/Prime skills",
            "Indian Taxation System Essentials",
            "GST & TDS Management",
            "Financial Statement Analysis"
        ],
        syllabus: [
            {
                module: "Accounting Theory",
                topics: ["Double Entry Principles", "Adjustments & Provisions", "Depreciation Methods", "Final Accounts preparation"]
            },
            {
                module: "Digital Ledger",
                topics: ["Digital Voucher Entry", "Bank Reconciliation", "Multi-currency entries", "GST Portal Filing basics"]
            }
        ],
        requirements: ["High school completion", "Commerce background helpful"]
    },
    {
        id: 21,
        title: "DCST (Diploma in Software Technology)",
        description: "Advanced focus on software development and database logic.",
        detailed_description: "DCST is for those who want to specialize in the technical architecture of software. Learn database management, advanced software engineering principles, and modular programming logic.",
        duration: "12 Months",
        enrolled: "55+",
        price: 28000,
        rating: "4.7",
        tags: ["software", "technical"],
        category: "Certification",
        level: "Intermediate",
        color: "from-indigo-600 to-purple-700",
        what_you_will_learn: [
            "System Development Life Cycle (SDLC)",
            "Advanced Database Models",
            "C# or Java Development basics",
            "Quality Assurance Foundations",
            "Team Development with Git"
        ],
        syllabus: [
            {
                module: "Engineering Foundations",
                topics: ["UML Diagrams", "Database Normalization", "Software Testing basics", "Requirement Engineering"]
            },
            {
                module: "Applied Dev",
                topics: ["Entity Relationship Modeling", "SQL Server usage", "Object oriented concepts", "Final Capstone Project"]
            }
        ],
        requirements: ["Intermediate qualification", "Strong logical thinking"]
    },
    {
        id: 7,
        title: "CCC (Course on Computer Concepts)",
        description: "Foundation course for government jobs and digital literacy.",
        detailed_description: "The basic requirement for almost every government job in India. We provide intensive coaching based on the latest NIELIT syllabus to ensure you get an 'S' grade in your certification.",
        duration: "3 Months",
        enrolled: "500+",
        price: 8000,
        rating: "4.8",
        tags: ["govt-essential", "digital-literacy"],
        category: "Certification",
        level: "Beginner",
        color: "from-emerald-500 to-teal-600",
        what_you_will_learn: [
            "Introduction to Computers & GUI",
            "Operating Systems Mastery",
            "Digital Financial Services Foundations",
            "Internet, WWW, and Web Browsers",
            "Network & Cyber Security basics"
        ],
        syllabus: [
            {
                module: "Digital Literacy",
                topics: ["Input/Output devices", "Taskbar & File management", "Word Processing basics"]
            },
            {
                module: "Digital Citizenship",
                topics: ["E-mail Essentials", "Social Media usage", "Digital Payments & UPI", "Mobile Apps for education"]
            }
        ],
        requirements: ["Open to everyone", "Basic reading/writing"]
    },
    {
        id: 12,
        title: "Web Development Essentials",
        description: "Start your journey with HTML, CSS, and basic JavaScript.",
        detailed_description: "The perfect starting point for any web career. Learn how the internet works and build your first responsive website using industry-standard HTML5 and CSS3 practices.",
        duration: "3 Months",
        enrolled: "160+",
        price: 12000,
        rating: "4.7",
        tags: ["beginner", "web"],
        category: "Web Development",
        level: "Beginner",
        color: "from-yellow-600 to-amber-700",
        what_you_will_learn: [
            "Semantic HTML5 tags",
            "Styling with CSS3 & Modern Selectors",
            "Responsive Web Design (Flexbox/Grid)",
            "Intro to JavaScript interactivity",
            "Hosting your first site"
        ],
        syllabus: [
            {
                module: "Structure & Style",
                topics: ["HTML Tags & Attributes", "Images & Multimedia", "CSS Box Model", "Fonts & Color Theory"]
            }
        ],
        requirements: ["No experience required"]
    },
    {
        id: 13,
        title: "React JS Pro",
        description: "Build modern, lighting fast user interfaces with React.",
        detailed_description: "The most requested skill in the job market. Master React.js from hooks to complex state management and build high-performance single page applications.",
        duration: "4 Months",
        enrolled: "120+",
        price: 24000,
        rating: "4.8",
        tags: ["high-demand", "framework"],
        category: "Web Development",
        level: "Intermediate",
        color: "from-blue-600 to-cyan-700",
        what_you_will_learn: [
            "React Components & Props",
            "Modern Hook Architecture (useState, useEffect, etc)",
            "State Management (Context/Redux)",
            "React Router & Navigation",
            "API calling and async data"
        ],
        syllabus: [
            {
                module: "Component Foundations",
                topics: ["JSX Syntax", "Functional Components", "Handling Events", "Conditional Rendering"]
            }
        ],
        requirements: ["Intermediate JavaScript knowledge"]
    }
];

// Exported courses above
