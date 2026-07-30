// IELTS test content — sample tests for all 4 sections

export type MCQQuestion = {
  id: string;
  type: "mcq";
  question: string;
  options: string[];
  answer: number; // index of correct option
};

export type FillQuestion = {
  id: string;
  type: "fill";
  question: string;
  answer: string; // canonical answer (lowercase)
  acceptable?: string[]; // acceptable synonyms
};

export type TFNGQuestion = {
  id: string;
  type: "tfng";
  question: string;
  answer: "TRUE" | "FALSE" | "NOT GIVEN";
};

export type Question = MCQQuestion | FillQuestion | TFNGQuestion;

// ---------- LISTENING ----------
export const listeningTest = {
  title: "Section 1 — Booking a Language Course",
  intro:
    "You will hear a conversation between a student and a course advisor. Listen carefully and answer the questions.",
  // Full transcript spoken via SpeechSynthesis
  transcript: `Advisor: Good morning, welcome to Cambridge Language Centre. How can I help you today?
Student: Hi, my name is Anna Petrov. I'd like to enrol in an English course.
Advisor: Great. Can I take a few details? First, could you spell your last name?
Student: Yes, it's P-E-T-R-O-V.
Advisor: Thank you. And which course are you interested in?
Student: I want to take the General English course, intermediate level.
Advisor: Perfect. That course starts on the 15th of September and runs for twelve weeks. Classes are on Monday, Wednesday and Friday, from 6 pm to 8 pm.
Student: That sounds good. How much does it cost?
Advisor: The total fee is 480 pounds, but if you pay before the 1st of September you get a 10 percent discount.
Student: What about textbooks?
Advisor: The main coursebook is called "English File", and it costs an additional 25 pounds. You can also borrow it from our library for free.
Student: And where exactly are the classes held?
Advisor: In Room 204 of the Franklin Building on King Street.
Student: One more question — is there a certificate at the end?
Advisor: Yes. If your attendance is over 80 percent and you pass the final exam, you receive an official certificate.`,
  questions: [
    {
      id: "L1",
      type: "fill",
      question: "The student's last name is spelled: __________",
      answer: "petrov",
    },
    {
      id: "L2",
      type: "mcq",
      question: "Which course does the student want to take?",
      options: [
        "Business English (advanced)",
        "General English (intermediate)",
        "Academic English (beginner)",
        "IELTS Preparation",
      ],
      answer: 1,
    },
    {
      id: "L3",
      type: "fill",
      question: "The course starts on the ______ of September.",
      answer: "15th",
      acceptable: ["15", "fifteenth"],
    },
    {
      id: "L4",
      type: "fill",
      question: "The course lasts for ______ weeks.",
      answer: "12",
      acceptable: ["twelve"],
    },
    {
      id: "L5",
      type: "mcq",
      question: "Classes take place on:",
      options: [
        "Tuesday, Thursday, Saturday",
        "Monday, Wednesday, Friday",
        "Monday to Friday",
        "Weekends only",
      ],
      answer: 1,
    },
    {
      id: "L6",
      type: "fill",
      question: "The total course fee is ______ pounds.",
      answer: "480",
    },
    {
      id: "L7",
      type: "fill",
      question: "Students who pay early get a ______ percent discount.",
      answer: "10",
      acceptable: ["ten"],
    },
    {
      id: "L8",
      type: "fill",
      question: "The coursebook is called '____________'.",
      answer: "english file",
    },
    {
      id: "L9",
      type: "fill",
      question: "Classes are held in Room ______ of the Franklin Building.",
      answer: "204",
    },
    {
      id: "L10",
      type: "tfng",
      question: "Students need at least 80% attendance to receive a certificate.",
      answer: "TRUE",
    },
  ] as Question[],
};

