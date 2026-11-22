// All the game's content: toys, computer friends, bags, challenges, stories.

export const CATS = {
  squishy: { name: 'Squishies', one: 'squishy' },
  fidget: { name: 'Fidgets', one: 'fidget' },
  slime: { name: 'Slimes', one: 'slime' },
  putty: { name: 'Putty', one: 'putty' },
  dough: { name: 'Play Dough', one: 'play dough' },
  springy: { name: 'Springies', one: 'springy' },
  plushie: { name: 'Plushies', one: 'plushie' },
};

export const RARITY = {
  c: { name: 'Common', value: 10 },
  r: { name: 'Rare', value: 25 },
  e: { name: 'Epic', value: 60 },
  l: { name: 'Legendary', value: 150 },
};

// id|name|shape|colour 1|colour 2|rarity|effect
const RAW = {
  squishy: `
sq01|Mochi Moo|blob|white|pink|c
sq02|Peachy Puff|blob|peach||c
sq03|Minty Mochi|blob|mint||c
sq04|Kitty Bean|cat|peach||c
sq05|Midnight Kitty|cat|grape||r
sq06|Honey Bear|bear|tan||c
sq07|Bubblegum Bear|bear|pink||r
sq08|Hoppy Bun|bunny|white||c
sq09|Lilac Bun|bunny|lilac||r
sq10|Ribbit|frog|lime||c
sq11|Dreamy Cloud|cloud|white||c
sq12|Rainbow Cloud|cloud|white||e|rainbow
sq13|Twinkle Star|star|yellow||c
sq14|Galaxy Star|star|grape||l|galaxy
sq15|Sweetheart|heart|red||r
sq16|Sprinkle Donut|donut|tan|pink|c
sq17|Choco Donut|donut|tan|choc|r
sq18|Berry Bop|berry|red||c
sq19|Dewdrop|drop|sky||c
sq20|Dumpling Dan|bun|cream||r
sq21|Toasty|toast|cream|tan|c
sq22|Sunny Egg|egg|white|yellow|r
sq23|Sparkle Unicorn|unicorn|white|pink|l|glitter
sq24|Dino Squish|dino|teal||e
sq25|Golden Mochi|blob|gold||l|glitter
sq26|Blueberry Bop|berry|blue||e
sq27|Vanilla Cone|icecream|cream||c
sq28|Strawberry Cone|icecream|pink||r
sq29|Birthday Cupcake|cupcake|pink|yellow|c
sq30|Midnight Cupcake|cupcake|grape|sky|e|galaxy
sq31|Avo Cuddle|avocado|lime||c
sq32|Inky Octo|octopus|lilac||r
sq33|Rainbow Octo|octopus|pink||e|rainbow
sq34|Dotty Mushroom|mushroom|red||c
sq35|Bubbles the Whale|whale|sky||r
sq36|Boba Buddy|boba|tan||r
sq37|Taro Boba|boba|lilac||e
sq38|Boo Boo|ghost|white||c
sq39|Glow Ghost|ghost|mint||e|glow
sq40|Peep|chick|yellow||c
sq41|Melon Slice|melon|red||c
sq42|Prickles|cactus|lime||r
sq43|Nelly Narwhal|narwhal|sky||l|glitter`,
  fidget: `
fi01|Rainbow Popper|popper|pink||r|rainbow
fi02|Pink Popper|popper|pink||c
fi03|Mint Popper|popper|mint||c
fi04|Round Popper|popround|sky||c
fi05|Sunset Popper|popround|orange||r
fi06|Zoom Spinner|spinner|blue|yellow|c
fi07|Fire Spinner|spinner|red|orange|r
fi08|Galaxy Spinner|spinner|grape|sky|l|galaxy
fi09|Click Cube|cube|teal|yellow|c
fi10|Candy Cube|cube|pink|mint|r
fi11|Twisty Loop|twisty|lime|blue|c
fi12|Candy Twisty|twisty|pink|white|r
fi13|Happy Keycap|keycap|yellow||c
fi14|Grape Keycap|keycap|grape||e
fi15|Gold Popper|popper|gold||l|glitter
fi16|Glitter Spinner|spinner|lilac|pink|e|glitter
fi17|Pea Pod Popper|peapod|lime||c
fi18|Gear Spinner|gear|gray|blue|r
fi19|Gold Gears|gear|gold|orange|l|glitter
fi20|Smiley Squeeze|squeeze|yellow||c
fi21|Galaxy Squeeze|squeeze|grape||e|galaxy
fi22|Snap Track|track|pink||r|rainbow
fi23|Heart Popper|popheart|red||r
fi24|Rainbow Heart Popper|popheart|pink||e|rainbow`,
  slime: `
sl01|Strawberry Slime|glossy|pink||c
sl02|Ocean Slime|glossy|blue||c
sl03|Lime Goo|glossy|lime||c
sl04|Cloud Slime|cloud|sky||r
sl05|Cotton Candy Cloud|cloud|pink||r
sl06|Crunchy Rainbow|crunchy|white||e
sl07|Crunchy Mint|crunchy|mint||r
sl08|Butter Slime|butter|yellow||c
sl09|Peach Butter|butter|peach||c
sl10|Crystal Clear|clear|sky||r
sl11|Galaxy Slime|glossy|grape||l|galaxy
sl12|Unicorn Slime|glossy|pink||e|rainbow
sl13|Glow Goo|glossy|lime||e|glow
sl14|Gold Dust Slime|clear|gold||l|glitter
sl15|Grape Jelly Slime|glossy|grape||c
sl16|Bubblegum Butter|butter|pink||c
sl17|Snow Cloud|cloud|white||r
sl18|Fishbowl Slime|crunchy|sky||r
sl19|Lava Slime|glossy|orange||e|glow
sl20|Mermaid Slime|clear|teal||e|glitter`,
  putty: `
pu01|Bubblegum Putty|swirl|pink|white|c
pu02|Ocean Swirl|swirl|blue|teal|c
pu03|Sunset Swirl|swirl|orange|yellow|c
pu04|Jungle Swirl|swirl|lime|teal|c
pu05|Silver Shine|metal|gray||r
pu06|Rose Gold|metal|rose||r
pu07|Glow Green|glow|lime||r
pu08|Glow Moon|glow|sky||e
pu09|Magnet Monster|magnet|grape||e
pu10|Rainbow Swirl|swirl|pink|white|e|rainbow
pu11|Galaxy Putty|swirl|grape|sky|l|galaxy
pu12|Gold Rush|metal|gold||l|glitter
pu13|Cotton Candy Swirl|swirl|pink|sky|c
pu14|Lava Putty|swirl|red|orange|r
pu15|Glow Pink|glow|pink||r
pu16|Mermaid Shine|metal|teal||e|glitter`,
  dough: `
do01|Red Dough|ball|red||c
do02|Blue Dough|ball|blue||c
do03|Sunny Dough|ball|yellow||c
do04|Mint Swirl|swirl|mint||c
do05|Berry Swirl|swirl|pink||r
do06|Star Dough|star|orange||c
do07|Purple Star|star|grape||r
do08|Dough Snake|snake|lime||r
do09|Rainbow Snake|snake|pink||e|rainbow
do10|Sparkle Dough|ball|lilac||e|glitter
do11|Choco Swirl|swirl|choc||r
do12|Golden Star Dough|star|gold||l|glitter
do13|Heart Dough|heart|pink||c
do14|Teal Dough|ball|teal||c
do15|Orange Swirl|swirl|orange||c
do16|Candy Snake|snake|red||r
do17|Galaxy Dough|ball|grape||e|galaxy
do18|Rainbow Heart Dough|heart|pink||e|rainbow`,
  springy: `
sp01|Classic Springy|arc|gray||c
sp02|Pink Springy|arc|pink||c
sp03|Blue Springy|arc|blue||c
sp04|Lime Springy|stack|lime||c
sp05|Candy Stripe|arc|red|white|r
sp06|Bumblebee|stack|yellow|navy|r
sp07|Rainbow Springy|arc|pink||e|rainbow
sp08|Neon Springy|stack|lime|pink|r
sp09|Mini Springy|stack|sky||c
sp10|Glitter Springy|arc|lilac||e|glitter
sp11|Golden Springy|arc|gold||l|glitter
sp12|Ocean Wave|arc|teal|sky|r
sp13|Sunset Springy|stack|orange|yellow|c
sp14|Grape Springy|arc|grape||c
sp15|Mint Stack|stack|mint|white|c
sp16|Silver Stack|stack|gray||r
sp17|Rainbow Stack|stack|pink||e|rainbow`,
  plushie: `
pl01|Buttons the Bear|bear|tan|cream|r
pl02|Clover the Bunny|bunny|white|pink|r
pl03|Pumpkin the Cat|cat|orange|cream|r
pl04|Rex the Dino|dino|lime|yellow|e
pl05|Waddles the Penguin|penguin|navy|white|e
pl06|Axel the Axolotl|axolotl|pink|rose|e
pl07|Maple the Fox|fox|orange|white|e
pl08|Stardust the Unicorn|unicorn|white|lilac|l|glitter
pl09|Blueberry the Bear|bear|blue|sky|r
pl10|Snowball the Bunny|bunny|sky|white|r
pl11|Shadow the Cat|cat|grape|lilac|e
pl12|Ember the Dragon|dino|red|gold|l
pl13|Bamboo the Panda|panda|white|navy|e
pl14|Kiki the Koala|koala|gray|white|r
pl15|Hopper the Frog|frog|lime|cream|r
pl16|Sunny the Lion|lion|yellow|orange|e
pl17|Mint the Dino|dino|mint|teal|r
pl18|Cocoa the Bear|bear|choc|tan|r`,
};

