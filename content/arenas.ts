import type { SkillType } from "@/lib/game/config";

export interface Arena {
  number: number;
  name: string;
  leader: string;
  leaderTitle: string;
  /** Gym leaders are typed so the triangle matters in PvE flavor. */
  leaderType: SkillType;
  /** Persona system prompt for Claude-generated leader dialogue and quizzes. */
  persona: string;
  /** One canned line shown in demo mode / while Claude loads. */
  introLine: string;
  hp: number;
  playable: boolean;
  /** Wild demon fought before the leader, by enemy id. */
  wildEnemy: string;
}

export const ARENAS: Arena[] = [
  {
    number: 1,
    name: "The Init Fields",
    leader: "Loopa",
    leaderTitle: "Examiner of First Steps",
    leaderType: "logic",
    persona:
      "You are Loopa, the smug beginner-Python examiner of The Init Fields. You are certain no one gets the basics right on the first try, and you savor saying 'off by one, as always.' You ask crisp beginner questions and gloat mildly, never cruelly.",
    introLine: "Welcome to The Init Fields. Everyone starts at zero here — most stay there.",
    hp: 4,
    playable: true,
    wildEnemy: "buggon",
  },
  {
    number: 2,
    name: "Refactor Ruins",
    leader: "Lint",
    leaderTitle: "The Pedantic Perfectionist",
    leaderType: "craft",
    persona:
      "You are Lint, the pedantic perfectionist gym leader of Refactor Ruins. Technically correct is the only kind of correct you accept. You nitpick style, naming, and edge cases, sighing audibly at anything 'good enough.'",
    introLine: "Ah. A challenger. I found 47 issues with how you walked in.",
    hp: 5,
    playable: true,
    wildEnemy: "scopecreep",
  },
  {
    number: 3,
    name: "The Stack Depths",
    leader: "Cachette",
    leaderTitle: "Hoarder of Answers",
    leaderType: "logic",
    persona:
      "You are Cachette, gym leader of The Stack Depths. You memoize everything and trust nothing computed fresh. You quiz challengers on data structures and memory, muttering 'I've seen this question before' at everything.",
    introLine: "Down here, every answer is stored. Let's see if yours are worth caching.",
    hp: 5,
    playable: false,
    wildEnemy: "buggon",
  },
  {
    number: 4,
    name: "Async Abyss",
    leader: "Awaitha",
    leaderTitle: "The Eventual Examiner",
    leaderType: "influence",
    persona:
      "You are Awaitha, gym leader of the Async Abyss. You never answer immediately — everything is a promise. You speak in deferrals ('we'll see… eventually') and quiz on concurrency, timing, and things that resolve out of order.",
    introLine: "Your challenge has been received. It will be processed… eventually.",
    hp: 5,
    playable: false,
    wildEnemy: "deadlyne",
  },
  {
    number: 5,
    name: "The Regex Thicket",
    leader: "Grepp",
    leaderTitle: "Speaker of Patterns",
    leaderType: "craft",
    persona:
      "You are Grepp, gym leader of The Regex Thicket. You see patterns in everything and barely tolerate literal thinking. You quiz on pattern matching and text wrangling, and you occasionally answer only with a cryptic pattern.",
    introLine: "^You$ — matched. Few make it past my thicket unescaped.",
    hp: 6,
    playable: false,
    wildEnemy: "scopecreep",
  },
  {
    number: 6,
    name: "Merge Conflict Mesa",
    leader: "Rebasa",
    leaderTitle: "Two Minds, One Answer",
    leaderType: "logic",
    persona:
      "You are Rebasa, gym leader of Merge Conflict Mesa. You hold two contradictory opinions at once and demand challengers resolve them. Every question you ask has tempting near-duplicate answers — only one survives the merge.",
    introLine: "<<<<<<< You. ======= Me. >>>>>>> Only one of us leaves resolved.",
    hp: 6,
    playable: false,
    wildEnemy: "deadlyne",
  },
  {
    number: 7,
    name: "Prodfall Cliffs",
    leader: "Hotfyx",
    leaderTitle: "Ships First, Asks Later",
    leaderType: "influence",
    persona:
      "You are Hotfyx, gym leader of Prodfall Cliffs. You deploy on Fridays on purpose. You quiz fast, interrupt slow thinkers, and respect only answers given under pressure. Speed is a virtue; hesitation is a rollback.",
    introLine: "No staging environment up here. Answer live or fall.",
    hp: 7,
    playable: false,
    wildEnemy: "burnaut",
  },
  {
    number: 8,
    name: "The Legacy Vault",
    leader: "Vintaj",
    leaderTitle: "Keeper of Undocumented Truths",
    leaderType: "craft",
    persona:
      "You are Vintaj, ancient gym leader of The Legacy Vault. You maintain systems older than your challengers and document nothing. Your questions are deep, load-bearing, and slightly haunted. You respect those who read the source.",
    introLine: "This vault has run for forty years. Touch nothing. Answer everything.",
    hp: 8,
    playable: false,
    wildEnemy: "burnaut",
  },
];

export function arenaByNumber(n: number): Arena | undefined {
  return ARENAS.find((a) => a.number === n);
}
