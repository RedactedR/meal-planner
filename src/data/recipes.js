// The built-in recipe library.
//
// Every recipe must have instructions. Any recipe without steps is
// dropped below, so the app never lists or suggests one.
//
// Recipe fields:
//   qty          – amounts are for the recipe's own `servings`; the app
//                  scales them to the portion size chosen in Settings
//   nutrition    – estimate per serving
//   allergens    – keys from ALLERGENS below
//   onePan       – the whole recipe is cooked in a single pan or pot
//   difficulty   – 'easy' | 'medium' | 'advanced'
//   steps        – { text, tip?, watch? }
//                  tip:   a "next level" pro tip shown under the step
//                  watch: a YouTube search for the technique, shown as
//                         a "Watch how" button
//   scratch      – optional homemade version of a store-bought sauce or
//                  seasoning. `replaces` lists the store-bought items it
//                  swaps out when "Make sauces from scratch" is on.
//
// Ingredient names and units must match src/data/ingredients.js.
//
// Most recipes live in src/data/library/, written in a compact format.

import LIBRARY from './library';

const RAW_RECIPES = [
  {
    id: 'chicken-tikka',
    name: 'Chicken Tikka Masala',
    cuisine: 'Indian',
    emoji: '🍛',
    minutes: 45,
    servings: 4,
    difficulty: 'medium',
    onePan: false,
    allergens: ['dairy'],
    nutrition: { calories: 650, protein: 40, carbs: 60, fat: 25, fiber: 4, veg: 1 },
    ingredients: [
      { name: 'Chicken thighs', qty: 1.5, unit: 'lb' },
      { name: 'Plain yogurt', qty: 1, unit: 'cup' },
      { name: 'Crushed tomatoes', qty: 1, unit: 'can' },
      { name: 'Heavy cream', qty: 0.5, unit: 'cup' },
      { name: 'Yellow onion', qty: 1, unit: '' },
      { name: 'Garlic', qty: 4, unit: 'cloves' },
      { name: 'Garam masala', qty: 2, unit: 'tbsp' },
      { name: 'Basmati rice', qty: 1.5, unit: 'cup' },
      { name: 'Vegetable oil', qty: 2, unit: 'tbsp' },
      { name: 'Kosher salt', qty: 2, unit: 'tsp' },
    ],
    steps: [
      {
        text: 'Cut the chicken thighs into bite-size pieces. Stir together the yogurt, half the garam masala, 2 grated garlic cloves and 1 tsp salt, then toss the chicken in it. Marinate at least 15 minutes, or covered in the fridge overnight.',
        tip: "Thighs beat breasts here: they stay juicy through the simmer, and the yogurt's gentle acidity tenderizes the meat. An overnight marinade makes a noticeable difference.",
      },
      {
        text: 'Rinse the rice in a sieve until the water runs mostly clear. Add it to a pot with 2¼ cups water and a pinch of salt, bring to a boil, cover, and cook on the lowest heat for 15 minutes. Turn off the heat and leave it covered for 10 more.',
        tip: "Rinsing washes away loose surface starch, which is what makes rice gummy. Don't lift the lid while it steams — the trapped steam finishes the cooking.",
      },
      {
        text: 'Heat 1 tbsp oil in a large skillet over medium-high until it shimmers. Shake excess marinade off the chicken and add it in a single layer with space between pieces. Leave it alone for 3–4 minutes until charred in spots, flip, brown the other side, then move it to a plate. It does not need to be cooked through yet.',
        tip: 'Crowding the pan steams meat instead of browning it. Cook in two batches if the pieces are touching — those charred spots are where the "tikka" flavor comes from.',
      },
      {
        text: 'Lower the heat to medium and add the remaining oil and the diced onion with a pinch of salt. Cook 6–8 minutes until soft and golden, scraping the browned bits off the bottom of the pan as the onion releases its moisture.',
        tip: "Those brown bits stuck to the pan are called fond, and they're pure flavor. The onion's moisture loosens them — scrape them into the sauce instead of washing them down the drain later.",
        watch: 'how to deglaze a pan fond',
      },
      {
        text: 'Add the remaining garlic and garam masala. Stir for 30–60 seconds until very fragrant.',
        tip: 'Frying spices briefly in fat ("blooming") unlocks far more flavor than stirring them into liquid. Pull the pan off the heat the moment it smells toasty — scorched spices turn bitter.',
      },
      {
        text: 'Pour in the crushed tomatoes, scrape the bottom of the pan once more, and simmer 10 minutes until slightly thickened.',
      },
      {
        text: 'Stir in the cream, return the chicken and any juices from the plate, and simmer 5 minutes until the chicken is cooked through (165°F in the center). Taste, adjust the salt, and serve over the rice.',
        tip: 'Always taste before serving. If a sauce tastes flat, it almost always needs salt. If it tastes heavy, a squeeze of lemon wakes it up.',
      },
    ],
  },
  {
    id: 'beef-tacos',
    name: 'Street-Style Beef Tacos',
    cuisine: 'Mexican',
    emoji: '🌮',
    minutes: 25,
    servings: 4,
    difficulty: 'easy',
    onePan: false,
    allergens: [],
    nutrition: { calories: 520, protein: 30, carbs: 40, fat: 26, fiber: 6, veg: 1 },
    ingredients: [
      { name: 'Ground beef', qty: 1, unit: 'lb' },
      { name: 'Corn tortillas', qty: 12, unit: '' },
      { name: 'Yellow onion', qty: 1, unit: '' },
      { name: 'Cilantro', qty: 1, unit: 'bunch' },
      { name: 'Limes', qty: 2, unit: '' },
      { name: 'Taco seasoning', qty: 1, unit: 'packet' },
      { name: 'Salsa verde', qty: 1, unit: 'jar' },
    ],
    scratch: {
      title: 'Homemade taco seasoning',
      replaces: ['Taco seasoning'],
      ingredients: [
        { name: 'Chili powder', qty: 1, unit: 'tbsp' },
        { name: 'Ground cumin', qty: 2, unit: 'tsp' },
        { name: 'Paprika', qty: 1, unit: 'tsp' },
        { name: 'Dried oregano', qty: 1, unit: 'tsp' },
        { name: 'Garlic powder', qty: 1, unit: 'tsp' },
        { name: 'Kosher salt', qty: 1, unit: 'tsp' },
      ],
      steps: [
        {
          text: 'Stir together the chili powder, cumin, paprika, oregano, garlic powder and salt in a small bowl.',
          tip: 'Packets are mostly salt and cornstarch. Your own blend tastes brighter, costs a fraction, and you control the heat. Make a triple batch and keep it in a jar.',
        },
      ],
    },
    steps: [
      {
        text: 'Finely dice the onion and chop the cilantro. Mix half of each together for the topping.',
        tip: 'Soak the diced onion in cold water for 5 minutes, then drain. It takes the harsh bite out of raw onion while keeping the crunch.',
      },
      {
        text: 'Heat a large skillet over medium-high. Add the beef, press it into one thin, even layer, and leave it completely alone for 4–5 minutes until a deep brown crust forms on the bottom. Then break it up and cook until no pink remains.',
        tip: "Don't stir right away. Letting the beef sit builds a crust, and that crust is the difference between gray ground beef and tacos that taste like a taqueria's.",
      },
      {
        text: 'Spoon off all but about 1 tbsp of fat. Add the taco seasoning and the rest of the onion and stir 30 seconds, then add ¼ cup water, scrape up the browned bits, and simmer 2–3 minutes until saucy.',
      },
      {
        text: 'Warm the tortillas one at a time in a dry skillet for about 30 seconds per side (or directly over a gas flame with tongs for 10–15 seconds per side). Stack them in a clean kitchen towel as you go.',
        tip: 'Cold corn tortillas crack. Heating makes them pliable, and wrapping the stack in a towel steams them soft. Taquerias double them up so the taco never tears.',
        watch: 'how to warm corn tortillas',
      },
      {
        text: 'Fill the tortillas with beef, top with the onion-cilantro mix and salsa verde, and finish with a squeeze of lime.',
      },
    ],
  },
  {
    id: 'pad-thai',
    name: 'Shrimp Pad Thai',
    cuisine: 'Thai',
    emoji: '🍜',
    minutes: 30,
    servings: 4,
    difficulty: 'medium',
    onePan: true,
    allergens: ['shellfish', 'eggs', 'peanuts', 'fish', 'soy'],
    nutrition: { calories: 600, protein: 32, carbs: 70, fat: 20, fiber: 4, veg: 1.5 },
    ingredients: [
      { name: 'Rice noodles', qty: 8, unit: 'oz' },
      { name: 'Shrimp', qty: 1, unit: 'lb' },
      { name: 'Eggs', qty: 2, unit: '' },
      { name: 'Bean sprouts', qty: 2, unit: 'cup' },
      { name: 'Green onions', qty: 1, unit: 'bunch' },
      { name: 'Peanuts', qty: 0.5, unit: 'cup' },
      { name: 'Pad thai sauce', qty: 1, unit: 'jar' },
      { name: 'Limes', qty: 1, unit: '' },
      { name: 'Vegetable oil', qty: 3, unit: 'tbsp' },
    ],
    scratch: {
      title: 'Homemade pad thai sauce',
      replaces: ['Pad thai sauce'],
      allergens: ['fish'],
      ingredients: [
        { name: 'Tamarind concentrate', qty: 3, unit: 'tbsp' },
        { name: 'Fish sauce', qty: 3, unit: 'tbsp' },
        { name: 'Light brown sugar', qty: 3, unit: 'tbsp' },
      ],
      steps: [
        {
          text: 'Whisk the tamarind, fish sauce and brown sugar with 2 tbsp warm water until the sugar dissolves. Taste: it should be sour, salty and sweet all at once.',
          tip: 'Tamarind is the real backbone of pad thai — it gives that fruity sourness that ketchup-based jarred sauces fake. Adjust to taste: more sugar if too sour, more fish sauce if flat.',
        },
      ],
    },
    steps: [
      {
        text: 'Soak the noodles in hot tap water (not boiling) for 8–10 minutes until bendy but still firm in the center. Drain.',
        tip: 'Undersoak them on purpose — they finish cooking in the pan. Fully softened noodles turn to mush once they hit the sauce.',
      },
      {
        text: 'Before turning on the heat, get everything ready next to the stove: shrimp patted dry, eggs beaten, green onions cut into 1-inch pieces, peanuts roughly chopped, lime cut into wedges, sauce mixed.',
        tip: "Stir-fries move fast. Having every ingredient prepped and lined up (chefs call it mise en place) is the single biggest key — there's no time to chop once the pan is hot.",
      },
      {
        text: 'Heat 2 tbsp oil in a wok or your largest skillet over high heat until it just begins to smoke. Add the shrimp in one layer and cook about 1 minute per side until just pink. Move to a plate.',
      },
      {
        text: 'Add the remaining oil, pour in the eggs, let them set for 20 seconds, then scramble into large soft curds.',
      },
      {
        text: 'Add the noodles and sauce. Toss constantly with tongs for 2–3 minutes until the noodles absorb the sauce and are tender. If they clump or stick, add a tablespoon of water.',
        tip: 'Sticky noodles need moisture, not more sauce — more sauce just makes them salty. A splash of water loosens everything.',
        watch: 'pad thai wok technique',
      },
      {
        text: 'Return the shrimp, add the bean sprouts and green onions, and toss for 30 seconds. Serve right away with peanuts and lime wedges.',
        tip: 'Add the sprouts at the very end so they stay crunchy — that contrast is part of what makes pad thai great.',
      },
    ],
  },
  {
    id: 'margherita-pizza',
    name: 'Margherita Flatbread',
    cuisine: 'Italian',
    emoji: '🍕',
    minutes: 25,
    servings: 2,
    difficulty: 'easy',
    onePan: true,
    allergens: ['dairy', 'gluten'],
    nutrition: { calories: 620, protein: 28, carbs: 55, fat: 32, fiber: 3, veg: 1 },
    ingredients: [
      { name: 'Naan or flatbread', qty: 2, unit: '' },
      { name: 'Fresh mozzarella', qty: 8, unit: 'oz' },
      { name: 'Tomatoes', qty: 2, unit: '' },
      { name: 'Fresh basil', qty: 1, unit: 'bunch' },
      { name: 'Olive oil', qty: 2, unit: 'tbsp' },
      { name: 'Garlic', qty: 1, unit: 'cloves' },
      { name: 'Kosher salt', qty: 0.5, unit: 'tsp' },
    ],
    steps: [
      {
        text: 'Put a sheet pan on the upper-middle oven rack and heat the oven to 475°F.',
        tip: 'A preheated pan works like a pizza stone: the flatbread hits hot metal and the bottom crisps instead of going soft.',
      },
      {
        text: 'Tear the mozzarella into pieces and lay them on paper towels. Thinly slice the tomatoes, sprinkle them lightly with salt, and lay them on paper towels too. Let both sit 10 minutes.',
        tip: "Fresh mozzarella and tomatoes are full of water. Drying them first is the trick to a crisp flatbread instead of a soggy one — and salting the tomatoes seasons them while it pulls water out.",
      },
      {
        text: 'Grate the garlic into the olive oil and brush most of it over the flatbreads.',
      },
      {
        text: 'Top with tomato slices and mozzarella. Carefully slide the flatbreads onto the hot pan and bake 7–9 minutes until the cheese is bubbling with brown spots.',
      },
      {
        text: 'Finish with torn basil leaves, the rest of the garlic oil and a pinch of salt.',
        tip: 'Add basil after baking — oven heat turns it black and bitter. Tear it instead of chopping; a knife bruises the leaves.',
      },
    ],
  },
  {
    id: 'teriyaki-salmon',
    name: 'Teriyaki Salmon Bowls',
    cuisine: 'Japanese',
    emoji: '🍣',
    minutes: 35,
    servings: 4,
    difficulty: 'medium',
    onePan: false,
    allergens: ['fish', 'soy', 'gluten', 'sesame'],
    nutrition: { calories: 700, protein: 40, carbs: 65, fat: 28, fiber: 9, veg: 2 },
    ingredients: [
      { name: 'Salmon fillets', qty: 4, unit: '' },
      { name: 'Teriyaki sauce', qty: 1, unit: 'bottle' },
      { name: 'Jasmine rice', qty: 1.5, unit: 'cup' },
      { name: 'Cucumber', qty: 1, unit: '' },
      { name: 'Rice vinegar', qty: 2, unit: 'tbsp' },
      { name: 'Avocado', qty: 2, unit: '' },
      { name: 'Edamame', qty: 1, unit: 'bag' },
      { name: 'Sesame seeds', qty: 1, unit: 'tbsp' },
      { name: 'Kosher salt', qty: 1, unit: 'tsp' },
    ],
    scratch: {
      title: 'Homemade teriyaki sauce',
      replaces: ['Teriyaki sauce'],
      allergens: ['soy', 'gluten'],
      ingredients: [
        { name: 'Soy sauce', qty: 4, unit: 'tbsp' },
        { name: 'Mirin', qty: 3, unit: 'tbsp' },
        { name: 'Light brown sugar', qty: 1, unit: 'tbsp' },
        { name: 'Fresh ginger', qty: 1, unit: 'piece' },
        { name: 'Garlic', qty: 1, unit: 'cloves' },
        { name: 'Cornstarch', qty: 1, unit: 'tsp' },
      ],
      steps: [
        {
          text: 'In a small saucepan, combine the soy sauce, mirin, brown sugar, a teaspoon of grated ginger and the grated garlic. Bring to a simmer. Stir the cornstarch into 1 tbsp cold water, whisk it in, and simmer 1–2 minutes until glossy and thick enough to coat a spoon.',
          tip: "Always mix cornstarch with cold water before adding it to something hot — dumped in dry, it forms lumps that won't dissolve. Real teriyaki is just soy, mirin and sugar; no need for the corn syrup in bottled versions.",
        },
      ],
    },
    steps: [
      {
        text: 'Rinse the rice until the water runs mostly clear, then cook it with 2¼ cups water (boil, cover, lowest heat 15 minutes, rest 10). Cook the edamame according to the bag.',
      },
      {
        text: 'Thinly slice the cucumber, toss it with the rice vinegar and a pinch of salt, and set aside.',
        tip: 'This is a 10-minute quick pickle. The vinegar and salt make the cucumber tangy and crisp, and it cuts through the rich salmon.',
      },
      {
        text: 'Heat the oven to 425°F. Pat the salmon very dry, season lightly with salt, and place skin-side down on a foil-lined sheet pan.',
        tip: 'Patting fish dry helps it roast instead of steam, and gives the glaze something to cling to.',
      },
      {
        text: 'Roast 8 minutes, brush on a thick layer of teriyaki, then roast 3–5 minutes more until the salmon flakes easily and reads 125°F in the thickest part.',
        tip: "Glaze at the end — the sugar burns if it's on the whole time. Pull salmon at 125°F; it keeps cooking for a few minutes after it leaves the oven and stays silky.",
      },
      {
        text: 'Toast the sesame seeds in a dry skillet over medium heat for 2–3 minutes, shaking the pan, until golden.',
        tip: 'Untoasted sesame seeds taste like almost nothing. Two minutes in a dry pan makes them nutty and fragrant.',
      },
      {
        text: 'Build bowls with rice, salmon, pickled cucumber, sliced avocado and edamame. Drizzle with extra teriyaki and sprinkle with sesame seeds.',
      },
    ],
  },
  {
    id: 'greek-chicken',
    name: 'Greek Chicken Sheet Pan',
    cuisine: 'Greek',
    emoji: '🫒',
    minutes: 45,
    servings: 4,
    difficulty: 'easy',
    onePan: true,
    allergens: ['dairy'],
    nutrition: { calories: 560, protein: 42, carbs: 45, fat: 22, fiber: 6, veg: 2 },
    ingredients: [
      { name: 'Chicken breasts', qty: 1.5, unit: 'lb' },
      { name: 'Baby potatoes', qty: 1.5, unit: 'lb' },
      { name: 'Red onion', qty: 1, unit: '' },
      { name: 'Bell peppers', qty: 2, unit: '' },
      { name: 'Feta cheese', qty: 4, unit: 'oz' },
      { name: 'Lemons', qty: 2, unit: '' },
      { name: 'Olive oil', qty: 3, unit: 'tbsp' },
      { name: 'Dried oregano', qty: 2, unit: 'tsp' },
      { name: 'Tzatziki', qty: 1, unit: 'tub' },
      { name: 'Kosher salt', qty: 2, unit: 'tsp' },
      { name: 'Black pepper', qty: 1, unit: 'tsp' },
    ],
    scratch: {
      title: 'Homemade tzatziki',
      replaces: ['Tzatziki'],
      allergens: ['dairy'],
      ingredients: [
        { name: 'Plain yogurt', qty: 1, unit: 'cup' },
        { name: 'Cucumber', qty: 1, unit: '' },
        { name: 'Fresh dill', qty: 1, unit: 'bunch' },
        { name: 'Garlic', qty: 1, unit: 'cloves' },
      ],
      steps: [
        {
          text: 'Grate the cucumber, toss with a pinch of salt, wait 5 minutes, then squeeze it hard in a clean towel. Stir into the yogurt with the grated garlic, a handful of chopped dill and a squeeze of lemon.',
          tip: "Squeezing the cucumber is the step most people skip — and it's why homemade tzatziki often turns watery. Get every drop out and it stays thick and creamy.",
        },
      ],
    },
    steps: [
      {
        text: 'Heat the oven to 425°F with a rack in the lower-middle. Halve the potatoes, toss them on a sheet pan with 1 tbsp oil and ½ tsp salt, and turn them cut-side down. Roast 15 minutes.',
        tip: "Potatoes take longer than chicken. A 15-minute head start means everything finishes together. Cut-side down against the hot pan is how they get golden and crisp.",
      },
      {
        text: 'Meanwhile, cut the chicken into 1½-inch chunks. Toss with the remaining oil, the zest and juice of one lemon, the oregano, 1 tsp salt and the pepper. Cut the peppers and onion into wedges.',
        tip: 'Zest the lemon before you juice it — zesting a squeezed lemon is nearly impossible. The zest carries the most lemon flavor.',
      },
      {
        text: 'Add the chicken and vegetables to the pan around the potatoes and spread everything out. Roast 18–22 minutes until the chicken reaches 165°F and the edges are browned.',
        tip: "If pieces are touching everywhere, split onto two pans. Crowded sheet pans steam instead of roast, and you lose the browned edges.",
      },
      {
        text: 'Squeeze the second lemon over everything, crumble the feta on top, and serve with tzatziki.',
      },
    ],
  },
  {
    id: 'korean-bulgogi',
    name: 'Beef Bulgogi',
    cuisine: 'Korean',
    emoji: '🥢',
    minutes: 50,
    servings: 4,
    difficulty: 'medium',
    onePan: false,
    allergens: ['soy', 'gluten', 'sesame', 'fish', 'shellfish'],
    nutrition: { calories: 620, protein: 40, carbs: 60, fat: 22, fiber: 3, veg: 1 },
    ingredients: [
      { name: 'Flank steak', qty: 1.5, unit: 'lb' },
      { name: 'Bulgogi marinade', qty: 1, unit: 'bottle' },
      { name: 'Jasmine rice', qty: 1.5, unit: 'cup' },
      { name: 'Kimchi', qty: 1, unit: 'jar' },
      { name: 'Green onions', qty: 1, unit: 'bunch' },
      { name: 'Sesame seeds', qty: 1, unit: 'tbsp' },
      { name: 'Vegetable oil', qty: 2, unit: 'tbsp' },
    ],
    scratch: {
      title: 'Homemade bulgogi marinade',
      replaces: ['Bulgogi marinade'],
      allergens: ['soy', 'gluten', 'sesame'],
      ingredients: [
        { name: 'Soy sauce', qty: 5, unit: 'tbsp' },
        { name: 'Light brown sugar', qty: 2, unit: 'tbsp' },
        { name: 'Sesame oil', qty: 1, unit: 'tbsp' },
        { name: 'Pear', qty: 1, unit: '' },
        { name: 'Garlic', qty: 4, unit: 'cloves' },
        { name: 'Fresh ginger', qty: 1, unit: 'piece' },
      ],
      steps: [
        {
          text: 'Grate the pear, garlic and a thumb of ginger into a bowl. Stir in the soy sauce, brown sugar and sesame oil.',
          tip: 'Grated pear is the traditional Korean secret: its natural enzymes tenderize the beef while adding gentle sweetness. Kiwi works too but is much stronger — only marinate 30 minutes with it.',
        },
      ],
    },
    steps: [
      {
        text: 'Put the steak in the freezer for 20–30 minutes until firm but not frozen solid. Slice it as thin as you can against the grain.',
        tip: 'Partly frozen meat slices paper-thin with an ordinary knife. "Against the grain" means cutting across the long muscle lines you can see — it shortens the fibers so every bite is tender.',
        watch: 'how to slice flank steak against the grain',
      },
      {
        text: 'Toss the beef with the marinade and refrigerate at least 30 minutes, or up to overnight.',
      },
      {
        text: 'Rinse and cook the rice (2¼ cups water; boil, cover, lowest heat 15 minutes, rest 10).',
      },
      {
        text: 'Heat a large skillet or cast iron pan over high heat with a little oil until smoking. Lift the beef out of the marinade, letting excess drip off, and cook in small batches for 1–2 minutes per side until the edges caramelize. Add oil between batches as needed.',
        tip: "Drain the meat well before it hits the pan. Too much marinade and it boils in liquid instead of searing. Those caramelized edges are the whole point.",
      },
      {
        text: 'Serve over rice with kimchi, sliced green onions and toasted sesame seeds.',
      },
    ],
  },
  {
    id: 'shakshuka',
    name: 'Shakshuka',
    cuisine: 'Middle Eastern',
    emoji: '🍳',
    minutes: 35,
    servings: 3,
    difficulty: 'easy',
    onePan: true,
    allergens: ['eggs', 'dairy', 'gluten'],
    nutrition: { calories: 480, protein: 24, carbs: 45, fat: 22, fiber: 7, veg: 2.5 },
    ingredients: [
      { name: 'Eggs', qty: 6, unit: '' },
      { name: 'Crushed tomatoes', qty: 1, unit: 'can' },
      { name: 'Bell peppers', qty: 1, unit: '' },
      { name: 'Yellow onion', qty: 1, unit: '' },
      { name: 'Garlic', qty: 3, unit: 'cloves' },
      { name: 'Ground cumin', qty: 1, unit: 'tsp' },
      { name: 'Paprika', qty: 1, unit: 'tsp' },
      { name: 'Olive oil', qty: 3, unit: 'tbsp' },
      { name: 'Feta cheese', qty: 2, unit: 'oz' },
      { name: 'Crusty bread', qty: 1, unit: 'loaf' },
      { name: 'Kosher salt', qty: 1, unit: 'tsp' },
    ],
    steps: [
      {
        text: 'Heat 2 tbsp olive oil in a 12-inch skillet over medium. Add the sliced onion and pepper with a pinch of salt and cook 8–10 minutes until very soft and starting to brown.',
        tip: "Salting vegetables at the start draws out moisture so they soften faster and season all the way through.",
      },
      {
        text: 'Add the garlic, cumin and paprika and stir for 1 minute until fragrant.',
      },
      {
        text: 'Pour in the tomatoes and simmer 10 minutes, until thick enough that a spoon dragged across the pan leaves a trail.',
        tip: "If the sauce is too thin, the eggs sink and the whites run everywhere. Wait for the spoon-trail test.",
      },
      {
        text: 'Use a spoon to make 6 wells in the sauce. Crack each egg into a small cup, then slide it into a well. Cover, turn the heat to low, and cook 5–8 minutes until the whites are set and the yolks still jiggle.',
        tip: "Cracking eggs into a cup first means no shell fragments in your dinner and no broken yolks.",
        watch: 'shakshuka eggs technique',
      },
      {
        text: 'While the eggs cook, slice the bread, brush with the remaining olive oil and toast. Crumble feta over the shakshuka and serve straight from the pan.',
      },
    ],
  },
  {
    id: 'jambalaya',
    name: 'One-Pot Jambalaya',
    cuisine: 'Cajun',
    emoji: '🦐',
    minutes: 50,
    servings: 6,
    difficulty: 'medium',
    onePan: true,
    allergens: ['shellfish', 'pork'],
    nutrition: { calories: 580, protein: 38, carbs: 50, fat: 24, fiber: 3, veg: 1.5 },
    ingredients: [
      { name: 'Andouille sausage', qty: 12, unit: 'oz' },
      { name: 'Chicken thighs', qty: 1, unit: 'lb' },
      { name: 'Shrimp', qty: 0.5, unit: 'lb' },
      { name: 'Long grain rice', qty: 1.5, unit: 'cup' },
      { name: 'Diced tomatoes', qty: 1, unit: 'can' },
      { name: 'Yellow onion', qty: 1, unit: '' },
      { name: 'Bell peppers', qty: 1, unit: '' },
      { name: 'Celery', qty: 1, unit: 'bunch' },
      { name: 'Garlic', qty: 3, unit: 'cloves' },
      { name: 'Chicken broth', qty: 32, unit: 'oz' },
      { name: 'Cajun seasoning', qty: 2, unit: 'tbsp' },
    ],
    steps: [
      {
        text: 'Slice the sausage into coins and brown in a large Dutch oven over medium-high for 4–5 minutes. Move to a plate. Cut the chicken into chunks, season with 1 tbsp Cajun seasoning, and brown it in the sausage fat for 5 minutes. Move to the plate.',
      },
      {
        text: 'Add the diced onion, celery and bell pepper to the pot and cook 6–8 minutes, scraping up the browned bits, until soft. Add the garlic for the last minute.',
        tip: 'Onion, celery and bell pepper are Cajun cooking\'s "holy trinity." Cooking them in the sausage drippings spreads that smoky flavor through the whole pot.',
      },
      {
        text: 'Add the rice and the remaining Cajun seasoning and stir for 2 minutes until the rice looks slightly translucent at the edges.',
        tip: 'Toasting the rice in fat coats each grain so they cook up separate and fluffy instead of mushy.',
      },
      {
        text: 'Add the tomatoes and broth, scrape the bottom of the pot clean, and return the sausage and chicken. Bring to a boil, cover, and cook on low for 20 minutes. Don\'t stir.',
        tip: 'Resist stirring. Stirring rice while it cooks releases starch and turns it gummy.',
      },
      {
        text: 'Scatter the shrimp over the top, cover, turn off the heat, and let it sit 5–7 minutes until the shrimp are pink. Fluff and serve.',
        tip: "The trapped heat cooks the shrimp gently, so they stay tender instead of rubbery.",
      },
    ],
  },
  {
    id: 'black-bean-burgers',
    name: 'Black Bean Burgers',
    cuisine: 'Vegetarian',
    emoji: '🍔',
    minutes: 40,
    servings: 4,
    difficulty: 'easy',
    onePan: true,
    allergens: ['eggs', 'gluten', 'dairy'],
    nutrition: { calories: 540, protein: 22, carbs: 70, fat: 18, fiber: 16, veg: 1.5 },
    ingredients: [
      { name: 'Black beans', qty: 2, unit: 'can' },
      { name: 'Breadcrumbs', qty: 0.5, unit: 'cup' },
      { name: 'Eggs', qty: 1, unit: '' },
      { name: 'Ground cumin', qty: 1, unit: 'tsp' },
      { name: 'Chili powder', qty: 1, unit: 'tbsp' },
      { name: 'Burger buns', qty: 4, unit: '' },
      { name: 'Avocado', qty: 1, unit: '' },
      { name: 'Red onion', qty: 1, unit: '' },
      { name: 'Pepper jack cheese', qty: 4, unit: 'slices' },
      { name: 'Vegetable oil', qty: 2, unit: 'tbsp' },
      { name: 'Kosher salt', qty: 1, unit: 'tsp' },
    ],
    steps: [
      {
        text: 'Drain and rinse the beans, then spread them on a towel and pat dry. For even better burgers, spread them on a sheet pan and bake at 325°F for 15 minutes.',
        tip: "Wet beans are why veggie burgers fall apart. Drying them out — even 15 minutes in a low oven — gives you a burger that holds together and gets a crisp crust.",
      },
      {
        text: 'Mash about two-thirds of the beans in a bowl, leaving the rest whole. Mince a quarter of the red onion and add it with the breadcrumbs, egg, cumin, chili powder and salt. Mix and let rest 10 minutes.',
        tip: 'Resting lets the breadcrumbs soak up moisture and bind everything — skip it and the patties are harder to shape.',
      },
      {
        text: 'Form 4 patties about ¾ inch thick and press a shallow dimple in the center of each with your thumb.',
        tip: 'The dimple stops patties from puffing into a dome as they cook, so they stay flat and fit the bun.',
      },
      {
        text: 'Heat the oil in a large skillet over medium. Cook the patties 4–5 minutes per side until crisp. Add the cheese for the last minute and cover the pan to melt it.',
      },
      {
        text: 'Wipe the pan, then toast the buns cut-side down for 1 minute. Serve the burgers with sliced avocado and the rest of the red onion, thinly sliced.',
        tip: "Toasted buns don't go soggy, and the toasty flavor makes any burger taste more restaurant-quality.",
      },
    ],
  },
  {
    id: 'pho',
    name: 'Quick Chicken Pho',
    cuisine: 'Vietnamese',
    emoji: '🍲',
    minutes: 45,
    servings: 4,
    difficulty: 'medium',
    onePan: false,
    allergens: [],
    nutrition: { calories: 450, protein: 35, carbs: 55, fat: 8, fiber: 3, veg: 1.5 },
    ingredients: [
      { name: 'Chicken broth', qty: 64, unit: 'oz' },
      { name: 'Chicken breasts', qty: 1, unit: 'lb' },
      { name: 'Rice noodles', qty: 8, unit: 'oz' },
      { name: 'Fresh ginger', qty: 1, unit: 'piece' },
      { name: 'Yellow onion', qty: 1, unit: '' },
      { name: 'Star anise', qty: 2, unit: '' },
      { name: 'Cinnamon stick', qty: 1, unit: '' },
      { name: 'Bean sprouts', qty: 1, unit: 'cup' },
      { name: 'Fresh basil', qty: 1, unit: 'bunch' },
      { name: 'Limes', qty: 2, unit: '' },
      { name: 'Jalapeño', qty: 1, unit: '' },
      { name: 'Kosher salt', qty: 1, unit: 'tsp' },
    ],
    steps: [
      {
        text: 'Halve the onion and slice the ginger lengthwise. Char them cut-side down in a dry pot over high heat for 4–5 minutes until blackened in spots.',
        tip: "Charring the ginger and onion is the secret to pho's deep, slightly smoky broth. It sounds wrong, but it's how it's done.",
        watch: 'charring onion ginger for pho',
      },
      {
        text: 'Add the star anise and cinnamon stick and toast for 1 minute until fragrant. Pour in the broth and bring to a simmer for 20 minutes.',
      },
      {
        text: 'Add the chicken breasts to the simmering broth and poach 12–15 minutes until they reach 165°F. Move to a board, rest 5 minutes, then slice thin or shred.',
        tip: 'Poaching in the broth flavors the chicken and the chicken flavors the broth. Keep it at a gentle simmer — a hard boil makes chicken tough.',
      },
      {
        text: 'Cook or soak the noodles according to the package, then rinse briefly and divide among bowls.',
      },
      {
        text: 'Strain the broth, taste and season with salt. Bring it back to a rolling boil. Top the noodles with chicken, ladle the boiling broth over, and serve with bean sprouts, basil, sliced jalapeño and lime wedges.',
        tip: 'The broth must be at a full boil when you ladle it. It reheats the noodles and chicken right in the bowl — that\'s how pho shops serve it piping hot.',
      },
    ],
  },
  {
    id: 'lemon-pasta',
    name: 'Lemon Garlic Shrimp Pasta',
    cuisine: 'Italian',
    emoji: '🍝',
    minutes: 25,
    servings: 4,
    difficulty: 'medium',
    onePan: false,
    allergens: ['shellfish', 'gluten', 'dairy'],
    nutrition: { calories: 640, protein: 38, carbs: 85, fat: 18, fiber: 5, veg: 1.5 },
    ingredients: [
      { name: 'Spaghetti', qty: 1, unit: 'lb' },
      { name: 'Shrimp', qty: 1, unit: 'lb' },
      { name: 'Garlic', qty: 5, unit: 'cloves' },
      { name: 'Lemons', qty: 2, unit: '' },
      { name: 'Butter', qty: 4, unit: 'tbsp' },
      { name: 'Parmesan', qty: 2, unit: 'oz' },
      { name: 'Baby spinach', qty: 5, unit: 'oz' },
      { name: 'Kosher salt', qty: 5, unit: 'tsp' },
    ],
    steps: [
      {
        text: 'Bring a big pot of water to a boil and add about 1½ tbsp kosher salt.',
        tip: 'Salting the water is your only chance to season the pasta itself. It should taste pleasantly salty, like a well-seasoned soup.',
      },
      {
        text: 'Pat the shrimp dry and season with salt. Add the spaghetti to the water and cook 1 minute less than the package says. Before draining, scoop out 1 cup of the cooking water.',
        tip: 'Starchy pasta water is liquid gold. The starch helps butter and cheese turn into a glossy sauce that clings to every strand instead of sliding off.',
      },
      {
        text: 'Meanwhile, melt 1 tbsp butter in a large skillet over medium-high. Cook the shrimp 1–2 minutes per side until just pink, then move to a plate.',
      },
      {
        text: 'Lower the heat to medium. Add the remaining butter and the thinly sliced garlic and cook 1–2 minutes until pale gold. Add the zest of both lemons and the juice of one.',
        tip: 'Sliced garlic gives sweet, mellow flavor; minced garlic is sharper and burns faster. Watch it closely — golden is perfect, brown is bitter.',
      },
      {
        text: 'Add the drained pasta, spinach and ½ cup of pasta water. Toss hard with tongs for 1–2 minutes until the sauce turns glossy. Take the pan off the heat, add the grated parmesan and shrimp, and toss again. Add more pasta water if it looks dry, and more lemon to taste.',
        tip: 'Add cheese off the heat — high heat makes it clump into strings. Tossing vigorously is what creates the creamy emulsion.',
        watch: 'how to emulsify pasta sauce with pasta water',
      },
    ],
  },
  {
    id: 'turkey-chili',
    name: 'Turkey & Veggie Chili',
    cuisine: 'American',
    emoji: '🌶️',
    minutes: 45,
    servings: 4,
    difficulty: 'easy',
    onePan: true,
    allergens: [],
    nutrition: { calories: 480, protein: 36, carbs: 45, fat: 16, fiber: 13, veg: 2.5 },
    ingredients: [
      { name: 'Ground turkey', qty: 1, unit: 'lb' },
      { name: 'Kidney beans', qty: 1, unit: 'can' },
      { name: 'Black beans', qty: 1, unit: 'can' },
      { name: 'Diced tomatoes', qty: 1, unit: 'can' },
      { name: 'Bell peppers', qty: 2, unit: '' },
      { name: 'Zucchini', qty: 1, unit: '' },
      { name: 'Yellow onion', qty: 1, unit: '' },
      { name: 'Chili powder', qty: 2, unit: 'tbsp' },
      { name: 'Ground cumin', qty: 2, unit: 'tsp' },
      { name: 'Vegetable oil', qty: 1, unit: 'tbsp' },
      { name: 'Limes', qty: 1, unit: '' },
      { name: 'Kosher salt', qty: 2, unit: 'tsp' },
    ],
    steps: [
      {
        text: 'Heat the oil in a large pot over medium-high. Add the turkey, press it flat and let it brown undisturbed for 4 minutes, then break it up. Add the diced onion and cook 5 minutes more.',
        tip: 'Turkey is lean and goes gray easily. Letting it sit and brown first adds the savory depth that lean meat otherwise lacks.',
      },
      {
        text: 'Add the diced peppers and zucchini and cook 5 minutes. Stir in the chili powder and cumin and cook 1 minute.',
      },
      {
        text: 'Add the tomatoes, drained beans and 1 cup water. Scrape the bottom of the pot, bring to a simmer, and cook 20 minutes, stirring now and then.',
      },
      {
        text: 'Taste and season with salt. Finish with a squeeze of lime right before serving.',
        tip: 'A splash of acid at the end — lime juice or a little vinegar — makes the whole pot taste brighter. And chili really is better the next day, once the flavors settle.',
      },
    ],
  },
  {
    id: 'lentil-dal',
    name: 'Red Lentil Dal with Spinach',
    cuisine: 'Indian',
    emoji: '🥘',
    minutes: 35,
    servings: 4,
    difficulty: 'easy',
    onePan: false,
    allergens: [],
    nutrition: { calories: 470, protein: 21, carbs: 72, fat: 10, fiber: 15, veg: 1.5 },
    ingredients: [
      { name: 'Red lentils', qty: 1.5, unit: 'cup' },
      { name: 'Coconut milk', qty: 1, unit: 'can' },
      { name: 'Diced tomatoes', qty: 1, unit: 'can' },
      { name: 'Baby spinach', qty: 5, unit: 'oz' },
      { name: 'Yellow onion', qty: 1, unit: '' },
      { name: 'Garlic', qty: 3, unit: 'cloves' },
      { name: 'Fresh ginger', qty: 1, unit: 'piece' },
      { name: 'Curry powder', qty: 2, unit: 'tbsp' },
      { name: 'Vegetable oil', qty: 2, unit: 'tbsp' },
      { name: 'Basmati rice', qty: 1, unit: 'cup' },
      { name: 'Kosher salt', qty: 2, unit: 'tsp' },
    ],
    steps: [
      {
        text: 'Start the rice: rinse it, then cook with 1½ cups water (boil, cover, lowest heat 15 minutes, rest 10).',
      },
      {
        text: 'Heat the oil in a large pot over medium. Cook the diced onion with a pinch of salt for 6–8 minutes until golden. Add the garlic, a tablespoon of grated ginger and the curry powder and stir for 1 minute.',
        tip: 'Grate ginger straight from frozen — keep a knob in the freezer. It grates into fluffy snow, no peeling needed, and never goes moldy.',
      },
      {
        text: 'Rinse the lentils, then add them with the tomatoes, coconut milk and 2 cups water. Simmer 20 minutes, stirring often, until the lentils break down into a thick, creamy stew.',
        tip: "Red lentils need no soaking and cook in 20 minutes. Stir often near the end — they thicken fast and can stick.",
      },
      {
        text: 'Stir in the spinach until wilted. Taste and add salt; dal usually needs more than you\'d expect. Serve over rice.',
      },
    ],
  },
  {
    id: 'burrito-bowls',
    name: 'Chicken Burrito Bowls',
    cuisine: 'Mexican',
    emoji: '🥗',
    minutes: 40,
    servings: 4,
    difficulty: 'easy',
    onePan: false,
    allergens: ['dairy'],
    nutrition: { calories: 610, protein: 42, carbs: 62, fat: 20, fiber: 12, veg: 2 },
    ingredients: [
      { name: 'Chicken breasts', qty: 1.5, unit: 'lb' },
      { name: 'Brown rice', qty: 1, unit: 'cup' },
      { name: 'Black beans', qty: 1, unit: 'can' },
      { name: 'Frozen corn', qty: 1, unit: 'cup' },
      { name: 'Romaine lettuce', qty: 1, unit: 'head' },
      { name: 'Tomatoes', qty: 2, unit: '' },
      { name: 'Avocado', qty: 1, unit: '' },
      { name: 'Shredded cheddar', qty: 4, unit: 'oz' },
      { name: 'Taco seasoning', qty: 1, unit: 'packet' },
      { name: 'Limes', qty: 1, unit: '' },
      { name: 'Vegetable oil', qty: 1, unit: 'tbsp' },
    ],
    scratch: {
      title: 'Homemade taco seasoning',
      replaces: ['Taco seasoning'],
      ingredients: [
        { name: 'Chili powder', qty: 1, unit: 'tbsp' },
        { name: 'Ground cumin', qty: 2, unit: 'tsp' },
        { name: 'Paprika', qty: 1, unit: 'tsp' },
        { name: 'Dried oregano', qty: 1, unit: 'tsp' },
        { name: 'Garlic powder', qty: 1, unit: 'tsp' },
        { name: 'Kosher salt', qty: 1, unit: 'tsp' },
      ],
      steps: [
        {
          text: 'Stir the chili powder, cumin, paprika, oregano, garlic powder and salt together in a small bowl.',
          tip: 'Make a big jar of this. It goes on tacos, chicken, roasted potatoes and popcorn.',
        },
      ],
    },
    steps: [
      {
        text: 'Bring a large pot of salted water to a boil, add the brown rice, and boil uncovered for 30 minutes. Drain in a sieve, return to the pot, cover, and let steam off the heat for 10 minutes.',
        tip: 'Cooking brown rice like pasta — in lots of water, then draining — gives perfectly separate grains every time. It never turns gummy.',
      },
      {
        text: 'Place the chicken breasts between plastic wrap and pound the thick ends until the whole breast is an even ¾ inch. Rub with oil and the taco seasoning.',
        tip: "Chicken breasts are thick at one end and thin at the other, so the thin end dries out while the thick end cooks. Pounding them even is the fix.",
      },
      {
        text: 'Sear the chicken in a hot skillet over medium-high 5–6 minutes per side until 165°F. Rest 5 minutes, then slice.',
        tip: "Resting lets the juices settle back into the meat. Slice too soon and they run out onto the board.",
      },
      {
        text: 'In the same skillet, cook the corn over high heat without stirring for 3–4 minutes until charred in spots. Add the drained beans to warm through.',
        tip: 'Charring corn in a dry, hot pan gives it a smoky, grilled-street-corn flavor in minutes.',
      },
      {
        text: 'Build bowls with rice, chopped romaine, the corn and beans, sliced chicken, diced tomato, avocado and cheese. Finish with a squeeze of lime.',
      },
    ],
  },

  // ---- Technique recipes: each one teaches a skill that levels up everyday cooking ----
  {
    id: 'pan-sauce-chicken',
    name: 'Seared Chicken with Lemon Pan Sauce',
    cuisine: 'French',
    emoji: '🍋',
    minutes: 30,
    servings: 4,
    difficulty: 'advanced',
    onePan: true,
    allergens: ['dairy'],
    nutrition: { calories: 430, protein: 44, carbs: 6, fat: 24, fiber: 1, veg: 0.5 },
    ingredients: [
      { name: 'Chicken breasts', qty: 1.5, unit: 'lb' },
      { name: 'Shallot', qty: 1, unit: '' },
      { name: 'Chicken broth', qty: 8, unit: 'oz' },
      { name: 'Butter', qty: 3, unit: 'tbsp' },
      { name: 'Lemons', qty: 1, unit: '' },
      { name: 'Dijon mustard', qty: 1, unit: 'tbsp' },
      { name: 'Fresh parsley', qty: 1, unit: 'bunch' },
      { name: 'Vegetable oil', qty: 1, unit: 'tbsp' },
      { name: 'Kosher salt', qty: 1.5, unit: 'tsp' },
      { name: 'Black pepper', qty: 1, unit: 'tsp' },
    ],
    steps: [
      {
        text: 'Pound the chicken breasts to an even ¾ inch, or slice each in half horizontally into thin cutlets. Pat very dry and season both sides with salt and pepper.',
        tip: "Dry the surface really well. Moisture has to evaporate before browning can start, so wet chicken spends its first minutes steaming.",
      },
      {
        text: 'Heat the oil in a stainless-steel or cast-iron skillet over medium-high until it shimmers. Lay the chicken in, pressing gently, and don\'t touch it for 5–6 minutes until it releases easily and is deep golden. Flip and cook 3–5 minutes more until 160°F. Move to a plate.',
        tip: "If the chicken sticks when you try to flip, it's not ready. Wait another minute — it lets go on its own once the crust has formed. Nonstick pans don't build the browned bits you need for the sauce.",
      },
      {
        text: 'Look at the pan: those brown bits stuck to the bottom are the base of your sauce. Lower the heat to medium, add 1 tbsp butter and the minced shallot, and cook 1 minute, scraping gently.',
        tip: "Save the brown bits at the bottom of the pan — that's pure flavor! Cook your next ingredient right in them, then pour in liquid and scrape them into the sauce. Chefs call this deglazing, and it's the secret behind almost every restaurant pan sauce.",
        watch: 'how to make a pan sauce deglaze',
      },
      {
        text: 'Pour in the broth and scrape the bottom of the pan with a wooden spoon until it\'s clean. Simmer hard for 3–4 minutes until reduced by about half.',
        tip: 'Reducing concentrates the flavor. The sauce is ready when it has reduced to about ½ cup and bubbles look bigger and glossier.',
      },
      {
        text: 'Turn the heat to low. Whisk in the mustard and the juice of half the lemon, then add the remaining 2 tbsp cold butter one piece at a time, swirling the pan until the sauce turns silky. Taste for salt and lemon.',
        tip: "Swirling in cold butter off high heat is a classic French move called \"mounting\" — it turns a thin broth into a velvety sauce. Too hot and the butter separates into grease, so keep the heat low.",
      },
      {
        text: 'Return the chicken and any juices to the pan, spoon the sauce over, and finish with chopped parsley.',
      },
    ],
  },
  {
    id: 'smash-burgers',
    name: 'Diner Smash Burgers',
    cuisine: 'American',
    emoji: '🍔',
    minutes: 25,
    servings: 4,
    difficulty: 'medium',
    onePan: true,
    allergens: ['dairy', 'gluten', 'eggs'],
    nutrition: { calories: 720, protein: 38, carbs: 36, fat: 46, fiber: 2, veg: 0.5 },
    ingredients: [
      { name: 'Ground beef', qty: 1.5, unit: 'lb' },
      { name: 'Burger buns', qty: 4, unit: '' },
      { name: 'American cheese', qty: 8, unit: 'slices' },
      { name: 'Yellow onion', qty: 1, unit: '' },
      { name: 'Dill pickles', qty: 1, unit: 'jar' },
      { name: 'Mayonnaise', qty: 4, unit: 'tbsp' },
      { name: 'Ketchup', qty: 2, unit: 'tbsp' },
      { name: 'Butter', qty: 2, unit: 'tbsp' },
      { name: 'Kosher salt', qty: 1, unit: 'tsp' },
      { name: 'Black pepper', qty: 0.5, unit: 'tsp' },
    ],
    steps: [
      {
        text: 'Make the special sauce: stir together the mayonnaise, ketchup, 1 tbsp finely chopped pickles and a splash of pickle juice. Paper-thin slice the onion.',
        tip: "Skip the bottled burger sauce — this is the same idea in 30 seconds. A splash of pickle brine adds the tang.",
      },
      {
        text: 'Divide the beef into 8 loose balls (about 3 oz each) and keep them in the fridge until the second you cook them. Butter and toast the buns cut-side down in the skillet, then set aside.',
        tip: 'Cold meat is key: it lets the outside crust deeply while the inside stays juicy. Handle the beef as little as possible so the burgers stay tender.',
      },
      {
        text: 'Heat a cast-iron skillet over high heat for 3–4 minutes until smoking. Place 2–3 balls in the pan, and immediately smash each one flat with a sturdy spatula (press on the spatula with a second spatula or the bottom of a pot). Hold for 10 seconds. Season with salt and pepper.',
        tip: "You only get one chance to smash — do it in the first 30 seconds, while the meat is cold. Pressing later squeezes the juice out. A square of parchment between spatula and meat stops sticking.",
        watch: 'smash burger technique',
      },
      {
        text: 'Cook without moving for 2 minutes until the edges are lacy and deep brown. Scrape under the patty with the edge of your spatula — get all the crust — and flip. Add a slice of cheese, pile some onion on half the patties, and cook 1 minute more.',
        tip: "That crust stuck to the pan is the best part. Scrape firmly with the spatula's edge so it comes up with the burger instead of staying behind.",
      },
      {
        text: 'Stack two patties per bun with pickles and special sauce. Wipe the pan between batches if bits start to burn.',
      },
    ],
  },
  {
    id: 'carbonara',
    name: 'Spaghetti Carbonara',
    cuisine: 'Italian',
    emoji: '🥓',
    minutes: 25,
    servings: 4,
    difficulty: 'advanced',
    onePan: false,
    allergens: ['eggs', 'dairy', 'gluten', 'pork'],
    nutrition: { calories: 690, protein: 30, carbs: 82, fat: 26, fiber: 4, veg: 0 },
    ingredients: [
      { name: 'Spaghetti', qty: 1, unit: 'lb' },
      { name: 'Bacon', qty: 8, unit: 'oz' },
      { name: 'Eggs', qty: 4, unit: '' },
      { name: 'Parmesan', qty: 3, unit: 'oz' },
      { name: 'Black pepper', qty: 2, unit: 'tsp' },
      { name: 'Kosher salt', qty: 3, unit: 'tsp' },
    ],
    steps: [
      {
        text: 'Bring a large pot of water to a boil and salt it, using a little less salt than usual (the bacon and cheese are salty).',
      },
      {
        text: 'Crack 1 whole egg and 3 yolks into a large bowl (save the whites for an omelet). Finely grate in the parmesan and whisk into a thick paste.',
        tip: "Extra yolks give carbonara its rich, custardy texture without the eggy taste of all-whole-eggs. Grate cheese on the finest holes so it melts instantly.",
      },
      {
        text: 'Cut the bacon into strips and cook in a large skillet over medium heat for 8–10 minutes until crisp but still a little chewy. Turn off the heat and leave the bacon and its fat in the pan.',
      },
      {
        text: 'Crack the black pepper coarsely and toast it in the bacon fat for 30 seconds.',
        tip: "Toasting pepper in fat is a Roman trick — it blooms into something floral and warm, not just spicy. Freshly cracked makes a real difference here.",
      },
      {
        text: 'Cook the spaghetti until just al dente. Save 1½ cups of pasta water, then drain. Add the pasta to the bacon pan off the heat and toss to coat.',
      },
      {
        text: 'Slowly whisk ½ cup of the hot pasta water into the egg mixture. Pour it over the pasta and toss vigorously for 1–2 minutes, adding splashes of pasta water, until the sauce turns creamy and coats every strand.',
        tip: 'The #1 carbonara mistake is scrambled eggs. Whisking hot water into the eggs first ("tempering") warms them gently, and doing the final toss OFF the heat keeps the sauce silky. If it\'s too thin, keep tossing — it thickens as it cools slightly.',
        watch: 'carbonara technique without scrambling eggs',
      },
      {
        text: 'Serve immediately with more grated parmesan and black pepper.',
      },
    ],
  },
  {
    id: 'mushroom-risotto',
    name: 'Mushroom Risotto',
    cuisine: 'Italian',
    emoji: '🍄',
    minutes: 45,
    servings: 4,
    difficulty: 'advanced',
    onePan: true,
    allergens: ['dairy'],
    nutrition: { calories: 560, protein: 15, carbs: 78, fat: 18, fiber: 3, veg: 1.5 },
    ingredients: [
      { name: 'Arborio rice', qty: 1.5, unit: 'cup' },
      { name: 'Cremini mushrooms', qty: 16, unit: 'oz' },
      { name: 'Shallot', qty: 2, unit: '' },
      { name: 'Garlic', qty: 2, unit: 'cloves' },
      { name: 'Dry white wine', qty: 0.5, unit: 'cup' },
      { name: 'Chicken broth', qty: 48, unit: 'oz' },
      { name: 'Butter', qty: 4, unit: 'tbsp' },
      { name: 'Parmesan', qty: 3, unit: 'oz' },
      { name: 'Fresh thyme', qty: 1, unit: 'bunch' },
      { name: 'Olive oil', qty: 2, unit: 'tbsp' },
      { name: 'Kosher salt', qty: 1.5, unit: 'tsp' },
    ],
    steps: [
      {
        text: 'Warm the broth in a saucepan over low heat and keep it steaming the whole time.',
        tip: "Cold broth shocks the rice and stalls the cooking. Keeping it hot means each ladle keeps the starch releasing steadily.",
      },
      {
        text: 'Heat the olive oil in a wide, heavy pot over medium-high. Add the sliced mushrooms in an even layer and leave them alone for 4–5 minutes until browned underneath, then stir and cook 3 minutes more. Salt them only now. Move half the mushrooms to a plate.',
        tip: "Salt mushrooms at the end of browning, not the start. Salt pulls out their water, and they'll steam into gray rubber instead of turning golden and meaty.",
      },
      {
        text: 'Lower the heat to medium. Add 1 tbsp butter, the minced shallots, garlic and a few thyme leaves and cook 2 minutes. Add the rice and stir for 2 minutes until the edges look translucent.',
      },
      {
        text: 'Pour in the wine and stir, scraping up any browned bits, until it\'s almost completely absorbed.',
        tip: "The wine deglazes the pan — lifting up all the mushroom browning into the rice — and adds acidity that keeps the finished risotto from tasting heavy.",
      },
      {
        text: 'Add hot broth one ladle at a time, stirring often and waiting until each ladle is mostly absorbed before adding the next. After about 18–20 minutes the rice should be creamy but still have a slight bite in the center.',
        tip: "You don't need to stir nonstop, but frequent stirring rubs starch off the rice — that's what makes risotto creamy with no cream at all.",
        watch: 'how to make risotto technique',
      },
      {
        text: 'Turn off the heat. Stir in the remaining 3 tbsp butter, the grated parmesan and the reserved mushrooms, and beat vigorously for 30 seconds. Add a final splash of broth so it flows like lava, then serve right away.',
        tip: 'This final beating of butter and cheese is called mantecatura — it\'s what gives restaurant risotto its glossy, flowing texture. Risotto should spread slowly on the plate, not sit in a stiff mound.',
      },
    ],
  },
  {
    id: 'butter-basted-steak',
    name: 'Butter-Basted Steak & Charred Broccoli',
    cuisine: 'American',
    emoji: '🥩',
    minutes: 40,
    servings: 2,
    difficulty: 'advanced',
    onePan: false,
    allergens: ['dairy'],
    nutrition: { calories: 640, protein: 48, carbs: 14, fat: 44, fiber: 6, veg: 2 },
    ingredients: [
      { name: 'New York strip steak', qty: 1, unit: 'lb' },
      { name: 'Broccoli', qty: 1, unit: 'lb' },
      { name: 'Butter', qty: 3, unit: 'tbsp' },
      { name: 'Garlic', qty: 4, unit: 'cloves' },
      { name: 'Fresh thyme', qty: 1, unit: 'bunch' },
      { name: 'Vegetable oil', qty: 2, unit: 'tbsp' },
      { name: 'Olive oil', qty: 2, unit: 'tbsp' },
      { name: 'Lemons', qty: 1, unit: '' },
      { name: 'Kosher salt', qty: 2, unit: 'tsp' },
      { name: 'Black pepper', qty: 1, unit: 'tsp' },
    ],
    steps: [
      {
        text: 'At least 45 minutes ahead (or up to a day), pat the steaks dry and salt them generously on all sides. Leave uncovered on a rack in the fridge.',
        tip: 'This is a dry brine. Salt first pulls moisture out, then it dissolves and gets reabsorbed, seasoning the meat deeply. The dry surface also sears much better.',
      },
      {
        text: 'Heat the oven to 450°F. Cut the broccoli into florets with a flat side, toss with olive oil and salt, and roast cut-side down on a sheet pan for 18–20 minutes until deeply charred at the edges.',
        tip: "Don't fear the dark edges — charred broccoli is sweet and nutty. Flat sides against the hot pan get the most color.",
      },
      {
        text: 'Pat the steaks dry again and season with pepper. Heat the vegetable oil in a cast-iron skillet over high heat until it\'s just smoking. Add the steaks and cook 2 minutes per side, flipping a few times, until well browned.',
        tip: 'Use a high-smoke-point oil like vegetable oil for the sear — olive oil and butter burn at these temperatures. Flipping every minute actually cooks steak more evenly.',
      },
      {
        text: 'Lower the heat to medium. Add the butter, smashed garlic and a handful of thyme. Tilt the pan toward you so the butter pools, and spoon it over the steaks continuously for 1–2 minutes. Pull the steaks at 125°F for medium-rare.',
        tip: "Basting with foaming butter, garlic and herbs is how steakhouses get that nutty, aromatic crust. An instant-read thermometer is the best $15 you'll spend — no more guessing.",
        watch: 'how to butter baste steak',
      },
      {
        text: 'Rest the steaks on a board for 5–10 minutes, then slice against the grain. Squeeze lemon over the broccoli and spoon some of the pan butter over everything.',
        tip: "Resting lets the juices redistribute. The temperature also rises about 5°F while it rests, which is why you pull it early.",
      },
    ],
  },
  {
    id: 'beef-broccoli',
    name: 'Beef & Broccoli Stir-Fry',
    cuisine: 'Chinese',
    emoji: '🥦',
    minutes: 35,
    servings: 4,
    difficulty: 'medium',
    onePan: false,
    allergens: ['soy', 'gluten', 'shellfish', 'sesame'],
    nutrition: { calories: 590, protein: 38, carbs: 62, fat: 20, fiber: 5, veg: 2 },
    ingredients: [
      { name: 'Flank steak', qty: 1, unit: 'lb' },
      { name: 'Broccoli', qty: 1, unit: 'lb' },
      { name: 'Garlic', qty: 3, unit: 'cloves' },
      { name: 'Fresh ginger', qty: 1, unit: 'piece' },
      { name: 'Soy sauce', qty: 4, unit: 'tbsp' },
      { name: 'Oyster sauce', qty: 3, unit: 'tbsp' },
      { name: 'Light brown sugar', qty: 1, unit: 'tbsp' },
      { name: 'Cornstarch', qty: 4, unit: 'tsp' },
      { name: 'Baking soda', qty: 0.5, unit: 'tsp' },
      { name: 'Sesame oil', qty: 1, unit: 'tbsp' },
      { name: 'Vegetable oil', qty: 3, unit: 'tbsp' },
      { name: 'Jasmine rice', qty: 1.5, unit: 'cup' },
    ],
    steps: [
      {
        text: 'Rinse and cook the rice (2¼ cups water; boil, cover, lowest heat 15 minutes, rest 10).',
      },
      {
        text: 'Slice the steak thin against the grain. Toss with 1 tbsp soy sauce, 2 tsp cornstarch and the baking soda, and let sit 15 minutes.',
        tip: "This is \"velveting,\" the Chinese-restaurant secret for silky, tender beef. Baking soda raises the meat's pH so it can't tighten up, and the cornstarch coating protects it from the high heat.",
        watch: 'velveting beef technique',
      },
      {
        text: 'Make the sauce: whisk the remaining soy sauce, oyster sauce, brown sugar, sesame oil, remaining 2 tsp cornstarch and ½ cup water.',
        tip: "This is takeout-style brown sauce from scratch — no bottle needed. The cornstarch makes it thicken and turn glossy the moment it hits the hot pan.",
      },
      {
        text: 'Heat 1 tbsp oil in a wok or large skillet over high. Add the broccoli and 3 tbsp water, cover, and steam-fry for 2 minutes until bright green and just tender. Move to a plate.',
      },
      {
        text: 'Add the remaining oil and heat until smoking. Add the beef in a single layer and sear 1 minute per side, in two batches if needed. Add the minced garlic and a tablespoon of grated ginger and stir 30 seconds.',
      },
      {
        text: 'Return the broccoli, stir the sauce and pour it in. Toss for 1 minute until glossy and thickened. Serve over rice.',
      },
    ],
  },
  {
    id: 'fried-rice',
    name: 'Chicken Fried Rice',
    cuisine: 'Chinese',
    emoji: '🍚',
    minutes: 25,
    servings: 4,
    difficulty: 'medium',
    onePan: true,
    allergens: ['eggs', 'soy', 'gluten', 'sesame'],
    nutrition: { calories: 560, protein: 30, carbs: 66, fat: 18, fiber: 4, veg: 1.5 },
    ingredients: [
      { name: 'Jasmine rice', qty: 1.5, unit: 'cup' },
      { name: 'Chicken thighs', qty: 1, unit: 'lb' },
      { name: 'Eggs', qty: 3, unit: '' },
      { name: 'Frozen peas and carrots', qty: 1.5, unit: 'cup' },
      { name: 'Green onions', qty: 1, unit: 'bunch' },
      { name: 'Garlic', qty: 3, unit: 'cloves' },
      { name: 'Soy sauce', qty: 3, unit: 'tbsp' },
      { name: 'Sesame oil', qty: 1, unit: 'tbsp' },
      { name: 'Vegetable oil', qty: 3, unit: 'tbsp' },
      { name: 'Kosher salt', qty: 1, unit: 'tsp' },
    ],
    steps: [
      {
        text: 'Ideally the day before, cook the rice and spread it on a sheet pan to cool, then refrigerate. In a hurry, cook it, spread it out thin and put it in the freezer for 20 minutes.',
        tip: 'Day-old rice is the secret. Fresh rice is soft and steamy and turns to mush in the pan; chilled rice has dried out slightly, so each grain fries separately.',
      },
      {
        text: 'Cut the chicken into small pieces and season with salt. Prep everything else before you turn on the heat: beat the eggs, mince the garlic, slice the green onions and separate the whites from the greens.',
      },
      {
        text: 'Heat 1 tbsp oil in a wok or large skillet over high until smoking. Cook the chicken 4–5 minutes until browned and cooked through. Push it aside, add the eggs, scramble softly, and move everything to a plate.',
      },
      {
        text: 'Add the remaining oil. Add the rice, breaking up clumps, and spread it across the pan. Let it sit 1 minute, then toss; repeat for 4–5 minutes until the rice is hot and some grains are toasty.',
        tip: "Don't stir constantly. Letting the rice sit against the hot pan between tosses is how you get that slightly smoky, toasty flavor fried rice is known for.",
        watch: 'fried rice technique high heat',
      },
      {
        text: 'Add the garlic, green onion whites and frozen peas and carrots and toss 2 minutes. Return the chicken and eggs.',
      },
      {
        text: 'Drizzle the soy sauce around the hot edge of the pan rather than onto the rice, then toss. Finish with sesame oil and green onion greens.',
        tip: "Pouring soy sauce onto the hot metal at the edge makes it sizzle and caramelize slightly before it hits the rice — more flavor, and the rice doesn't go soggy.",
      },
    ],
  },
  {
    id: 'chickpea-curry',
    name: 'Chickpea Coconut Curry',
    cuisine: 'Indian',
    emoji: '🫘',
    minutes: 35,
    servings: 4,
    difficulty: 'easy',
    onePan: false,
    allergens: [],
    nutrition: { calories: 520, protein: 16, carbs: 70, fat: 20, fiber: 12, veg: 2 },
    ingredients: [
      { name: 'Chickpeas', qty: 2, unit: 'can' },
      { name: 'Coconut milk', qty: 1, unit: 'can' },
      { name: 'Diced tomatoes', qty: 1, unit: 'can' },
      { name: 'Yellow onion', qty: 1, unit: '' },
      { name: 'Garlic', qty: 3, unit: 'cloves' },
      { name: 'Fresh ginger', qty: 1, unit: 'piece' },
      { name: 'Curry powder', qty: 2, unit: 'tbsp' },
      { name: 'Baby spinach', qty: 5, unit: 'oz' },
      { name: 'Basmati rice', qty: 1, unit: 'cup' },
      { name: 'Limes', qty: 1, unit: '' },
      { name: 'Vegetable oil', qty: 2, unit: 'tbsp' },
      { name: 'Kosher salt', qty: 2, unit: 'tsp' },
    ],
    steps: [
      {
        text: 'Rinse and cook the rice (1½ cups water; boil, cover, lowest heat 15 minutes, rest 10).',
      },
      {
        text: 'Heat the oil in a large pot over medium. Cook the diced onion with a pinch of salt for 8 minutes until golden. Add the garlic, a tablespoon of grated ginger and the curry powder and stir 1 minute.',
        tip: "Take your time with the onions. Golden, sweet onions are the foundation of a curry's flavor — rushing them gives a raw, sharp taste.",
      },
      {
        text: 'Add the drained chickpeas, tomatoes and coconut milk. Simmer 15 minutes. Use the back of a spoon to mash about a quarter of the chickpeas against the side of the pot.',
        tip: 'Mashing some chickpeas thickens the sauce naturally and makes it creamy — no flour or cream needed.',
      },
      {
        text: 'Stir in the spinach until wilted. Season with salt and the juice of half the lime, and serve over rice with lime wedges.',
      },
    ],
  },
];