export const TOYS = {};
export const TOY_LIST = [];
for (const cat in RAW) {
  RAW[cat].trim().split('\n').forEach((line) => {
    const [id, name, v, c1, c2, r, fx] = line.trim().split('|');
    const toy = { id, name, cat, v, c1, c2: c2 || '', r, fx: fx || '', value: RARITY[r].value };
    TOYS[id] = toy;
    TOY_LIST.push(toy);
  });
}
export const byCat = (cat) => TOY_LIST.filter((t) => t.cat === cat);

// Computer friends. thr = how fair a trade must be before they say yes.
export const FRIENDS = [
  { id: 'poppy', name: 'Poppy', avatar: 'pl02', fav: 'slime', thr: 0.85, say: 'I love anything gooey!' },
  { id: 'max', name: 'Max', avatar: 'pl04', fav: 'fidget', thr: 1.0, say: 'Click, pop, spin. Fidgets are the best.' },
  { id: 'luna', name: 'Luna', avatar: 'pl11', fav: 'squishy', thr: 1.1, say: 'Only the squishiest squishies for me.' },
  { id: 'ollie', name: 'Ollie', avatar: 'pl05', fav: 'springy', thr: 0.9, say: 'Boing! Got any springies?' },
  { id: 'zara', name: 'Zara', avatar: 'pl07', fav: 'putty', thr: 1.05, say: 'I collect putty tins. All of them.' },
  { id: 'benny', name: 'Benny', avatar: 'pl01', fav: 'dough', thr: 0.8, say: 'I am building a play dough bakery.' },
  { id: 'bamboo', name: 'Bamboo', avatar: 'pl13', fav: 'plushie', thr: 1.25, say: 'I collect plushies. I only trade them for something special.' },
  { id: 'kiki', name: 'Kiki', avatar: 'pl14', fav: 'squishy', thr: 0.9, say: 'Soft and squishy is my whole personality.' },
  { id: 'hopper', name: 'Hopper', avatar: 'pl15', fav: 'slime', thr: 1.0, say: 'Ribbit! Slime is my favorite kind of puddle.' },
  { id: 'leo', name: 'Leo', avatar: 'pl16', fav: 'fidget', thr: 1.15, say: 'I am the king of fidgets. Roar!' },
  { id: 'axel', name: 'Axel', avatar: 'pl06', fav: 'dough', thr: 0.95, say: 'I make play dough sea creatures. Want to see?' },
  { id: 'ember', name: 'Ember', avatar: 'pl12', fav: 'springy', thr: 1.2, say: 'Dragons guard treasure. Mine is all springies.' },
];

