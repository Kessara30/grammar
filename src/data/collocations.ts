import { CollocationPair, ChallengeCard } from '../types.ts';

/**
 * Large and diverse pool of authentic English collocations
 * covering University life, Daily habits, Academic success, and Social interactions.
 */
export const ALL_COLLOCATION_PAIRS: CollocationPair[] = [
  // Classic Core
  {
    id: 'make-decision',
    verb: 'MAKE',
    noun: 'a decision',
    thaiMeaning: 'ตัดสินใจ',
    exampleSentence: 'We need to make a decision before Friday.',
    category: 'action',
  },
  {
    id: 'do-homework',
    verb: 'DO',
    noun: 'homework',
    thaiMeaning: 'ทำการบ้าน',
    exampleSentence: 'She always does her homework after dinner.',
    category: 'campus',
  },
  {
    id: 'take-break',
    verb: 'TAKE',
    noun: 'a break',
    thaiMeaning: 'หยุดพักผ่อนสักครู่',
    exampleSentence: 'Let us take a break and grab a cup of coffee.',
    category: 'daily',
  },
  {
    id: 'have-breakfast',
    verb: 'HAVE',
    noun: 'breakfast',
    thaiMeaning: 'รับประทานอาหารเช้า',
    exampleSentence: 'I usually have breakfast at seven o\'clock.',
    category: 'daily',
  },
  {
    id: 'pay-attention',
    verb: 'PAY',
    noun: 'attention',
    thaiMeaning: 'ตั้งใจฟัง / ใส่ใจ',
    exampleSentence: 'Please pay attention to the professor\'s instructions.',
    category: 'campus',
  },
  {
    id: 'catch-bus',
    verb: 'CATCH',
    noun: 'a bus',
    thaiMeaning: 'ขึ้นรถเมล์ / นั่งรถประจำทาง',
    exampleSentence: 'Hurry up or we will not catch the bus on time!',
    category: 'daily',
  },

  // Campus & Academic Life
  {
    id: 'take-notes',
    verb: 'TAKE',
    noun: 'notes',
    thaiMeaning: 'จดบันทึก / ชอร์ตโน้ต',
    exampleSentence: 'Students should take notes during lectures.',
    category: 'campus',
  },
  {
    id: 'do-research',
    verb: 'DO',
    noun: 'research',
    thaiMeaning: 'ทำวิจัย / ค้นคว้าข้อมูล',
    exampleSentence: 'Our team is doing research in the campus library.',
    category: 'campus',
  },
  {
    id: 'give-presentation',
    verb: 'GIVE',
    noun: 'a presentation',
    thaiMeaning: 'นำเสนอผลงาน / พรีเซนต์',
    exampleSentence: 'He will give a presentation on climate change tomorrow.',
    category: 'campus',
  },
  {
    id: 'take-exam',
    verb: 'TAKE',
    noun: 'an exam',
    thaiMeaning: 'เข้าสอบ / ทำข้อสอบ',
    exampleSentence: 'All freshmen must take an English proficiency exam.',
    category: 'campus',
  },
  {
    id: 'make-progress',
    verb: 'MAKE',
    noun: 'progress',
    thaiMeaning: 'มีความก้าวหน้า / พัฒนาขึ้น',
    exampleSentence: 'She has made great progress in speaking English.',
    category: 'campus',
  },
  {
    id: 'have-discussion',
    verb: 'HAVE',
    noun: 'a discussion',
    thaiMeaning: 'แลกเปลี่ยนความคิดเห็น',
    exampleSentence: 'The study group had an active discussion.',
    category: 'campus',
  },

  // Daily Life & Social
  {
    id: 'make-friends',
    verb: 'MAKE',
    noun: 'friends',
    thaiMeaning: 'ผูกมิตร / หาเพื่อนใหม่',
    exampleSentence: 'It is easy to make friends during orientation week.',
    category: 'daily',
  },
  {
    id: 'do-dishes',
    verb: 'DO',
    noun: 'the dishes',
    thaiMeaning: 'ล้างจาน',
    exampleSentence: 'It is your turn to do the dishes tonight.',
    category: 'daily',
  },
  {
    id: 'have-fun',
    verb: 'HAVE',
    noun: 'fun',
    thaiMeaning: 'สนุกสนาน / มีความสุข',
    exampleSentence: 'Everyone had fun at the university music festival.',
    category: 'daily',
  },
  {
    id: 'catch-cold',
    verb: 'CATCH',
    noun: 'a cold',
    thaiMeaning: 'เป็นหวัด / ติดหวัด',
    exampleSentence: 'Wear a warm jacket so you do not catch a cold.',
    category: 'daily',
  },
  {
    id: 'keep-secret',
    verb: 'KEEP',
    noun: 'a secret',
    thaiMeaning: 'เก็บความลับ',
    exampleSentence: 'Can I trust you to keep a secret?',
    category: 'daily',
  },
  {
    id: 'take-photo',
    verb: 'TAKE',
    noun: 'a photo',
    thaiMeaning: 'ถ่ายรูป / ถ่ายภาพ',
    exampleSentence: 'Let us take a group photo in front of the booth!',
    category: 'daily',
  },

  // Action, Social & Career
  {
    id: 'make-effort',
    verb: 'MAKE',
    noun: 'an effort',
    thaiMeaning: 'พยายามอย่างเต็มที่',
    exampleSentence: 'You must make an effort to practice every day.',
    category: 'action',
  },
  {
    id: 'pay-compliment',
    verb: 'PAY',
    noun: 'a compliment',
    thaiMeaning: 'กล่าวคำชมเชย',
    exampleSentence: 'The teacher paid him a warm compliment on his essay.',
    category: 'action',
  },
  {
    id: 'take-risk',
    verb: 'TAKE',
    noun: 'a risk',
    thaiMeaning: 'ยอมเสี่ยง / กล้าเสี่ยง',
    exampleSentence: 'Entrepreneurs often take a calculated risk.',
    category: 'action',
  },
  {
    id: 'catch-eye',
    verb: 'CATCH',
    noun: "someone's eye",
    thaiMeaning: 'สะดุดตา / ดึงดูดความสนใจ',
    exampleSentence: 'The colorful booth banner caught everyone\'s eye.',
    category: 'action',
  },
  {
    id: 'give-hand',
    verb: 'GIVE',
    noun: 'a hand',
    thaiMeaning: 'ยื่นมือช่วยเหลือ',
    exampleSentence: 'Could you give me a hand carrying these books?',
    category: 'action',
  },
  {
    id: 'keep-promise',
    verb: 'KEEP',
    noun: 'a promise',
    thaiMeaning: 'รักษาสัญญา',
    exampleSentence: 'A reliable leader always keeps a promise.',
    category: 'action',
  },
];