function hasInstructions(recipe) {
  return (
    Array.isArray(recipe.steps) &&
    recipe.steps.some((s) => (typeof s === 'string' ? s : s?.text || '').trim().length > 0)
  );
}

export const RECIPES = [...RAW_RECIPES, ...LIBRARY].filter(hasInstructions);

// Recipes saved from online sources or imported from links. The app
// registers them here at startup so the rest of the code can find them.
const extraRecipes = new Map();

export function registerRecipes(list) {
  extraRecipes.clear();
  for (const r of list) if (hasInstructions(r)) extraRecipes.set(r.id, r);
}

export function allRecipes() {
  return [...RECIPES, ...extraRecipes.values()];
}

export function getRecipe(id) {
  if (!id) return undefined;
  return RECIPES.find((r) => r.id === id) || extraRecipes.get(id);
}

export function cuisinesOf(list) {
  return ['All', ...Array.from(new Set(list.map((r) => r.cuisine).filter(Boolean))).sort()];
}

export function stepText(step) {
  return typeof step === 'string' ? step : step.text;
}

// The recipe as it will actually be cooked: with the homemade sauce
// swapped in when "Make sauces from scratch" is on.
export function effectiveRecipe(recipe, settings) {
  if (!recipe || !recipe.scratch || !settings?.scratchSauces) return recipe;
  const { scratch } = recipe;
  const merged = new Map();
  const add = (ing) => {
    const key = `${ing.name.toLowerCase()}|${ing.unit}`;
    const cur = merged.get(key);
    if (cur) merged.set(key, { name: cur.name, unit: cur.unit, qty: cur.qty + ing.qty });
    else merged.set(key, { ...ing });
  };
  recipe.ingredients.filter((i) => !scratch.replaces.includes(i.name)).forEach(add);
  scratch.ingredients.forEach(add);
  return {
    ...recipe,
    ingredients: Array.from(merged.values()),
    allergens: Array.from(new Set([...(recipe.allergens || []), ...(scratch.allergens || [])])),
    steps: [
      ...scratch.steps.map((s) => ({ ...s, part: scratch.title })),
      ...recipe.steps.map((s) => (typeof s === 'string' ? { text: s } : s)),
    ],
    usingScratch: true,
  };
}