export const BAGS = [
  { id: 'squishy', name: 'Squishy Bag', cost: 40, cats: ['squishy'], icon: 'sq01', odds: [60, 28, 10, 2] },
  { id: 'fidget', name: 'Fidget Bag', cost: 40, cats: ['fidget'], icon: 'fi02', odds: [60, 28, 10, 2] },
  { id: 'goo', name: 'Slime & Putty Bag', cost: 50, cats: ['slime', 'putty'], icon: 'sl01', odds: [58, 28, 11, 3] },
  { id: 'make', name: 'Dough & Springy Bag', cost: 40, cats: ['dough', 'springy'], icon: 'sp02', odds: [60, 28, 10, 2] },
  { id: 'mega', name: 'Mega Rainbow Bag', cost: 120, cats: ['squishy', 'fidget', 'slime', 'putty', 'dough', 'springy', 'plushie'], icon: 'sq12', odds: [30, 42, 22, 6] },
];

export const QUESTS = [
  { id: 'trade2', text: 'Make 2 trades', ev: 'trade', goal: 2, coins: 40 },
  { id: 'pop40', text: 'Pop 40 bubbles in Pop Party', ev: 'pop', goal: 40, coins: 30 },
  { id: 'game3', text: 'Play 3 mini-games', ev: 'game', goal: 3, coins: 35 },
  { id: 'story1', text: 'Finish a story', ev: 'story', goal: 1, coins: 30 },
  { id: 'bag2', text: 'Open 2 mystery bags', ev: 'bag', goal: 2, coins: 30 },
  { id: 'squish20', text: 'Squish toys 20 times', ev: 'squish', goal: 20, coins: 20 },
  { id: 'catch25', text: 'Catch 25 toys in Squishy Catch', ev: 'catch', goal: 25, coins: 30 },
  { id: 'match1', text: 'Win a game of Memory Match', ev: 'match', goal: 1, coins: 25 },
  { id: 'mix3', text: 'Mix 3 perfect slimes', ev: 'mix', goal: 3, coins: 25 },
  { id: 'sort20', text: 'Sort 20 toys in Toy Sorter', ev: 'sort', goal: 20, coins: 30 },
  { id: 'copy8', text: 'Copy 8 patterns in Copy Cat', ev: 'copy', goal: 8, coins: 30 },
  { id: 'odd10', text: 'Spot 10 odd toys in Odd One Out', ev: 'odd', goal: 10, coins: 30 },
  { id: 'step10', text: 'Land 10 steps in Springy Stairs', ev: 'step', goal: 10, coins: 30 },
];

