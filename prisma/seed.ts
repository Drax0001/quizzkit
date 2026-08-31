// `next dev`/`next build` load .env automatically; a standalone `tsx`
// script does not, so this seed (and any other script run outside Next)
// needs it explicitly.
import "dotenv/config";
import { db } from "../lib/db";
import { domain } from "../config/domain.config";

type SeedQuestion = {
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
};

const SEED_QUESTIONS: Record<string, SeedQuestion[]> = {
  Science: [
    {
      text: "What planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correct: 1,
      explanation:
        "Iron oxide (rust) on its surface gives Mars its reddish color.",
    },
    {
      text: "What gas do plants absorb from the atmosphere for photosynthesis?",
      options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
      correct: 2,
      explanation:
        "Plants use CO2, water, and light to produce glucose and oxygen.",
    },
    {
      text: "What is the chemical symbol for gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correct: 2,
      explanation: '"Au" comes from the Latin word for gold, aurum.',
    },
  ],
  History: [
    {
      text: "In which year did World War II end?",
      options: ["1943", "1945", "1947", "1950"],
      correct: 1,
      explanation: "Japan's surrender in September 1945 marked the war's end.",
    },
    {
      text: "Who was the first President of the United States?",
      options: [
        "Thomas Jefferson",
        "John Adams",
        "George Washington",
        "Benjamin Franklin",
      ],
      correct: 2,
      explanation: "Washington served two terms, from 1789 to 1797.",
    },
    {
      text: "The ancient pyramids of Giza were built in which country?",
      options: ["Mexico", "Egypt", "Peru", "Greece"],
      correct: 1,
      explanation:
        "The Giza pyramid complex sits on the outskirts of Cairo, Egypt.",
    },
  ],
  Geography: [
    {
      text: "What is the longest river in the world?",
      options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
      correct: 1,
      explanation:
        "The Nile stretches roughly 6,650 km through northeastern Africa.",
    },
    {
      text: "Which is the smallest country in the world by area?",
      options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"],
      correct: 2,
      explanation: "Vatican City covers about 0.44 square kilometers.",
    },
    {
      text: "Mount Everest is located in which mountain range?",
      options: ["Andes", "Alps", "Himalayas", "Rockies"],
      correct: 2,
      explanation:
        "Everest sits on the border between Nepal and Tibet (China).",
    },
  ],
};

const OPTION_KEYS = ["a", "b", "c", "d"] as const;

async function main() {
  for (const [index, seedCategory] of domain.taxonomySeed.entries()) {
    const category = await db.category.upsert({
      where: { name: seedCategory.name },
      update: {},
      create: {
        name: seedCategory.name,
        icon: seedCategory.icon,
        order: index,
      },
    });

    const questions = SEED_QUESTIONS[seedCategory.name] ?? [];
    for (const q of questions) {
      const existing = await db.question.findFirst({
        where: { categoryId: category.id, text: q.text },
      });
      if (existing) continue;

      await db.question.create({
        data: {
          categoryId: category.id,
          text: q.text,
          optionA: q.options[0],
          optionB: q.options[1],
          optionC: q.options[2],
          optionD: q.options[3],
          correctOption: OPTION_KEYS[q.correct],
          explanation: q.explanation,
        },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