/**
 * Default standard 6 pairs for classic mode
 */
export const DEFAULT_MATCHING_PAIRS: CollocationPair[] = ALL_COLLOCATION_PAIRS.slice(0, 6);

/**
 * Returns a randomized set of 6 distinct collocations from the library.
 * Guarantees that all 6 verbs are distinct to prevent ambiguous matching.
 */
export function getRandomMatchingSet(category?: string): CollocationPair[] {
  const filtered = category && category !== 'all'
    ? ALL_COLLOCATION_PAIRS.filter((p) => p.category === category)
    : ALL_COLLOCATION_PAIRS;

  const source = filtered.length >= 6 ? filtered : ALL_COLLOCATION_PAIRS;
  const shuffled = [...source].sort(() => 0.5 - Math.random());

  // Ensure unique verbs among the 6 selected to guarantee 100% unambiguous matching
  const chosen: CollocationPair[] = [];
  const usedVerbs = new Set<string>();

  for (const item of shuffled) {
    if (!usedVerbs.has(item.verb)) {
      chosen.push(item);
      usedVerbs.add(item.verb);
      if (chosen.length === 6) break;
    }
  }

  // Fallback if unique verbs less than 6
  if (chosen.length < 6) {
    for (const item of shuffled) {
      if (!chosen.find((c) => c.id === item.id)) {
        chosen.push(item);
        if (chosen.length === 6) break;
      }
    }
  }

  return chosen.slice(0, 6);
}

/**
 * Expanded Challenge Cards Pool (21 diverse cards for Steps 3 & 4)
 */