// Big goals. kind: unique (toys collected), set (finish a family), stat (lifetime counter)
export const GOALS = [
  { id: 'u10', text: 'Collect 10 different toys', kind: 'unique', goal: 10, coins: 40 },
  { id: 'u25', text: 'Collect 25 different toys', kind: 'unique', goal: 25, coins: 100 },
  { id: 'u50', text: 'Collect 50 different toys', kind: 'unique', goal: 50, coins: 200 },
  { id: 'u80', text: 'Collect 80 different toys', kind: 'unique', goal: 80, coins: 350 },
  { id: 'u120', text: 'Collect 120 different toys', kind: 'unique', goal: 120, coins: 500 },
  { id: 'u104', text: 'Collect every single toy', kind: 'unique', goal: TOY_LIST.length, coins: 1000 },
  { id: 't1', text: 'Make your first trade', kind: 'stat', ev: 'trade', goal: 1, coins: 20 },
  { id: 't10', text: 'Make 10 trades', kind: 'stat', ev: 'trade', goal: 10, coins: 80 },
  { id: 't30', text: 'Make 30 trades', kind: 'stat', ev: 'trade', goal: 30, coins: 200 },
  { id: 'f1', text: 'Trade with a real friend', kind: 'stat', ev: 'friendtrade', goal: 1, coins: 60 },
  { id: 's5', text: 'Finish 5 stories', kind: 'storiesN', goal: 5, coins: 150 },
  { id: 's10', text: 'Finish all 10 stories', kind: 'storiesN', goal: 10, coins: 300 },
  { id: 'setsquishy', text: 'Finish the Squishies shelf', kind: 'set', cat: 'squishy', coins: 200, toy: 'pl09' },
  { id: 'setfidget', text: 'Finish the Fidgets shelf', kind: 'set', cat: 'fidget', coins: 200, toy: 'pl04' },
  { id: 'setslime', text: 'Finish the Slimes shelf', kind: 'set', cat: 'slime', coins: 200, toy: 'pl10' },
  { id: 'setputty', text: 'Finish the Putty shelf', kind: 'set', cat: 'putty', coins: 200, toy: 'pl07' },
  { id: 'setdough', text: 'Finish the Play Dough shelf', kind: 'set', cat: 'dough', coins: 200, toy: 'pl11' },
  { id: 'setspringy', text: 'Finish the Springies shelf', kind: 'set', cat: 'springy', coins: 200, toy: 'pl12' },
  { id: 'setplushie', text: 'Finish the Plushies shelf', kind: 'set', cat: 'plushie', coins: 400, toy: 'pl08' },
];

export const WHEEL = [
  { label: '20', coins: 20 },
  { label: '50', coins: 50 },
  { label: '30', coins: 30 },
  { label: 'Bag', bag: 'squishy' },
  { label: '40', coins: 40 },
  { label: '100', coins: 100 },
  { label: '25', coins: 25 },
  { label: 'Plushie', plushie: true },
];

export const PHRASES = ['Hi!', 'Yes please!', 'Can you add more?', 'No thanks', 'So cute!', 'Thank you!'];

