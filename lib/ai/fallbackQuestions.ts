import type { Question } from "@/lib/game/types";

// Deterministic question bank. Demo Mode never depends on a live API call:
// if Claude is slow, errors, or has no key, battles draw from here.
// Bands: beginner (levels 1-3), intermediate (4-6), advanced (7+).

export interface BankEntry {
  beginner: Question[];
  intermediate: Question[];
  advanced: Question[];
}

const PYTHON: BankEntry = {
  beginner: [
    { q: "What does len(\"hello\") return?", options: ["4", "5", "6", "An error"], a: 1, why: "len() counts characters; \"hello\" has 5." },
    { q: "Which of these creates a list in Python?", options: ["(1, 2, 3)", "{1, 2, 3}", "[1, 2, 3]", "<1, 2, 3>"], a: 2, why: "Square brackets make a list; parens a tuple, braces a set." },
    { q: "What is the result of 7 // 2?", options: ["3.5", "3", "4", "1"], a: 1, why: "// is floor division — it drops the remainder." },
    { q: "How do you start a comment in Python?", options: ["//", "<!--", "#", "/*"], a: 2, why: "Python comments start with #." },
    { q: "What does range(3) produce?", options: ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3, 2, 1"], a: 1, why: "range(n) starts at 0 and stops before n." },
    { q: "Which keyword defines a function?", options: ["func", "define", "def", "fn"], a: 2, why: "Functions are declared with def." },
    { q: "What is the value of bool(\"\")?", options: ["True", "False", "None", "An error"], a: 1, why: "Empty strings are falsy in Python." },
    { q: "What does my_list.append(4) do?", options: ["Inserts 4 at the start", "Adds 4 to the end", "Replaces the list with 4", "Returns a new list with 4"], a: 1, why: "append() mutates the list, adding the item at the end." },
  ],
  intermediate: [
    { q: "What does [x * 2 for x in range(3)] evaluate to?", options: ["[0, 2, 4]", "[2, 4, 6]", "[0, 1, 2]", "[1, 2, 4]"], a: 0, why: "range(3) gives 0,1,2; each is doubled." },
    { q: "What is the difference between a list and a tuple?", options: ["Tuples are ordered, lists are not", "Lists are immutable", "Tuples are immutable", "There is no difference"], a: 2, why: "Tuples can't be changed after creation; lists can." },
    { q: "What does dict.get(\"k\", 0) return when \"k\" is missing?", options: ["None", "KeyError", "0", "False"], a: 2, why: ".get() returns the provided default instead of raising." },
    { q: "What does *args in a function signature collect?", options: ["Keyword arguments as a dict", "Positional arguments as a tuple", "Global variables", "Default values"], a: 1, why: "*args gathers extra positional args into a tuple; **kwargs gathers keywords." },
    { q: "Which statement about Python's 'is' operator is true?", options: ["It compares values", "It compares identities (same object)", "It only works on numbers", "It is an alias for =="], a: 1, why: "'is' checks whether two names point at the same object." },
    { q: "What does enumerate([\"a\", \"b\"]) yield?", options: ["(\"a\", \"b\")", "(0, \"a\") then (1, \"b\")", "(1, \"a\") then (2, \"b\")", "[\"a\", \"b\"]"], a: 1, why: "enumerate pairs each item with its index, starting at 0." },
    { q: "What happens with the mutable default: def f(x, acc=[])?", options: ["acc resets each call", "acc is shared across calls", "It is a syntax error", "acc becomes a tuple"], a: 1, why: "Default values are evaluated once — the same list persists between calls." },
    { q: "What does 'with open(f) as fh:' guarantee?", options: ["The file is read fully", "The file is closed on exit", "The file is created", "Reads are buffered"], a: 1, why: "Context managers close the resource even if an exception is raised." },
  ],
  advanced: [
    { q: "What does the GIL prevent in CPython?", options: ["Multiple processes", "True parallel execution of Python bytecode in threads", "Async I/O", "Garbage collection"], a: 1, why: "The Global Interpreter Lock lets only one thread run Python bytecode at a time." },
    { q: "What is a generator's key property?", options: ["It stores all values in memory", "It produces values lazily, one at a time", "It runs in a separate thread", "It cannot be iterated twice or once"], a: 1, why: "Generators yield values on demand instead of building the whole sequence." },
    { q: "What does functools.lru_cache do?", options: ["Limits recursion depth", "Memoizes function results by arguments", "Compiles the function to C", "Runs the function lazily"], a: 1, why: "It caches return values keyed by the call arguments." },
    { q: "In asyncio, what does 'await' do?", options: ["Blocks the whole thread", "Yields control until the awaitable completes", "Starts a new thread", "Cancels the task"], a: 1, why: "await suspends the coroutine so the event loop can run other work." },
    { q: "What is the MRO in Python classes?", options: ["Memory reclamation order", "The order base classes are searched for attributes", "Module resolution order", "Method retry order"], a: 1, why: "Method Resolution Order (C3 linearization) decides attribute lookup across bases." },
    { q: "Why prefer 'x is None' over 'x == None'?", options: ["It is faster only", "== can be overridden and lie; None is a singleton", "is works on all types", "There is no reason"], a: 1, why: "__eq__ can be customized; identity with the None singleton cannot." },
  ],
};

const UI_DESIGN: BankEntry = {
  beginner: [
    { q: "What is visual hierarchy?", options: ["Using only one font size", "Arranging elements so the eye sees the most important first", "Stacking elements vertically", "A file-naming convention"], a: 1, why: "Hierarchy guides attention with size, weight, contrast, and position." },
    { q: "Roughly what minimum contrast ratio does body text need (WCAG AA)?", options: ["1.5:1", "2:1", "4.5:1", "10:1"], a: 2, why: "WCAG AA requires 4.5:1 for normal-size text." },
    { q: "What is whitespace in UI design?", options: ["Wasted screen area", "Empty space that groups and separates content", "White backgrounds only", "A bug in the layout"], a: 1, why: "Negative space is an active tool for grouping and breathing room." },
    { q: "Which is a common minimum touch target size?", options: ["12px", "24px", "44px", "100px"], a: 2, why: "~44px (Apple) / 48dp (Google) keeps taps reliable." },
    { q: "What does 'above the fold' mean?", options: ["Content visible without scrolling", "The page footer", "A collapsed menu", "Printed layouts only"], a: 0, why: "It's what users see before any scrolling — prime real estate." },
    { q: "Serif vs sans-serif: which is which?", options: ["Serifs have small strokes at letter ends", "Sans-serif has decorative flourishes", "Serif means bold", "They are the same"], a: 0, why: "Serifs are the small finishing strokes; sans-serif fonts lack them." },
    { q: "What is a wireframe?", options: ["Final polished design", "A low-fidelity structural sketch of a screen", "A CSS framework", "An animation curve"], a: 1, why: "Wireframes lay out structure before visual polish." },
  ],
  intermediate: [
    { q: "What is Fitts's law about?", options: ["Color harmony", "Time to reach a target depends on its size and distance", "Reading speed", "Grid columns"], a: 1, why: "Bigger, closer targets are faster to hit — size your click areas accordingly." },
    { q: "Why use a type scale?", options: ["It reduces font loading", "Consistent, proportional size steps create rhythm and hierarchy", "Browsers require it", "It enables dark mode"], a: 1, why: "A modular scale keeps sizes harmonious instead of arbitrary." },
    { q: "What is progressive disclosure?", options: ["Showing everything at once", "Revealing complexity only as the user needs it", "A loading animation", "A/B testing"], a: 1, why: "Hide advanced options until relevant to reduce cognitive load." },
    { q: "The '60-30-10 rule' refers to what?", options: ["Grid ratios", "Proportions of dominant, secondary, and accent colors", "Font weights", "Spacing units"], a: 1, why: "It balances a palette: 60% dominant, 30% secondary, 10% accent." },
    { q: "What is a design token?", options: ["A login credential", "A named, reusable design value like color.primary", "An NFT", "A Figma plugin"], a: 1, why: "Tokens centralize values (colors, spacing) so systems stay consistent." },
    { q: "When should you use a modal dialog?", options: ["For every message", "For focused tasks that must interrupt the flow", "To display long articles", "Never"], a: 1, why: "Modals block context — reserve them for decisions that truly require attention." },
    { q: "What does 'affordance' mean?", options: ["The price of a design", "Visual cues that suggest how an element is used", "Page load budget", "Screen density"], a: 1, why: "A button that looks pressable affords clicking." },
  ],
  advanced: [
    { q: "What is the Doherty threshold?", options: ["400ms — response time that keeps users in flow", "The max colors per palette", "60fps animation budget", "7±2 menu items"], a: 0, why: "Under ~400ms response, productivity and engagement stay high." },
    { q: "Optical alignment sometimes beats mathematical alignment because…", options: ["Grids are obsolete", "Perceived alignment depends on visual weight, not just geometry", "It is faster to implement", "Browsers round pixels"], a: 1, why: "A triangle centered by math looks off; the eye judges mass, not boxes." },
    { q: "What is an 'escape hatch' in UX?", options: ["A hidden admin panel", "An always-available way to back out of a flow", "A keyboard shortcut", "An error page"], a: 1, why: "Users need a clear exit (cancel, undo, back) to explore confidently." },
    { q: "Why can pure #000 on #FFF body text be suboptimal?", options: ["It fails WCAG", "Maximum contrast can cause halation/eye strain for long reading", "Black is out of fashion", "It renders slowly"], a: 1, why: "Slightly softened near-blacks often read more comfortably at length." },
    { q: "What is the Kano model used for?", options: ["Color contrast", "Classifying features by how they drive satisfaction", "Grid systems", "Icon design"], a: 1, why: "It splits features into basics, performance, and delighters." },
  ],
};

const MARKETING: BankEntry = {
  beginner: [
    { q: "What does CTA stand for?", options: ["Cost to acquire", "Call to action", "Click-through average", "Customer trust assessment"], a: 1, why: "A CTA tells the audience the next step: sign up, buy, subscribe." },
    { q: "What is a target audience?", options: ["Everyone on the internet", "The specific group most likely to want your product", "Your competitors", "Paying customers only"], a: 1, why: "Focusing on a defined group makes messaging land." },
    { q: "What is a conversion?", options: ["Any website visit", "A user completing the action you wanted", "A social media follow only", "A paid ad view"], a: 1, why: "Conversion = the desired action, from purchase to signup." },
    { q: "Organic reach means…", options: ["Paid ad impressions", "Audience reached without paying for distribution", "Email open rate", "Influencer posts"], a: 1, why: "Organic = unpaid: SEO, social shares, word of mouth." },
    { q: "What is a value proposition?", options: ["Your pricing table", "A clear statement of the benefit you deliver and why you", "A mission statement", "A slogan's rhyme scheme"], a: 1, why: "It answers 'why should I buy this, from you, instead of anything else?'" },
    { q: "What does B2B mean?", options: ["Buy-to-build", "Business-to-business", "Brand-to-buyer", "Back-to-basics"], a: 1, why: "B2B companies sell to other businesses rather than consumers." },
    { q: "An 'impression' in advertising is…", options: ["A click", "One display of your ad or content", "A purchase", "A review"], a: 1, why: "Impressions count views/renders, not engagement." },
  ],
  intermediate: [
    { q: "What is CAC?", options: ["Customer acquisition cost", "Content approval cycle", "Click-attribution channel", "Campaign audit checklist"], a: 0, why: "CAC = total sales & marketing spend ÷ new customers acquired." },
    { q: "A good email subject line primarily optimizes for…", options: ["Length", "Open rate", "Unsubscribes", "Domain reputation"], a: 1, why: "The subject line's one job is getting the email opened." },
    { q: "What is A/B testing?", options: ["Testing on two browsers", "Comparing two variants to see which performs better", "Running two campaigns simultaneously on all users", "Audience/budget testing"], a: 1, why: "Split users between variants, measure, keep the winner." },
    { q: "The marketing funnel typically flows…", options: ["Loyalty → awareness", "Awareness → consideration → conversion", "Conversion → consideration", "Impressions → unsubscribes"], a: 1, why: "People discover, evaluate, then act — messaging differs per stage." },
    { q: "What is churn rate?", options: ["Rate of new signups", "Percent of customers who leave over a period", "Ad refresh frequency", "Content posting cadence"], a: 1, why: "Churn measures customer loss — retention's mirror." },
    { q: "Segmentation means…", options: ["Splitting your audience into groups with shared traits", "Dividing the ad budget evenly", "Breaking a blog into chapters", "Testing page speed"], a: 0, why: "Segments get more relevant messaging than one-size-fits-all blasts." },
    { q: "What is social proof?", options: ["Verifying accounts", "Evidence others trust you: reviews, logos, testimonials", "Follower purchase", "A/B test results"], a: 1, why: "People look to others' behavior when deciding — show it." },
  ],
  advanced: [
    { q: "LTV:CAC ratio of ~3:1 generally signals…", options: ["Overspending on ads", "Healthy unit economics", "Imminent churn", "Underpriced product"], a: 1, why: "Customers returning ~3× their acquisition cost is a common health benchmark." },
    { q: "What is attribution modeling?", options: ["Crediting conversions to the touchpoints that drove them", "Assigning blog authorship", "Trademarking slogans", "Audience lookalikes"], a: 0, why: "First-touch, last-touch, and multi-touch models split conversion credit differently." },
    { q: "What is a north star metric?", options: ["Total revenue always", "The single metric that best captures delivered core value", "Website uptime", "Brand sentiment"], a: 1, why: "One value-centric metric aligns growth efforts (e.g., weekly active teams)." },
    { q: "Price anchoring works by…", options: ["Fixing prices to inflation", "Showing a higher reference price to make the target feel reasonable", "Rounding to .99", "Hiding prices"], a: 1, why: "The first number seen skews perceived value of what follows." },
    { q: "What is cohort analysis for?", options: ["Grouping users by start period to compare behavior over time", "Ranking influencers", "Clustering keywords", "Budget allocation only"], a: 0, why: "Cohorts reveal whether retention is actually improving release over release." },
  ],
};

// Generic bank used when a custom skill has no Claude access to generate
// real questions (offline demo). Framed as learning-science questions.
const LEARNING: BankEntry = {
  beginner: [
    { q: "What is spaced repetition?", options: ["Cramming before a test", "Reviewing material at increasing intervals", "Reading the same page twice", "Studying in one long session"], a: 1, why: "Spacing reviews out beats massed practice for retention." },
    { q: "Active recall means…", options: ["Re-reading notes", "Testing yourself from memory", "Highlighting text", "Listening to lectures"], a: 1, why: "Retrieving from memory strengthens it far more than re-exposure." },
    { q: "What is deliberate practice?", options: ["Practicing what you're already good at", "Focused practice on weaknesses with feedback", "Practicing daily regardless of focus", "Watching experts"], a: 1, why: "Targeting weaknesses with feedback drives improvement." },
    { q: "The 'testing effect' says…", options: ["Tests cause anxiety only", "Taking tests improves long-term retention", "Tests only measure learning", "Retesting is useless"], a: 1, why: "Retrieval practice is itself a powerful learning event." },
  ],
  intermediate: [
    { q: "What is interleaving?", options: ["Studying one topic to mastery first", "Mixing related topics within a session", "Taking long breaks", "Copying notes"], a: 1, why: "Mixing topics improves discrimination and transfer vs blocking." },
    { q: "The Feynman technique is…", options: ["Speed reading", "Explaining a concept simply to expose gaps", "Memorizing formulas", "Group study"], a: 1, why: "If you can't explain it plainly, you've found what to relearn." },
    { q: "Desirable difficulty refers to…", options: ["Making study unpleasant", "Challenges that slow learning now but deepen it long-term", "Skipping fundamentals", "Harder exams"], a: 1, why: "Effortful retrieval and spacing feel worse but work better." },
    { q: "What is the forgetting curve?", options: ["Memory decays over time without review", "Learning speeds up with age", "Notes degrade physically", "Attention drops in lectures"], a: 0, why: "Ebbinghaus showed rapid decay — reviews flatten the curve." },
  ],
  advanced: [
    { q: "Transfer of learning is hardest when…", options: ["Contexts are similar", "Surface features differ from practice conditions", "You practice a lot", "Feedback is immediate"], a: 1, why: "Skills stick to context; varied practice broadens transfer." },
    { q: "What does metacognition add to studying?", options: ["More hours", "Monitoring and adjusting your own learning strategies", "Better highlighting", "Faster reading"], a: 1, why: "Knowing what you don't know directs effort where it pays." },
    { q: "Why is fluency a poor mastery signal?", options: ["It isn't — fluency equals mastery", "Easy recognition can masquerade as recall ability", "Fluency can't be measured", "Experts are never fluent"], a: 1, why: "Re-reading feels smooth but retrieval is what exams demand." },
  ],
};

const BANKS: Record<string, BankEntry> = {
  python: PYTHON,
  "ui design": UI_DESIGN,
  marketing: MARKETING,
};

export function bandForLevel(level: number): keyof BankEntry {
  if (level <= 3) return "beginner";
  if (level <= 6) return "intermediate";
  return "advanced";
}

/**
 * Pull `count` questions for a skill/level from the local bank. Unknown skills
 * fall back to the learning-science bank. Pads from adjacent bands if needed.
 */
export function fallbackQuestions(skill: string, level: number, count: number): Question[] {
  const bank = BANKS[skill.trim().toLowerCase()] ?? LEARNING;
  const band = bandForLevel(level);
  const pool = [
    ...bank[band],
    ...(band === "beginner" ? bank.intermediate : bank.beginner),
    ...bank.advanced,
  ];
  return pool.slice(0, count);
}

export function hasBankFor(skill: string): boolean {
  return skill.trim().toLowerCase() in BANKS;
}