// ---------- READING ----------
export const readingTest = {
  title: "The History of Coffee",
  passage: `Coffee is one of the most widely consumed beverages in the world, yet its origins remain shrouded in legend. The most popular story tells of an Ethiopian goat herder named Kaldi, who lived in the 9th century. According to the tale, Kaldi noticed that his goats became unusually energetic after eating red berries from a certain shrub. Curious, he tried the berries himself and experienced a similar burst of energy. He shared his discovery with a local monk, who used the berries to stay awake during long hours of prayer.

Whether or not this story is true, historians agree that coffee cultivation and consumption began on the Arabian Peninsula. By the 15th century, coffee was being grown in the Yemeni district of Arabia, and by the 16th century it was known in Persia, Egypt, Syria, and Turkey. Coffee was not only enjoyed at home but also in public coffee houses, called "qahveh khaneh," which appeared in cities across the Near East. These establishments became so popular that they were often referred to as "Schools of the Wise," because so much social activity — including music, chess, and news exchange — took place in them.

Coffee reached Europe in the 17th century, first through the port of Venice. Initially, some clergy condemned the drink as the "bitter invention of Satan," but Pope Clement VIII, after tasting it, gave the drink his approval. Coffee houses quickly spread across the continent, becoming important centres of intellectual and political discussion. In England alone, more than 300 coffee houses had opened by the middle of the 17th century.

The Dutch were the first to cultivate coffee outside of Arabia and Africa. In 1616, they succeeded in transporting a live coffee plant to the Netherlands, and later established plantations in their colony of Java. From there, coffee cultivation spread to the Caribbean and, eventually, to Central and South America, where Brazil became — and remains — the world's largest coffee producer.

Today, coffee is grown in more than 70 countries and supports the livelihoods of over 25 million farmers. It is the second most traded commodity in the world after crude oil, and its cultural influence continues to grow, from traditional Turkish coffee ceremonies to modern speciality coffee shops.`,
  questions: [
    {
      id: "R1",
      type: "tfng",
      question: "Kaldi was the first person to write a book about coffee.",
      answer: "NOT GIVEN",
    },
    {
      id: "R2",
      type: "tfng",
      question: "A monk used coffee berries to stay awake during prayers.",
      answer: "TRUE",
    },
    {
      id: "R3",
      type: "tfng",
      question: "Coffee was grown in Europe before it was grown in Arabia.",
      answer: "FALSE",
    },
    {
      id: "R4",
      type: "mcq",
      question: "The Arabic term 'qahveh khaneh' refers to:",
      options: [
        "A type of coffee bean",
        "Public coffee houses",
        "A religious ceremony",
        "A brewing technique",
      ],
      answer: 1,
    },
    {
      id: "R5",
      type: "mcq",
      question: "Coffee houses in the Near East were nicknamed 'Schools of the Wise' because:",
      options: [
        "Only scholars could enter them",
        "They served free coffee to teachers",
        "Much social and intellectual activity happened there",
        "They were located next to universities",
      ],
      answer: 2,
    },
    {
      id: "R6",
      type: "fill",
      question: "Coffee first entered Europe through the port of __________.",
      answer: "venice",
    },
    {
      id: "R7",
      type: "fill",
      question: "By the mid-17th century, England had more than ______ coffee houses.",
      answer: "300",
    },
    {
      id: "R8",
      type: "mcq",
      question: "The Dutch first cultivated coffee outside Arabia in their colony of:",
      options: ["Brazil", "Java", "Ceylon", "the Caribbean"],
      answer: 1,
    },
    {
      id: "R9",
      type: "fill",
      question: "The world's largest coffee producer is __________.",
      answer: "brazil",
    },
    {
      id: "R10",
      type: "tfng",
      question: "Coffee is the most traded commodity in the world.",
      answer: "FALSE",
    },
  ] as Question[],
};

// ---------- WRITING ----------
export const writingTasks = {
  task1: {
    label: "Writing Task 1",
    minWords: 150,
    timeMinutes: 20,
    prompt:
      "The chart below shows the percentage of households in different income groups that owned smartphones in 2010 and 2022 in the UK. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    dataDescription: `Data snapshot (percentage of households owning a smartphone):
• Low income:    2010 = 22%   2022 = 78%
• Middle income: 2010 = 45%   2022 = 94%
• High income:   2010 = 71%   2022 = 99%`,
  },
  task2: {
    label: "Writing Task 2",
    minWords: 250,
    timeMinutes: 40,
    prompt:
      "Some people believe that university education should be free for all students, while others think that students should pay the full cost of their studies. Discuss both views and give your own opinion.",
  },
};

// ---------- SPEAKING ----------
export const speakingTest = {
  part1: {
    label: "Part 1 — Introduction & Interview",
    timeMinutes: 4,
    questions: [
      "Let's talk about your hometown. Where are you from?",
      "What do you like most about the place where you live?",
      "Do you prefer living in a city or in the countryside? Why?",
      "How has your hometown changed in the last ten years?",
    ],
  },
  part2: {
    label: "Part 2 — Long Turn (Cue Card)",
    timeMinutes: 2,
    prompt:
      "Describe a skill you would like to learn in the future.\nYou should say:\n  • what the skill is\n  • how you would learn it\n  • how long it might take to master\n  • and explain why you want to learn this skill.",
  },
  part3: {
    label: "Part 3 — Discussion",
    timeMinutes: 5,
    questions: [
      "Do you think it is easier for adults or children to learn new skills? Why?",
      "How has technology changed the way people learn new things?",
      "Should governments invest more in adult education? Why or why not?",
      "What skills do you think will be most important in the future?",
    ],
  },
};
