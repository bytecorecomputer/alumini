import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFnFqw6iD1YhQ5xwhSnd2rIKUJeR17wkU",
  authDomain: "practice-be58e.firebaseapp.com",
  projectId: "practice-be58e",
  storageBucket: "practice-be58e.appspot.com",
  messagingSenderId: "849847321136",
  appId: "1:849847321136:web:27525bc43f41aca1b3e3f5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const quizzes = [
  {
    courseId: "dca",
    topicId: "Computer Fundamentals Pro",
    questions: [
      {
        question: "कंप्यूटर का पितामह (Father of Computer) किसे कहा जाता है?",
        options: ["Alan Turing", "Charles Babbage", "Bill Gates", "Steve Jobs"],
        correctAnswer: 1,
        explanation: "Charles Babbage को Analytical Engine के आविष्कार के लिए 'Father of Computer' कहा जाता है।"
      },
      {
        question: "इनमें से कौन सा एक इनपुट डिवाइस (Input Device) नहीं है?",
        options: ["Mouse", "Keyboard", "Scanner", "Monitor"],
        correctAnswer: 3,
        explanation: "Monitor एक आउटपुट डिवाइस (Output Device) है।"
      },
      {
        question: "CPU का फुल फॉर्म क्या है?",
        options: ["Central Process Unit", "Computer Processing Unit", "Central Processing Unit", "Core Processing Unit"],
        correctAnswer: 2,
        explanation: "CPU का फुल फॉर्म Central Processing Unit होता है, जिसे कंप्यूटर का मस्तिष्क भी कहते हैं।"
      },
      {
        question: "ROM किस प्रकार की मेमोरी है?",
        options: ["Volatile Memory", "Non-Volatile Memory", "Cache Memory", "Virtual Memory"],
        correctAnswer: 1,
        explanation: "ROM (Read Only Memory) एक Non-Volatile मेमोरी है, जिसमें डाटा लाइट जाने के बाद भी सुरक्षित रहता है।"
      },
      {
        question: "1 Byte में कितने Bits होते हैं?",
        options: ["4 Bits", "8 Bits", "16 Bits", "32 Bits"],
        correctAnswer: 1,
        explanation: "1 Byte में 8 Bits होते हैं, जबकि 4 Bits को 1 Nibble कहा जाता है।"
      }
    ]
  },
  {
    courseId: "ccc",
    topicId: "LibreOffice Writer Masterclass",
    questions: [
      {
        question: "LibreOffice Writer में 'Save As' की शॉर्टकट की क्या है?",
        options: ["Ctrl + S", "Ctrl + Shift + S", "F12", "Ctrl + Alt + S"],
        correctAnswer: 1,
        explanation: "LibreOffice में 'Save As' के लिए Ctrl + Shift + S का उपयोग किया जाता है।"
      },
      {
        question: "LibreOffice Writer का डिफ़ॉल्ट फाइल एक्सटेंशन क्या है?",
        options: [".docx", ".odt", ".txt", ".xlsx"],
        correctAnswer: 1,
        explanation: "Writer का डिफ़ॉल्ट फाइल एक्सटेंशन .odt (Open Document Text) होता है।"
      },
      {
        question: "LibreOffice Writer में Print Preview की शॉर्टकट की क्या होती है?",
        options: ["Ctrl + P", "Ctrl + Shift + P", "Ctrl + Shift + O", "Ctrl + F2"],
        correctAnswer: 2,
        explanation: "Writer में Print Preview देखने के लिए Ctrl + Shift + O का उपयोग किया जाता है।"
      },
      {
        question: "LibreOffice Writer में अधिकतम ज़ूम (Maximum Zoom) कितना प्रतिशत हो सकता है?",
        options: ["400%", "500%", "600%", "3000%"],
        correctAnswer: 2,
        explanation: "LibreOffice Writer में अधिकतम ज़ूम 600% तक किया जा सकता है।"
      },
      {
        question: "Cut की हुई वस्तुएं अस्थायी रूप से कहाँ स्टोर होती हैं?",
        options: ["Hard Drive", "ROM", "Clipboard", "Recycle Bin"],
        correctAnswer: 2,
        explanation: "Cut या Copy किया गया डाटा Clipboard में अस्थायी रूप से स्टोर होता है।"
      }
    ]
  },
  {
    courseId: "o_level",
    topicId: "Python Programming (M3-R5)",
    questions: [
      {
        question: "पायथन (Python) भाषा का आविष्कार किसने किया?",
        options: ["Guido van Rossum", "Dennis Ritchie", "James Gosling", "Bjarne Stroustrup"],
        correctAnswer: 0,
        explanation: "Python का विकास Guido van Rossum द्वारा 1991 में किया गया था।"
      },
      {
        question: "Python में लिस्ट (List) बनाने के लिए किस ब्रैकेट का उपयोग होता है?",
        options: ["( )", "{ }", "[ ]", "< >"],
        correctAnswer: 2,
        explanation: "Python में List बनाने के लिए Square Brackets [ ] का उपयोग किया जाता है।"
      },
      {
        question: "Python में इनमें से कौन सा डेटा टाइप Mutable (परिवर्तनशील) है?",
        options: ["Tuple", "String", "List", "Integer"],
        correctAnswer: 2,
        explanation: "List एक mutable डेटा टाइप है, जबकि Tuple और String immutable होते हैं।"
      },
      {
        question: "Python में फंक्शन को परिभाषित करने के लिए किस कीवर्ड (keyword) का उपयोग होता है?",
        options: ["func", "define", "def", "function"],
        correctAnswer: 2,
        explanation: "Python में फंक्शन को 'def' कीवर्ड के माध्यम से परिभाषित किया जाता है।"
      },
      {
        question: "Print('Hello' + 'World') का आउटपुट क्या होगा?",
        options: ["Hello World", "HelloWorld", "Error", "'Hello' + 'World'"],
        correctAnswer: 1,
        explanation: "Strings को + ऑपरेटर से जोड़ने पर वे बिना स्पेस के जुड़ जाते हैं (Concatenation)।"
      }
    ]
  },
  {
    courseId: "tally",
    topicId: "Accounting Basics & Tally Prime",
    questions: [
      {
        question: "Tally Prime में Company Create करने की शॉर्टकट की क्या है?",
        options: ["Alt + K", "F3", "Ctrl + C", "Alt + C"],
        correctAnswer: 0,
        explanation: "Tally Prime में Company Menu ओपन करने के लिए Alt + K प्रेस किया जाता है।"
      },
      {
        question: "Capital Account किस ग्रुप के अंतर्गत आता है?",
        options: ["Current Liabilities", "Current Assets", "Capital Account", "Fixed Assets"],
        correctAnswer: 2,
        explanation: "Capital Account का ग्रुप Tally में Capital Account ही होता है।"
      },
      {
        question: "Payment Entry करने के लिए Tally में कौन सा वाउचर (Voucher) उपयोग होता है?",
        options: ["F4", "F5", "F6", "F7"],
        correctAnswer: 1,
        explanation: "Payment Voucher के लिए F5 का प्रयोग किया जाता है।"
      },
      {
        question: "GST का फुल फॉर्म क्या है?",
        options: ["General Sales Tax", "Goods and Services Tax", "Good Sales Tax", "General Service Tax"],
        correctAnswer: 1,
        explanation: "GST का अर्थ Goods and Services Tax होता है।"
      },
      {
        question: "Contra Voucher की शॉर्टकट की क्या है?",
        options: ["F4", "F5", "F6", "F7"],
        correctAnswer: 0,
        explanation: "Contra Voucher (Bank to Cash / Cash to Bank entries) के लिए F4 का उपयोग होता है।"
      }
    ]
  }
];

async function injectQuizzes() {
  console.log("Starting to inject premium quizzes...");
  try {
    for (const quiz of quizzes) {
      await addDoc(collection(db, "custom_quizzes"), {
        ...quiz,
        createdAt: serverTimestamp(),
        createdBy: "System Bot"
      });
      console.log(`Successfully injected: ${quiz.topicId} for ${quiz.courseId}`);
    }
    console.log("All quizzes injected successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error injecting quizzes:", error);
    process.exit(1);
  }
}

injectQuizzes();