export const DIFFICULTY = {
  easy: { label: 'Easy', tone: 'primary' },
  medium: { label: 'Medium', tone: 'warn' },
  advanced: { label: 'Advanced', tone: 'accent' },
};

// Common allergens a user can switch off in Settings.
export const ALLERGENS = [
  { key: 'dairy', label: 'Dairy' },
  { key: 'eggs', label: 'Eggs' },
  { key: 'gluten', label: 'Gluten' },
  { key: 'peanuts', label: 'Peanuts' },
  { key: 'treenuts', label: 'Tree nuts' },
  { key: 'shellfish', label: 'Shellfish' },
  { key: 'fish', label: 'Fish' },
  { key: 'soy', label: 'Soy' },
  { key: 'sesame', label: 'Sesame' },
  { key: 'pork', label: 'Pork' },
];

// Words that signal an allergen in an ingredient name. Used for online
// and imported recipes, which don't come with allergen tags, and as a
// second check on built-in ones.
const ALLERGEN_WORDS = {
  dairy: ['queso', 'paneer', 'milk', 'cream', 'butter', 'cheese', 'yogurt', 'yoghurt', 'parmesan', 'mozzarella', 'feta', 'cheddar', 'ghee', 'tzatziki', 'ricotta', 'buttermilk', 'mascarpone'],
  eggs: ['egg', 'eggs', 'mayonnaise', 'mayo', 'aioli'],
  gluten: ['barley', 'tortellini', 'dumplings', 'phyllo', 'gnocchi', 'ditalini', 'rigatoni', 'rotini', 'fettuccine', 'lasagna', 'orzo', 'udon', 'ramen', 'shells', 'puff pastry', 'stout', 'hoagie', 'rolls', 'flour', 'bread', 'breadcrumbs', 'panko', 'pasta', 'spaghetti', 'linguine', 'penne', 'macaroni', 'noodles', 'naan', 'bun', 'buns', 'wheat', 'barley', 'couscous', 'soy sauce', 'teriyaki', 'tortilla', 'tortillas', 'pita', 'croutons', 'beer'],
  peanuts: ['peanut', 'peanuts'],
  treenuts: ['almond', 'almonds', 'walnut', 'walnuts', 'pecan', 'pecans', 'cashew', 'cashews', 'pistachio', 'pistachios', 'hazelnut', 'hazelnuts', 'macadamia', 'pine nut', 'pine nuts'],
  shellfish: ['seafood', 'crab meat', 'old bay', 'shrimp', 'prawn', 'prawns', 'crab', 'lobster', 'scallop', 'scallops', 'clam', 'clams', 'mussel', 'mussels', 'oyster', 'oysters', 'oyster sauce', 'crawfish'],
  fish: ['seafood', 'anchovy fillets', 'worcestershire', 'salmon', 'tuna', 'cod', 'anchovy', 'anchovies', 'fish', 'fish sauce', 'tilapia', 'halibut', 'trout', 'sardine', 'sardines', 'haddock', 'mackerel'],
  soy: ['soy', 'soy sauce', 'tofu', 'edamame', 'miso', 'tempeh', 'teriyaki'],
  sesame: ['sesame', 'tahini'],
  pork: ['pork', 'bacon', 'ham', 'pancetta', 'prosciutto', 'chorizo', 'andouille', 'sausage', 'lard'],
};