export const CHALLENGE_CARDS_POOL: ChallengeCard[] = [
  // Original 7 Cards
  {
    id: 'card-make-decision',
    collocation: 'MAKE A DECISION',
    verb: 'MAKE',
    nounPhrase: 'a decision',
    thaiMeaning: 'ตัดสินใจ',
    exampleSentence: 'It took me three days to make a decision about my university major.',
    verbForms: ['make', 'makes', 'made', 'making'],
    category: 'action',
  },
  {
    id: 'card-do-homework',
    collocation: 'DO HOMEWORK',
    verb: 'DO',
    nounPhrase: 'homework',
    thaiMeaning: 'ทำการบ้าน',
    exampleSentence: 'University students must do their homework independently.',
    verbForms: ['do', 'does', 'did', 'doing', 'done'],
    category: 'campus',
  },
  {
    id: 'card-take-break',
    collocation: 'TAKE A BREAK',
    verb: 'TAKE',
    nounPhrase: 'a break',
    thaiMeaning: 'หยุดพักสักครู่',
    exampleSentence: 'After studying for two hours, I took a break to stretch.',
    verbForms: ['take', 'takes', 'took', 'taking', 'taken'],
    category: 'daily',
  },
  {
    id: 'card-have-breakfast',
    collocation: 'HAVE BREAKFAST',
    verb: 'HAVE',
    nounPhrase: 'breakfast',
    thaiMeaning: 'รับประทานอาหารเช้า',
    exampleSentence: 'I had breakfast with my roommates at the campus canteen.',
    verbForms: ['have', 'has', 'had', 'having'],
    category: 'daily',
  },
  {
    id: 'card-pay-attention',
    collocation: 'PAY ATTENTION',
    verb: 'PAY',
    nounPhrase: 'attention',
    thaiMeaning: 'ตั้งใจฟัง / เอาใจใส่',
    exampleSentence: 'You should pay attention in class if you want to pass the exam.',
    verbForms: ['pay', 'pays', 'paid', 'paying'],
    category: 'campus',
  },
  {
    id: 'card-catch-bus',
    collocation: 'CATCH A BUS',
    verb: 'CATCH',
    nounPhrase: 'a bus',
    thaiMeaning: 'ขึ้นรถเมล์ / นั่งรถประจำทาง',
    exampleSentence: 'He ran quickly to catch a bus back to his dormitory.',
    verbForms: ['catch', 'catches', 'caught', 'catching'],
    category: 'daily',
  },
  {
    id: 'card-do-housework',
    collocation: 'DO THE HOUSEWORK',
    verb: 'DO',
    nounPhrase: 'the housework',
    thaiMeaning: 'ทำงานบ้าน',
    exampleSentence: 'I love doing the housework on Sunday mornings.',
    verbForms: ['do', 'does', 'did', 'doing', 'done'],
    category: 'daily',
  },

  // Additional 14 Diverse Cards
  {
    id: 'card-make-friends',
    collocation: 'MAKE FRIENDS',
    verb: 'MAKE',
    nounPhrase: 'friends',
    thaiMeaning: 'ผูกมิตร / หาเพื่อนใหม่',
    exampleSentence: 'Joining student clubs helped me make friends easily.',
    verbForms: ['make', 'makes', 'made', 'making'],
    category: 'campus',
  },
  {
    id: 'card-take-notes',
    collocation: 'TAKE NOTES',
    verb: 'TAKE',
    nounPhrase: 'notes',
    thaiMeaning: 'จดบันทึก / ชอร์ตโน้ต',
    exampleSentence: 'I always take notes on my tablet during lectures.',
    verbForms: ['take', 'takes', 'took', 'taking', 'taken'],
    category: 'campus',
  },
  {
    id: 'card-give-presentation',
    collocation: 'GIVE A PRESENTATION',
    verb: 'GIVE',
    nounPhrase: 'a presentation',
    thaiMeaning: 'นำเสนองาน / พรีเซนต์',
    exampleSentence: 'We gave an outstanding presentation in English class.',
    verbForms: ['give', 'gives', 'gave', 'giving', 'given'],
    category: 'campus',
  },
  {
    id: 'card-do-research',
    collocation: 'DO RESEARCH',
    verb: 'DO',
    nounPhrase: 'research',
    thaiMeaning: 'ทำวิจัย / ค้นคว้าข้อมูล',
    exampleSentence: 'Our professor advised us to do thorough research before writing.',
    verbForms: ['do', 'does', 'did', 'doing', 'done'],
    category: 'campus',
  },
  {
    id: 'card-make-effort',
    collocation: 'MAKE AN EFFORT',
    verb: 'MAKE',
    nounPhrase: 'an effort',
    thaiMeaning: 'พยายามอย่างเต็มที่',
    exampleSentence: 'You need to make an effort if you want to improve your fluency.',
    verbForms: ['make', 'makes', 'made', 'making'],
    category: 'action',
  },
  {
    id: 'card-have-fun',
    collocation: 'HAVE FUN',
    verb: 'HAVE',
    nounPhrase: 'fun',
    thaiMeaning: 'สนุกสนาน',
    exampleSentence: 'We had so much fun participating in the university game booth!',
    verbForms: ['have', 'has', 'had', 'having'],
    category: 'daily',
  },
  {
    id: 'card-take-risk',
    collocation: 'TAKE A RISK',
    verb: 'TAKE',
    nounPhrase: 'a risk',
    thaiMeaning: 'ยอมเสี่ยง / กล้าลองสิ่งใหม่',
    exampleSentence: 'Don\'t be afraid to take a risk and speak English publicly.',
    verbForms: ['take', 'takes', 'took', 'taking', 'taken'],
    category: 'action',
  },
  {
    id: 'card-pay-compliment',
    collocation: 'PAY A COMPLIMENT',
    verb: 'PAY',
    nounPhrase: 'a compliment',
    thaiMeaning: 'กล่าวคำชมเชย',
    exampleSentence: 'She paid me a wonderful compliment on my pronunciation.',
    verbForms: ['pay', 'pays', 'paid', 'paying'],
    category: 'action',
  },
  {
    id: 'card-catch-cold',
    collocation: 'CATCH A COLD',
    verb: 'CATCH',
    nounPhrase: 'a cold',
    thaiMeaning: 'เป็นหวัด / ติดหวัด',
    exampleSentence: 'I caught a cold because I walked home in the heavy rain.',
    verbForms: ['catch', 'catches', 'caught', 'catching'],
    category: 'daily',
  },
  {
    id: 'card-keep-promise',
    collocation: 'KEEP A PROMISE',
    verb: 'KEEP',
    nounPhrase: 'a promise',
    thaiMeaning: 'รักษาสัญญา',
    exampleSentence: 'He kept his promise and helped me study for the midterm.',
    verbForms: ['keep', 'keeps', 'kept', 'keeping'],
    category: 'action',
  },
  {
    id: 'card-do-dishes',
    collocation: 'DO THE DISHES',
    verb: 'DO',
    nounPhrase: 'the dishes',
    thaiMeaning: 'ล้างจาน',
    exampleSentence: 'My roommate and I take turns doing the dishes.',
    verbForms: ['do', 'does', 'did', 'doing', 'done'],
    category: 'daily',
  },
  {
    id: 'card-take-photo',
    collocation: 'TAKE A PHOTO',
    verb: 'TAKE',
    nounPhrase: 'a photo',
    thaiMeaning: 'ถ่ายภาพ',
    exampleSentence: 'Can you take a photo of our team at the booth?',
    verbForms: ['take', 'takes', 'took', 'taking', 'taken'],
    category: 'daily',
  },
  {
    id: 'card-give-advice',
    collocation: 'GIVE ADVICE',
    verb: 'GIVE',
    nounPhrase: 'advice',
    thaiMeaning: 'ให้คำแนะนำ',
    exampleSentence: 'The senior student gave great advice on choosing electives.',
    verbForms: ['give', 'gives', 'gave', 'giving', 'given'],
    category: 'campus',
  },
  {
    id: 'card-catch-eye',
    collocation: "CATCH SOMEONE'S EYE",
    verb: 'CATCH',
    nounPhrase: "someone's eye",
    thaiMeaning: 'สะดุดตา / ดึงดูดความสนใจ',
    exampleSentence: 'Her stylish presentation slides caught the professor\'s eye.',
    verbForms: ['catch', 'catches', 'caught', 'catching'],
    category: 'action',
  },
];

export const CHALLENGE_CARDS = CHALLENGE_CARDS_POOL.slice(0, 7);
export const MATCHING_PAIRS = DEFAULT_MATCHING_PAIRS;