// {name} is swapped for the player's name.
export const STORIES = [
  {
    id: 'lost', title: 'The Lost Squishy', toy: 'sq04', prize: 'pl03', coins: 30, start: 'a',
    nodes: {
      a: { art: 'sq04', t: "It is the morning of the big Trade Fair! {name} opens the toy box... but Kitty Bean, the squishiest kitty of all, is gone. Only a trail of glitter is left behind.", c: [['Follow the glitter trail', 'b'], ['Ask the plushies what they saw', 'c']] },
      b: { art: 'sq13', t: 'The glitter trail wiggles down the hall and stops in two places: the laundry basket and the open window.', c: [['Dig in the laundry basket', 'd'], ['Look out the window', 'e']] },
      c: { art: 'pl01', t: "Buttons the Bear rubs his sleepy eyes. \"I heard a tiny squeak-squeak last night,\" he says. \"It came from the kitchen... or maybe the garden.\"", c: [['Tiptoe to the kitchen', 'f'], ['Run to the garden', 'e']] },
      d: { art: 'sq04', t: "Deep in the warm, fluffy socks, something goes squeak! It is Kitty Bean, curled up fast asleep. \"The socks were so cozy,\" she yawns.", end: 'Cozy Detective' },
      e: { art: 'pl03', t: "Outside, a little orange cat plushie is giving Kitty Bean a ride on her back! \"I found her on the windowsill,\" says the cat. \"I kept her safe for you.\"", c: [['Invite the cat to the fair', 'g'], ['Give the cat a thank-you gift', 'h']] },
      f: { art: 'sq16', t: "In the kitchen, Kitty Bean is sitting in a cupcake wrapper, pretending to be a cupcake. \"Surprise!\" she giggles. \"I wanted to be a sweet treat!\"", end: 'Sweet Surprise' },
      g: { art: 'pl03', t: "\"Really? I have never been to a fair!\" The cat's name is Pumpkin, and the three of you walk to the Trade Fair together. Best day ever.", end: 'New Friend' },
      h: { art: 'fi01', t: "{name} gives Pumpkin a shiny popper to say thanks. Pumpkin is so happy she does a backflip. \"Friends forever?\" \"Friends forever.\"", end: 'Thankful Heart' },
    },
  },
  {
    id: 'volcano', title: 'The Slime Volcano', toy: 'sl01', prize: 'pl06', coins: 30, start: 'a',
    nodes: {
      a: { art: 'sl01', t: "{name} and Poppy are making slime for the school science fair. The recipe says ONE spoon of fizzy powder. Poppy holds up the whole jar. \"What if we use ALL of it?\"", c: [['Follow the recipe', 'b'], ['Use it all!', 'c']] },
      b: { art: 'sl10', t: 'One spoon it is. The slime turns smooth, stretchy and perfect. But it looks a little plain. What should go in?', c: [['A pinch of glitter', 'd'], ['A cup of foam beads', 'e']] },
      c: { art: 'sl05', t: 'FIZZZZ! The bowl bubbles up like a volcano! Pink slime spills across the table and heads for the edge!', c: [['Grab the big mixing bowl', 'f'], ['Shout for help', 'g']] },
      d: { art: 'sl11', t: "The slime turns into a swirling galaxy. The judge stretches it as wide as a rainbow. \"First prize for the sparkliest slime!\"", end: 'Sparkle Scientist' },
      e: { art: 'sl06', t: 'CRUNCH, crunch, crunch! Everyone lines up to squeeze the crunchiest slime in school. A little axolotl plushie in the prize box wiggles his gills at you.', end: 'Crunch Master' },
      f: { art: 'sl01', t: "{name} slides the bowl under just in time. SPLOOP! The whole slime volcano lands inside. \"Now we have enough slime for the whole class!\" laughs Poppy.", end: 'Quick Thinker' },
      g: { art: 'pl04', t: "Max and Zara run in with towels and a bucket. Together you scoop up every last blob. \"Teamwork makes the slime work!\" says Max.", end: 'Team Player' },
    },
  },
  {
    id: 'springy', title: "The Springy That Wouldn't Stop", toy: 'sp07', prize: 'pl05', coins: 30, start: 'a',
    nodes: {
      a: { art: 'sp07', t: '{name} sets Rainbow Springy at the top of the stairs. Flip, flop, flip, flop... it reaches the bottom and keeps going. Right out the front door!', c: [['Chase it on foot', 'b'], ['Hop on the scooter', 'c']] },
      b: { art: 'sp07', t: 'Springy flip-flops down the sidewalk and stops at the corner. Left goes to the park. Right goes to the ice cream shop.', c: [['Go left to the park', 'd'], ['Go right for ice cream', 'e']] },
      c: { art: 'sq19', t: 'Zoom! On the scooter, {name} catches up fast. Uh-oh. Springy is heading straight for a big puddle!', c: [['Scoop it up', 'f'], ['Let it splash', 'g']] },
      d: { art: 'pl05', t: "At the park, Springy flips UP the slide and lands in the flippers of a penguin plushie on the swings. \"Is this yours?\" asks the penguin. \"It is very bouncy.\"", end: 'Park Explorer' },
      e: { art: 'sq16', t: "Springy flip-flops right up to the counter. The ice cream seller laughs. \"One scoop for the springy, and one for its friend!\"", end: 'Sweet Chase' },
      f: { art: 'sp07', t: "Got it! Springy jiggles happily in your hands. \"Boing,\" it seems to say. \"Thanks for catching me.\"", end: 'Speedy Catcher' },
      g: { art: 'sp11', t: 'SPLASH! Springy comes out sparkling clean and shiny as new. Even toys need a bath sometimes.', end: 'Splash Champion' },
    },
  },
  {
    id: 'fair', title: 'The Trade That Felt Funny', toy: 'sq23', prize: 'pl02', coins: 30, start: 'a',
    nodes: {
      a: { art: 'do01', t: "At recess, a new kid named Benny holds out a small, plain dough ball. He looks at your Sparkle Unicorn squishy. \"Trade?\" he asks hopefully.", c: [['Trade so he feels happy', 'b'], ["Say \"Let's make it fair\"", 'c']] },
      b: { art: 'sq23', t: 'You trade. Benny is thrilled! But your tummy feels funny. You miss your unicorn, and the trade was not really even.', c: [['Tell Benny how you feel', 'd'], ['Keep quiet for now', 'e']] },
      c: { art: 'fi02', t: "\"My unicorn is super rare,\" you explain kindly. \"What else do you have?\" Benny opens his bag. He has a springy and two poppers too!", c: [['Trade the unicorn for all three', 'f'], ['Trade a different squishy instead', 'g']] },
      d: { art: 'pl01', t: "\"Oh! I did not know it was rare,\" says Benny. \"Let's trade back, and I will find something fair.\" You both feel so much better.", end: 'Honest Heart' },
      e: { art: 'sq11', t: "That night you cannot stop thinking about it. The next day, you tell Benny. He smiles. \"I felt funny too. Let's fix it.\" Friends fix things together.", end: 'Brave Voice' },
      f: { art: 'sp02', t: 'Three toys for one rare one. You both count, you both nod, you both shake hands. That is a fair trade!', end: 'Fair Trader' },
      g: { art: 'sq02', t: 'You keep your unicorn and trade Benny your Peachy Puff for his dough. He hugs it tight. A small trade, and a big new friend.', end: 'Kind Trader' },
    },
  },
  {
    id: 'sleepover', title: 'The Midnight Toy Party', toy: 'pl01', prize: 'pl01', coins: 30, start: 'a',
    nodes: {
      a: { art: 'pl01', t: "It is sleepover night. When the lights go out, {name} hears whispers from the toy shelf. The toys are awake! \"Psst,\" says Buttons the Bear. \"Want to join our midnight party?\"", c: [['Tiptoe over and join', 'b'], ['Pretend to sleep and peek', 'c']] },
      b: { art: 'sq07', t: 'The toys cheer (very quietly). What kind of party should it be?', c: [['A dance party', 'd'], ['A snack picnic', 'e']] },
      c: { art: 'sq03', t: 'Through one open eye, you watch the squishies build a tower. It wobbles... it is going to fall on sleeping Poppy!', c: [['Dive and catch it', 'f'], ['Whisper a warning', 'g']] },
      d: { art: 'sp08', t: 'The springies bounce, the poppers go pop-pop-pop to the beat, and the slimes do the wiggle. You dance until your socks fall off.', end: 'Dance Star' },
      e: { art: 'do06', t: "Play dough pizza! Play dough cookies! Nobody really eats them, but everybody says \"Yum!\" anyway.", end: 'Party Chef' },
      f: { art: 'sq25', t: "You dive and catch the tower with a pillow. Not a single squishy hits the floor. The toys gasp. \"A human hero!\"", end: 'Midnight Hero' },
      g: { art: 'sq13', t: "\"Careful!\" you whisper. The squishies freeze, then build the tower again, with a wide, sturdy bottom this time. Smart thinking.", end: 'Wise Whisperer' },
    },
  },
  {
    id: 'mixup', title: 'The Great Putty Mix-Up', toy: 'pu09', prize: 'pl14', coins: 30, start: 'a',
    nodes: {
      a: { art: 'pu09', t: 'It is show-and-tell day. {name} opens the putty tin to show off Glow Moon... but inside is a purple putty with tiny spikes. This is not your putty! Across the room, Zara is staring into her tin, looking puzzled.', c: [['Walk over and ask Zara', 'b'], ['Try the mystery putty first', 'c']] },
      b: { art: 'pu08', t: "\"I think we mixed up our tins at lunch!\" says Zara. She is holding your Glow Moon. It is her turn to present next, and she looks nervous.", c: [['Swap back right now', 'd'], ['Present together as a team', 'e']] },
      c: { art: 'pu09', t: "You poke it. It crawls toward the paperclips on the teacher's desk and gobbles one up! The whole class gasps. It is magnet putty!", c: [["Tell everyone it is Zara's", 'f'], ['Keep going with the show', 'g']] },
      d: { art: 'pu08', t: 'Swap! Zara makes her putty eat a paperclip. Then you turn off the lights, and Glow Moon shines like a tiny moon. Two great shows.', end: 'Quick Fixer' },
      e: { art: 'pl14', t: "\"Presenting... the Putty Team!\" Magnet Monster chases paperclips while Glow Moon lights the stage. The class claps so loudly that a koala plushie tumbles off the shelf to watch.", end: 'Team Presenter' },
      f: { art: 'pl07', t: "\"This amazing putty belongs to Zara,\" you say. Zara beams and runs up to show its best trick. Giving credit feels even better than getting claps.", end: 'Fair Friend' },
      g: { art: 'pu05', t: "You finish the show, then hand the tin back. \"Your putty is the coolest. Sorry I used it without asking.\" Zara grins. \"Next time, ask first, and I will say yes.\"", end: 'Honest Performer' },
    },
  },
  {
    id: 'fixit', title: 'The Fidget Fix-It Shop', toy: 'fi06', prize: 'pl16', coins: 30, start: 'a',
    nodes: {
      a: { art: 'fi06', t: "Max's Zoom Spinner will not spin. It just goes clunk. \"It is broken forever,\" Max sniffs. {name} has an idea: open a Fidget Fix-It Shop!", c: [['Look inside the spinner', 'b'], ['Ask the other toys for ideas', 'c']] },
      b: { art: 'sl01', t: 'Under the cap you find the problem: a tiny blob of pink slime, stuck right in the middle. How do you get it out?', c: [['Pick it out gently with a toothpick', 'd'], ['Wash it in warm soapy water', 'e']] },
      c: { art: 'pl16', t: "The poppers say, \"Pop it!\" The springy says, \"Bounce it!\" A small lion plushie roars, \"Be brave and be patient!\"", c: [['Be patient and wiggle it slowly', 'f'], ['Give Max a hug first', 'g']] },
      d: { art: 'fi07', t: "Pick, pick, plop! Out comes the slime. The spinner whirls so fast that it hums. \"You are a genius!\" shouts Max.", end: 'Careful Fixer' },
      e: { art: 'fi16', t: 'Swish, swish, dry. The spinner comes out squeaky clean and spins for a whole minute. Max counts every single second.', end: 'Clean Machine' },
      f: { art: 'fi18', t: 'Wiggle... wiggle... click! Something pops loose and the spinner glides again. Patience really was the trick.', end: 'Patient Helper' },
      g: { art: 'pl04', t: "Max stops sniffling. \"Thanks. I feel better.\" Together you try again, and this time the spinner spins. Some fixes start with a hug.", end: 'Kind Heart' },
    },
  },
  {
    id: 'bakery', title: 'The Dough Bakery Rush', toy: 'do05', prize: 'pl18', coins: 30, start: 'a',
    nodes: {
      a: { art: 'do05', t: "Benny's Play Dough Bakery is open! The very first order comes in: twelve dough cupcakes for a teddy bear picnic. And the picnic starts in ten minutes!", c: [['Roll all twelve yourself, fast', 'b'], ['Ask friends to make a line', 'c']] },
      b: { art: 'do01', t: 'You roll as fast as you can. Six cupcakes are done... but they are getting lumpy, and the clock is ticking.', c: [['Slow down and make six neat ones', 'd'], ['Keep going fast, lumps and all', 'e']] },
      c: { art: 'pl01', t: 'Poppy rolls, Ollie shapes, Benny adds swirls, and you press on the cherries. The line hums along. Then, oh no, the red dough runs out!', c: [['Mix pink from the scraps', 'f'], ['Use blue for blueberry cupcakes', 'g']] },
      d: { art: 'sq29', t: "Six beautiful cupcakes. You tell the bears the truth: \"I only finished half, but I made them with care.\" The bears share, two to a cupcake, and love them.", end: 'Careful Baker' },
      e: { art: 'do15', t: "Twelve lumpy cupcakes arrive right on time. The littlest bear giggles. \"They look like tiny mountains! Mountain cakes are my favorite.\"", end: 'Speedy Baker' },
      f: { art: 'do13', t: 'A pinch of leftover red and a lump of white make perfect pink. Twelve strawberry cupcakes, done with one minute to spare!', end: 'Color Mixer' },
      g: { art: 'do02', t: "\"Blueberry cupcakes!\" cheer the bears. They did not know they wanted them until they saw them. Sometimes plan B is the best plan.", end: 'Clever Chef' },
    },
  },
  {
    id: 'shy', title: 'The Shy New Squishy', toy: 'sq38', prize: 'pl13', coins: 30, start: 'a',
    nodes: {
      a: { art: 'sq38', t: "A new squishy arrives in a mystery bag: a tiny ghost named Boo Boo. But Boo Boo will not come out. \"The other toys all know each other,\" a small voice whispers. \"I am too shy.\"", c: [['Sit beside the bag and wait', 'b'], ['Introduce one toy at a time', 'c']] },
      b: { art: 'sq38', t: "You sit quietly. After a while, two little eyes peek out. \"You waited for me?\" What do you say?", c: [['"Take all the time you need."', 'd'], ['"Want to see a secret hiding spot?"', 'e']] },
      c: { art: 'sq11', t: 'Boo Boo nods a tiny nod. Who should Boo Boo meet first?', c: [['Dreamy Cloud, who is very gentle', 'f'], ['Bamboo the Panda, who is quiet too', 'g']] },
      d: { art: 'sq38', t: "Boo Boo floats out, slowly, and settles in your hand. \"Nobody ever waited before.\" The best friendships are never rushed.", end: 'Patient Friend' },
      e: { art: 'sq39', t: "You show Boo Boo the cozy gap behind the bookshelf. \"A hiding spot for when I feel shy? It is perfect!\" Now Boo Boo has a safe place, and a friend.", end: 'Safe Place Maker' },
      f: { art: 'sq11', t: "Dreamy Cloud drifts over. \"I was scared on my first day too,\" she says softly. Boo Boo smiles a tiny smile. One friend is a wonderful start.", end: 'Gentle Guide' },
      g: { art: 'pl13', t: 'Bamboo does not say much. He just scoots over to make room. Boo Boo scoots in. They sit together, happily quiet.', end: 'Quiet Company' },
    },
  },
  {
    id: 'rain', title: 'The Rainy Day Trade Fair', toy: 'sq19', prize: 'pl15', coins: 30, start: 'a',
    nodes: {
      a: { art: 'sq19', t: 'Today is the outdoor Trade Fair. The tables are set, the toys are sorted... and then, plip, plop, POUR. Rain! Everyone grabs their toys and groans.', c: [['Move the fair under the big slide', 'b'], ['Invite everyone to your house', 'c']] },
      b: { art: 'sq11', t: 'Under the slide it is dry, but tiny. Only three traders fit at a time, and ten friends are waiting in the drizzle.', c: [['Make a line and take turns', 'd'], ['Hold up a blanket for a bigger roof', 'e']] },
      c: { art: 'pl15', t: 'The living room fills with toys and wet socks. It is the coziest fair ever. But a frog plushie is still outside, sitting alone in a puddle.', c: [['Bring the frog in and dry him off', 'f'], ['Go out and splash with him', 'g']] },
      d: { art: 'sp02', t: 'Three in, three out, and everyone gets a turn. The line sings songs while it waits. It turns out a tiny fair can still be a fair fair.', end: 'Turn Taker' },
      e: { art: 'sq12', t: 'You, Max and Zara hold a picnic blanket up like a roof. Now everybody fits! Your arms get tired, so the traders give you first pick as a thank-you.', end: 'Roof Raiser' },
      f: { art: 'pl15', t: "Wrapped in a towel, the frog sighs happily. \"I am Hopper. I love rain, but I love friends more.\" He trades you a springy for a spot by the heater.", end: 'Warm Welcome' },
      g: { art: 'sq35', t: 'SPLASH! SPLOSH! You and Hopper jump in every puddle, then run inside laughing. The whole fair claps and hands you two dry towels.', end: 'Puddle Jumper' },
    },
  },
];