// Exceptions where a word appears but the allergen doesn't.
const ALLERGEN_EXCEPTIONS = {
  dairy: ['peanut butter', 'coconut milk', 'coconut cream', 'almond milk', 'oat milk', 'cream of tartar'],
  eggs: ['eggplant'],
  gluten: ['rice noodles', 'corn tortillas', 'gluten-free'],
};

export function detectAllergens(recipe) {
  const found = new Set(recipe.allergens || []);
  const names = recipe.ingredients.map((i) => i.name.toLowerCase());
  for (const [key, words] of Object.entries(ALLERGEN_WORDS)) {
    if (found.has(key)) continue;
    const exceptions = ALLERGEN_EXCEPTIONS[key] || [];
    const hit = names.some((n) => {
      if (exceptions.some((e) => n.includes(e))) return false;
      return words.some((w) => new RegExp(`\\b${w}\\b`).test(n));
    });
    if (hit) found.add(key);
  }
  return Array.from(found);
}

// A dinner counts as "balanced" when one serving has solid protein,
// good fiber, real vegetables and sensible calories.
export const BALANCED_RULES = {
  minProtein: 20,
  minFiber: 5,
  minVeg: 1.5,
  minCalories: 400,
  maxCalories: 800,
};

export function isBalanced(recipe) {
  const n = recipe.nutrition;
  const r = BALANCED_RULES;
  return (
    !!n &&
    n.protein >= r.minProtein &&
    n.fiber >= r.minFiber &&
    n.veg >= r.minVeg &&
    n.calories >= r.minCalories &&
    n.calories <= r.maxCalories
  );
}
