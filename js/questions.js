// All 22 questions from the PiXL Year 5 Reasoning paper (Autumn, Paper 3),
// rebuilt as method based tasks. Q22 is split into 22a and 22b because
// its parts sit in different curriculum strands.
import { frac, bar, pictogram, crayonBox, teacups, biscuits, hamster, viking, kidSpeaking } from './art.js';

export const CATEGORIES = {
  place:   { name: 'Number and place value',      skill: 'Shooting',     icon: '🎯' },
  addsub:  { name: 'Addition and subtraction',    skill: 'Passing',      icon: '⚽' },
  multdiv: { name: 'Multiplication and division', skill: 'Dribbling',    icon: '🌀' },
  frac:    { name: 'Fractions and decimals',      skill: 'Ball control', icon: '🦶' },
  measure: { name: 'Measurement',                 skill: 'Stamina',      icon: '🔋' },
  geom:    { name: 'Geometry',                    skill: 'Heading',      icon: '📐' },
  stats:   { name: 'Statistics',                  skill: 'Vision',       icon: '👀' }
};

export const METHODS = {
  pvgrid:   { name: 'Place value grid',      icon: '🔢' },
  column:   { name: 'Column method',         icon: '🧱' },
  barmodel: { name: 'Bar model',             icon: '📊' },
  numline:  { name: 'Number line',           icon: '📏' },
  tables:   { name: 'Times tables',          icon: '✖️' },
  shortdiv: { name: 'Short division',        icon: '🚌' },
  equivfr:  { name: 'Equivalent fractions',  icon: '🍕' },
  protract: { name: 'Protractor',            icon: '📐' },
  justknew: { name: 'I just knew it',        icon: '💡' }
};

const isSquare = n => Number.isInteger(n) && n > 0 && Number.isInteger(Math.sqrt(n));
const isPrime = n => {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};

export const QUESTIONS = [
  // ---------------- Q1 ----------------
  {
    id: 'q1', num: '1', cat: 'place', marks: 1, methods: ['pvgrid'],
    stem: `<p>Write the missing number.<br>One has been done for you.</p>
      <div class="arrows">
        <div class="arrow-row"><b>347</b><span class="arrow">100 more</span><b>447</b></div>
        <div class="arrow-row">{{a}}<span class="arrow">100 more</span><b>178</b></div>
      </div>`,
    tasks: [{
      id: 'a', kind: 'num', inline: true, answer: 78,
      mistakes: [
        [278, 'That is 100 more than 178. The arrow points to 178, so work backwards: 100 less.', 'added instead of working backwards'],
        [168, 'You took away 10. The arrow says 100 more, so take away 100.', 'took away 10 not 100'],
        [177, 'Only the hundreds digit changes when you take away 100. The tens and ones stay the same.', 'changed the ones digit']
      ],
      generic: 'Work backwards from 178. What number is 100 less?',
      mini: `<p>Example: <b>?</b> → 100 more → <b>265</b></p><p>Work backwards: 265 − 100.</p><p>In a place value grid, 2 hundreds take away 1 hundred = 1 hundred. Tens and ones stay the same.</p><p>So the missing number is <b>165</b>.</p>`
    }],
    hints: [
      'Use the place value grid. When you add or take away 100, which digit changes?',
      'Work backwards. The box plus 100 makes 178, so the box must be 178 take away 100.',
      '178 is 1 hundred, 7 tens and 8 ones. Take away 1 hundred. How many hundreds are left? The tens and ones don\'t change.'
    ]
  },

  // ---------------- Q2 ----------------
  {
    id: 'q2', num: '2', cat: 'addsub', marks: 1, methods: ['barmodel'],
    stem: `<p>Jakub completes this calculation.</p><p class="big"><b>168 + 207 = 375</b></p>
      <p>Tick the <b>two</b> calculations Jakub could do to check his answer.</p>{{a}}`,
    tasks: [{
      id: 'a', kind: 'choice', pick: 2, layout: 'col', tick: true,
      options: ['375 − 207 = 168', '168 − 207 = 375', '375 − 168 = 207', '207 − 375 = 168'],
      correct: [0, 2],
      wrong: {
        1: ['168 − 207 = 375 can\'t be right. Taking away makes a number smaller, not bigger.', 'subtraction gets bigger'],
        3: ['When you take away to check, you start with the whole amount, 375.', 'did not start with the whole']
      },
      generic: 'Find the two calculations that start with the whole amount, 375.',
      mini: `<p>Example: 30 + 50 = 80</p>${bar('80', [{ label: '30' }, { label: '50' }])}<p>80 is the whole. Whole take away one part gives the other part.</p><p>So the checks are <b>80 − 50 = 30</b> and <b>80 − 30 = 50</b>.</p>`
    }],
    hints: [
      'Addition and subtraction are inverse operations. They undo each other.',
      `Draw a bar model. 375 is the whole bar, split into 168 and 207.${bar('375', [{ label: '168' }, { label: '207' }])}`,
      'Whole take away one part = the other part. So both checks start with 375.'
    ]
  },

  // ---------------- Q3 ----------------
  {
    id: 'q3', num: '3', cat: 'multdiv', marks: 1, methods: ['tables'],
    stem: `<p>Circle the two numbers that are factors of 48.</p>{{a}}`,
    tasks: [{
      id: 'a', kind: 'choice', pick: 2, layout: 'row',
      options: ['18', '12', '7', '4', '10'], correct: [1, 3],
      wrong: {
        0: ['Check 18: 18 × 2 = 36 and 18 × 3 = 54. 48 is in between, so 18 doesn\'t go exactly.', 'chose 18'],
        2: ['Check 7: 7 × 7 = 49, just past 48. So 7 doesn\'t go into 48 exactly.', 'chose 7'],
        4: ['Numbers in the 10 times table end in 0. 48 ends in 8, so 10 isn\'t a factor.', 'chose 10']
      },
      generic: 'A factor goes into 48 exactly. Check each one with your times tables.',
      mini: `<p>Is 6 a factor of 30? 6 × 5 = 30 exactly, so <b>yes</b>.</p><p>Is 4 a factor of 30? 4 × 7 = 28, 4 × 8 = 32. 30 is skipped, so <b>no</b>.</p>`
    }],
    hints: [
      'A factor of 48 divides into 48 exactly, with nothing left over.',
      'Use your times tables. Is 48 in the 4 times table? The 12 times table?',
      'Try factor pairs of 48: 1 × 48, 2 × 24, 3 × 16 ... keep going and see which numbers appear.'
    ]
  },

  // ---------------- Q4 ----------------
  {
    id: 'q4', num: '4', cat: 'stats', marks: 2, methods: ['column'],
    stem: `<p>This chart shows how many glass bottles were recycled in a month.</p>${pictogram()}
      <p><b>a)</b> Which bottle types had <b>more than 200</b> recycled in the month?</p>{{a}}
      <p><b>b)</b> How many <b>more</b> transparent than blue bottles were recycled?</p>`,
    tasks: [
      {
        id: 'a', kind: 'choice', pick: 0, layout: 'row', tick: true,
        options: ['Green', 'Blue', 'Brown', 'Transparent'], correct: [0, 1, 3],
        wrong: {
          2: ['Brown is 1 whole square and half a square. That\'s 100 + 50 = 150, which is less than 200.', 'counted brown as over 200']
        },
        missing: {
          1: ['Look at Blue again and count the quarters too. Each quarter is worth 25.', 'missed blue (quarters)'],
          0: ['Green has 4 whole squares. How many bottles is that?', 'missed green'],
          3: ['Transparent has lots of squares. Count them using the key.', 'missed transparent']
        },
        generic: 'Work out each total using the key, then pick every one over 200.',
        mini: `<p>Example: 2 whole squares and 1 quarter.</p><p>2 whole squares = 200. 1 quarter = 25.</p><p>Total = <b>225</b>, which is more than 200.</p>`
      },
      {
        id: 'b1', kind: 'num', label: 'Transparent bottles =', answer: 625,
        mistakes: [
          [600, 'Don\'t forget the little quarter square at the end. It\'s worth 25.', 'forgot the quarter'],
          [650, 'A quarter of 100 is 25, not 50.', 'quarter worth 50'],
          [700, 'The last square is only a quarter, so it\'s worth 25, not 100.', 'counted quarter as whole']
        ],
        generic: 'Count the whole squares (100 each), then add 25 for the quarter.',
        mini: `<p>Example: 4 whole squares and 1 quarter.</p><p>4 × 100 = 400, plus 25 = <b>425</b>.</p>`
      },
      {
        id: 'b2', kind: 'num', label: 'Blue bottles =', answer: 275,
        mistakes: [
          [250, 'Count the quarters: there are 3 of them, so 3 × 25 = 75.', 'counted only 2 quarters'],
          [300, 'The last shape isn\'t a whole square. It\'s 3 quarters, so 75.', 'counted 3 quarters as whole'],
          [230, '3 quarters are 3 lots of 25, which is 75, not 30.', 'quarters as tens']
        ],
        generic: '2 whole squares are 200. Then the 3 quarters are 25 each.',
        mini: `<p>Example: 1 whole square and 3 quarters.</p><p>100 + 25 + 25 + 25 = <b>175</b>.</p>`
      },
      {
        id: 'b3', kind: 'num', label: 'Difference: 625 − 275 =', answer: 350,
        mistakes: [
          [450, 'In the tens column, 2 − 7 needs an exchange from the hundreds. Did you swap the digits round?', 'no exchange in column subtraction'],
          [900, 'How many more means find the difference, so take away.', 'added instead of subtracting'],
        ],
        generic: 'Use column subtraction: 625 − 275. Start with the ones.',
        mini: `<p>Example: 534 − 162 in columns.</p><p>Ones: 4 − 2 = 2.</p><p>Tens: 3 − 6 won't go. Exchange 1 hundred for 10 tens: 13 − 6 = 7.</p><p>Hundreds: 4 − 1 = 3. Answer <b>372</b>.</p>`
      }
    ],
    hints: [
      'Use the key. One whole square is 100 bottles, so each quarter is 25.',
      'For each row, count the whole squares in hundreds, then add 25 for each quarter.',
      'Transparent: 6 whole squares = 600. Now add the quarter. Then do the same for Blue.'
    ]
  },

  // ---------------- Q5 ----------------
  {
    id: 'q5', num: '5', cat: 'place', marks: 2, methods: ['pvgrid'],
    stem: `<p>Here are 6 cards. Tap a card, then tap a box.</p>{{tray}}
      <p>Use a card to complete each calculation.</p>
      <div class="cardrows">
        <div>6.4 {{a}} = 0.64</div>
        <div>6.4 {{b}} = 6,400</div>
        <div>6.4 {{c}} = 0.064</div>
      </div>`,
    cards: ['× 10', '× 100', '× 1,000', '÷ 10', '÷ 100', '÷ 1,000'],
    tasks: [
      {
        id: 'a', kind: 'card', answer: '÷ 10',
        wrong: {
          '÷ 100': ['÷ 100 moves the digits 2 places and gives 0.064. Here they only move 1 place.', 'counted places wrong'],
          '× 10': ['0.64 is smaller than 6.4, so you need to divide, not multiply.', 'multiplied instead of divided']
        },
        generic: 'Is 0.64 bigger or smaller than 6.4? Then count how many places the 6 moved.',
        mini: `<p>Example: 3.5 → 0.35</p><p>The 3 moved from the ones to the tenths. That's 1 place to the right, smaller, so it's <b>÷ 10</b>.</p>`
      },
      {
        id: 'b', kind: 'card', answer: '× 1,000',
        wrong: {
          '× 100': ['6.4 × 100 = 640. You need the 6 to move one more place to reach 6,400.', 'counted places wrong'],
          '× 10': ['6.4 × 10 = 64. Keep going: how many places does the 6 move to be in the thousands?', 'counted places wrong']
        },
        generic: 'Where is the 6 in 6,400? Count the places it moved from the ones.',
        mini: `<p>Example: 2.7 → 270</p><p>The 2 moved from ones to hundreds. That's 2 places to the left, bigger, so it's <b>× 100</b>.</p>`
      },
      {
        id: 'c', kind: 'card', answer: '÷ 100',
        wrong: {
          '÷ 1,000': ['6.4 ÷ 1,000 = 0.0064. That moves the 6 one place too far.', 'counted places wrong'],
          '÷ 10': ['6.4 ÷ 10 = 0.64. In 0.064 the 6 is in the hundredths. Count again.', 'counted places wrong']
        },
        generic: 'In 0.064, the 6 is in the hundredths. How many places is that from the ones?',
        mini: `<p>Example: 8.1 → 0.081</p><p>The 8 moved from ones to hundredths: 2 places to the right, so it's <b>÷ 100</b>.</p>`
      }
    ],
    hints: [
      'Use a place value grid. Multiplying moves digits to the left (bigger). Dividing moves them to the right (smaller).',
      'Find where the 6 is in 6.4 (the ones). Then find where it is in each answer.',
      'In 0.64 the 6 is in the tenths. Ones to tenths is 1 place to the right. Which card does that?'
    ]
  },

  // ---------------- Q6 ----------------
  {
    id: 'q6', num: '6', cat: 'addsub', marks: 2, methods: ['column'],
    stem: `<p>Write the two missing digits to make this <b>addition</b> correct.</p>
      <table class="colsum">
        <tr><td></td><td>6</td><td>{{th}}</td><td>4</td><td>9</td><td>4</td></tr>
        <tr><td>+</td><td>2</td><td>2</td><td>9</td><td>{{t}}</td><td>5</td></tr>
        <tr class="total"><td></td><td>9</td><td>1</td><td>4</td><td>6</td><td>9</td></tr>
      </table>
      <p class="note">Work along the columns from the right, like the column method.</p>`,
    tasks: [
      {
        id: 't', kind: 'num', inline: true, digit: true, answer: 7, order: 1,
        mistakes: [
          [3, '9 + 3 = 12, which ends in 2, not 6. You need a total ending in 6, so the answer is 16 and you carry 1.', 'ignored the carry pattern'],
          [6, '9 + 6 = 15, which ends in 5. Which number added to 9 makes a total ending in 6?', 'off by one']
        ],
        generic: 'Tens column: 9 + ? must give an answer ending in 6.',
        mini: `<p>Example: in a column, 8 + ? = a number ending in 3.</p><p>8 + 5 = 13. Write the 3 and carry the 1.</p><p>So the missing digit is <b>5</b>.</p>`
      },
      {
        id: 'th', kind: 'num', inline: true, digit: true, answer: 8, order: 2,
        mistakes: [
          [9, 'Don\'t forget the 1 carried over from the hundreds column (4 + 9 + 1 = 14).', 'forgot the carried 1'],
          [7, 'Check the carry: hundreds are 4 + 9 + 1 = 14, so 1 is carried into the thousands.', 'carry error']
        ],
        generic: 'Thousands column: ? + 2 + the carried 1 must give an answer ending in 1.',
        mini: `<p>Example: thousands column ? + 3 + 1 carried = a number ending in 0.</p><p>6 + 3 + 1 = 10. So the missing digit is <b>6</b>.</p>`
      }
    ],
    hints: [
      'Use column addition. Start at the ones column on the right and work left.',
      'Remember to write any carried 1s under the next column. The missing digits are in the tens and the thousands.',
      'Ones: 4 + 5 = 9, which matches. Tens: 9 + ? has to give an answer ending in 6. What do you add to 9 to make 16?'
    ]
  },

  // ---------------- Q7 ----------------
  {
    id: 'q7', num: '7', cat: 'multdiv', marks: 2, methods: ['barmodel', 'tables', 'column'],
    stem: `<p>Ms Kemp has a box of crayons for lunchtime art club.</p>${crayonBox()}
      <p>She has 12 children at the art club.<br>She gives them 12 crayons each.<br>She has 69 crayons left.</p>
      <p>How many crayons were in the box at the start?</p>`,
    tasks: [
      {
        id: 's1', kind: 'num', label: 'Step 1: Crayons given out: 12 × 12 =', answer: 144,
        mistakes: [
          [24, 'You added 12 + 12. Each of the 12 children gets 12, so it\'s 12 lots of 12: multiply.', 'added instead of multiplying'],
          [124, 'Check 12 × 12 again: 10 × 12 = 120 and 2 × 12 = 24. Add them.', 'times table slip'],
          [132, 'That\'s 11 × 12. There are 12 children.', 'times table slip']
        ],
        generic: 'Work out 12 × 12. Try 10 × 12, then 2 × 12, and add.',
        mini: `<p>Example: 5 children get 6 stickers each.</p><p>5 × 6 = <b>30</b> stickers given out.</p>`
      },
      {
        id: 's2', kind: 'num', label: 'Step 2: Add the crayons left: 144 + 69 =', after: 'crayons', answer: 213,
        mistakes: [
          [75, 'She has 69 left after giving crayons out, so the box started with more. Add them, don\'t take away.', 'subtracted instead of adding'],
          [203, 'Check the tens column: 4 + 6 + 1 carried = 11.', 'forgot the carried 1'],
          [113, 'Check the hundreds: 1 + 1 carried = 2.', 'carry error']
        ],
        generic: 'The box at the start held the crayons given out AND the crayons left.',
        mini: `<p>Example: 30 stickers given out and 8 left.</p><p>30 + 8 = <b>38</b> at the start.</p>`
      }
    ],
    hints: [
      'This is a two step problem. A bar model helps you see both parts.',
      `The whole box is made of the crayons given out and the crayons left.${bar('?', [{ label: '12 × 12 given out', w: 2 }, { label: '69 left', w: 1, shade: true }])}`,
      'Step 1: work out how many crayons she gave out altogether. 12 children with 12 each is 12 × 12.'
    ]
  },

  // ---------------- Q8 ----------------
  {
    id: 'q8', num: '8', cat: 'frac', marks: 2, methods: ['numline', 'equivfr'],
    stem: `<p><b>a)</b> The numbers in this sequence <b>increase</b> by the <b>same amount each time</b>.</p>
      <div class="seq">{{a1}}{{a2}}<span class="seqbox">${frac(5, 7)}</span><span class="seqbox">1</span></div>
      <p>{{as}}</p>
      <p><b>b)</b> The numbers in this sequence <b>decrease</b> by the <b>same amount each time</b>.</p>
      <div class="seq"><span class="seqbox">1</span>{{b1}}<span class="seqbox">${frac(4, 8)}</span>{{b2}}</div>
      <p>{{bs}}</p>`,
    tasks: [
      {
        id: 'as', kind: 'frac', den: 7, answer: [2, 7], order: 1, label: 'Step: how much does it go up each time?',
        mistakes: [[[1, 7], 'Write 1 as 7/7. From 5/7 to 7/7 is how many sevenths?', 'step size wrong']],
        generic: 'Change 1 into sevenths: 1 = 7/7. How far is it from 5/7 to 7/7?',
        mini: `<p>Example: ?, ?, 6/9, 1</p><p>1 = 9/9. From 6/9 to 9/9 is a jump of <b>3/9</b>.</p>`
      },
      {
        id: 'a1', kind: 'frac', den: 7, answer: [1, 7], order: 3, inline: true,
        mistakes: [[[2, 7], 'Count back from 3/7 by the step size.', 'counted back wrong']],
        generic: 'Count back from the box after it by the step size.',
        mini: `<p>Example: step 3/9. Going back from 3/9: 3/9 − 3/9 = <b>0/9</b>.</p>`
      },
      {
        id: 'a2', kind: 'frac', den: 7, answer: [3, 7], order: 2, inline: true,
        mistakes: [[[4, 7], 'You went back 1/7. The step is bigger than that.', 'used step of 1']],
        generic: 'Count back from 5/7 by the step size.',
        mini: `<p>Example: step 3/9. Going back from 6/9: 6/9 − 3/9 = <b>3/9</b>.</p>`
      },
      {
        id: 'bs', kind: 'frac', den: 8, answer: [2, 8], order: 4, label: 'Step: how much does it go down each time?',
        mistakes: [[[4, 8], 'That\'s the jump from 1 all the way to 4/8. There\'s a missing box in between, so it\'s two jumps.', 'missed the box in between']],
        generic: 'Write 1 as 8/8. From 8/8 to 4/8 takes two equal jumps.',
        mini: `<p>Example: 1, ?, 4/10</p><p>1 = 10/10. From 10/10 to 4/10 is 6/10 in two equal jumps, so each jump is <b>3/10</b>.</p>`
      },
      {
        id: 'b1', kind: 'frac', den: null, answer: [6, 8], equiv: true, order: 5, inline: true,
        mistakes: [[[7, 8], 'That\'s only 1/8 less than 1. Use the step size you found.', 'used step of 1']],
        generic: 'Start at 8/8 and take away the step.',
        mini: `<p>Example: start at 10/10, step 3/10. 10/10 − 3/10 = <b>7/10</b>.</p>`
      },
      {
        id: 'b2', kind: 'frac', den: null, answer: [2, 8], equiv: true, order: 6, inline: true,
        mistakes: [[[3, 8], 'Use the same step all the way along.', 'step changed']],
        generic: 'Take the step away from 4/8.',
        mini: `<p>Example: 4/10 − 3/10 = <b>1/10</b>.</p>`
      }
    ],
    hints: [
      'Write 1 as a fraction with the same denominator. In sevenths, 1 = 7/7. In eighths, 1 = 8/8.',
      'Picture a number line in sevenths. Count the jumps from 5/7 to 7/7 to find the step.',
      'In part a, 5/7 to 7/7 is a jump of 2/7. Now jump backwards by 2/7 to fill the boxes.'
    ]
  },

  // ---------------- Q9 ----------------
  {
    id: 'q9', num: '9', cat: 'place', marks: 1, methods: ['pvgrid', 'numline'],
    stem: `<p>Write the next two terms in this sequence.</p>
      <p class="big"><b>0.994, &nbsp;0.996, &nbsp;0.998,</b> {{a}} , {{b}}</p>`,
    tasks: [
      {
        id: 'a', kind: 'num', inline: true, answer: 1,
        mistakes: [
          [0.1, '0.998 + 0.002 makes 10 thousandths, which exchanges all the way up to 1 whole. Check it in a place value grid.', 'exchange error'],
          [0.999, 'The sequence goes up by 2 thousandths each time, not 1.', 'step of 0.001'],
        ],
        diagnose: v => (String(v.raw).replace(/\s/g, '') === '0.9910' ? ['After 0.998 you can\'t write 0.9910. 8 thousandths + 2 thousandths = 10 thousandths, which exchanges for 1 hundredth, and so on up.', 'wrote 9910 style'] : null),
        generic: 'Add 0.002 to 0.998. Use a place value grid and exchange.',
        mini: `<p>Example: 0.097, 0.098, 0.099, ?</p><p>Add 0.001: 9 thousandths + 1 thousandth = 10 thousandths = 1 hundredth.</p><p>So the answer is 0.100, which is <b>0.1</b>.</p>`
      },
      {
        id: 'b', kind: 'num', inline: true, answer: 1.002,
        mistakes: [
          [1.2, '1.2 means 1 and 2 tenths. You want 2 thousandths, so 1.002.', 'place value of thousandths'],
          [1.02, '1.02 is 2 hundredths. You want 2 thousandths.', 'place value of thousandths'],
          [1.001, 'Keep the step the same: add 2 thousandths.', 'step of 0.001']
        ],
        generic: 'Add 0.002 to your last answer.',
        mini: `<p>Example: 2 + 0.003 = <b>2.003</b>. The 3 goes in the thousandths, the third place after the decimal point.</p>`
      }
    ],
    hints: [
      'Find the step first. How much does it go up from one number to the next?',
      'Use a place value grid with ones, tenths, hundredths and thousandths. It goes up 2 thousandths each time.',
      '0.998 + 0.002: 8 thousandths + 2 thousandths = 10 thousandths. Exchange 10 thousandths for 1 hundredth, and keep exchanging.'
    ]
  },

  // ---------------- Q10 ----------------
  {
    id: 'q10', num: '10', cat: 'multdiv', marks: 2, methods: ['tables'],
    stem: `<p>Here is a Carroll diagram for sorting numbers.</p>
      <p>Write a number <b>less than 20</b> in each space.</p>
      <table class="carroll">
        <tr><th></th><th>even</th><th>not even</th></tr>
        <tr><th>a prime number</th><td>{{pe}}</td><td>{{po}}</td></tr>
        <tr><th>not a prime number</th><td>{{ne}}</td><td>{{no}}</td></tr>
      </table>`,
    tasks: [
      {
        id: 'pe', kind: 'num', inline: true, check: n => n === 2,
        diagnose: v => {
          const n = v.n;
          if (n >= 20) return ['Use a number less than 20.', 'too big'];
          if (n % 2 !== 0) return ['That number isn\'t even. Even numbers are in the 2 times table.', 'not even'];
          return [`${n} isn't prime: it can be divided by 2 as well as 1 and itself. Is there an even number with only two factors?`, 'thought an even number was prime'];
        },
        generic: 'Find an even number with exactly two factors.',
        mini: `<p>Is 21 prime? 21 = 3 × 7, so <b>no</b>.</p><p>Is 23 prime? Only 1 × 23 makes it, so <b>yes</b>.</p>`
      },
      {
        id: 'po', kind: 'num', inline: true, check: n => n < 20 && isPrime(n) && n % 2 === 1,
        diagnose: v => {
          const n = v.n;
          if (n >= 20) return ['Use a number less than 20.', 'too big'];
          if (n === 1) return ['1 is not a prime number. A prime has exactly two factors, and 1 only has one.', 'thought 1 is prime'];
          if (n % 2 === 0) return ['That number is even. This space needs a number that is not even.', 'even in odd column'];
          return [`${n} isn't prime. Can you find a times table fact that makes ${n}?`, 'odd non prime as prime'];
        },
        generic: 'Find an odd number under 20 that only 1 and itself divide into.',
        mini: `<p>Is 21 prime? 21 = 3 × 7, so <b>no</b>.</p><p>Is 23 prime? Only 1 × 23 makes it, so <b>yes</b>.</p>`
      },
      {
        id: 'ne', kind: 'num', inline: true, check: n => n < 20 && n % 2 === 0 && !isPrime(n),
        diagnose: v => {
          const n = v.n;
          if (n >= 20) return ['Use a number less than 20.', 'too big'];
          if (n === 2) return ['2 is a prime number: only 1 × 2 makes it. Try another even number.', 'thought 2 is not prime'];
          return ['This space needs an even number. Even numbers are in the 2 times table.', 'not even'];
        },
        generic: 'Pick an even number under 20 that is not prime.',
        mini: `<p>Is 8 prime? 8 = 2 × 4, so <b>no</b>, it's not prime. And it's even.</p>`
      },
      {
        id: 'no', kind: 'num', inline: true, check: n => n < 20 && n % 2 === 1 && !isPrime(n),
        diagnose: v => {
          const n = v.n;
          if (n >= 20) return ['Use a number less than 20.', 'too big'];
          if (n % 2 === 0) return ['That number is even. This space needs a number that is not even.', 'even in odd column'];
          return [`${n} is prime, so it can't go in the "not a prime number" row. Look for an odd number in a times table, like the 3 times table.`, 'odd prime as not prime'];
        },
        generic: 'Pick an odd number under 20 that is NOT prime.',
        mini: `<p>Is 25 prime? 25 = 5 × 5, so <b>no</b>. And it's odd, so it would fit here if it were under 20.</p>`
      }
    ],
    hints: [
      'A prime number has exactly two factors: 1 and itself. 1 is not a prime number.',
      'Even numbers are in the 2 times table. Test each number with your times tables to see if it is prime.',
      'Start with the top left space. Try every even number under 20. Which one can only be made by 1 × itself?'
    ]
  },

  // ---------------- Q11 ----------------
  {
    id: 'q11', num: '11', cat: 'multdiv', marks: 1, methods: ['tables'],
    stem: `<p><b>Circle</b> the number that <b>is not</b> a multiple of 6.</p>{{a}}`,
    tasks: [{
      id: 'a', kind: 'choice', pick: 1, layout: 'row',
      options: ['30', '600', '120', '62', '6'], correct: [3],
      wrong: {
        0: ['30 = 6 × 5, so 30 IS a multiple of 6.', 'chose a multiple'],
        1: ['600 = 6 × 100, so 600 IS a multiple of 6.', 'chose a multiple'],
        2: ['120 = 6 × 20, so 120 IS a multiple of 6.', 'chose a multiple'],
        4: ['6 = 6 × 1, so 6 IS a multiple of 6.', 'chose a multiple']
      },
      generic: 'Find the number you can\'t make with 6 × something.',
      mini: `<p>Is 52 a multiple of 4? 4 × 13 = 52, so <b>yes</b>.</p><p>Is 50? 4 × 12 = 48, 4 × 13 = 52. 50 is skipped, so <b>no</b>.</p>`
    }],
    hints: [
      'A multiple of 6 is a number in the 6 times table, even if the table goes on past 12 × 6.',
      'Check each one: can you make it with 6 × something?',
      '600 = 6 × 100 and 120 = 6 × 20. Now check the others, using 6 × 10 = 60 to help.'
    ]
  },

  // ---------------- Q12 ----------------
  {
    id: 'q12', num: '12', cat: 'geom', marks: 1, methods: ['protract'],
    stem: `<p>Measure <b>angle A</b> accurately.</p><p>Use the protractor (angle measurer). Tap the button to put it on.</p>
      {{angle}}<p>angle A = {{a}} °</p>`,
    tasks: [{
      id: 'a', kind: 'num', inline: true, check: n => n >= 73 && n <= 77,
      mistakes: [
        [105, 'Angle A is acute, smaller than a right angle, so it must be less than 90°. You read the other scale.', 'read the wrong scale'],
        [95, 'Angle A is smaller than a right angle (90°). Start from the 0 on the bottom line and read that scale.', 'estimate over 90']
      ],
      diagnose: v => (v.n > 90 ? ['Angle A is acute, smaller than a right angle, so it must be less than 90°. Start from the 0 on the bottom arm.', 'read the wrong scale'] : null),
      generic: 'Start at the 0 on the bottom arm and follow that same scale round to the other arm.',
      mini: `<p>Example: an angle is smaller than a right angle. The two scales show 130 and 50 where the arm crosses.</p><p>It must be less than 90°, so the answer is <b>50°</b>.</p>`
    }],
    hints: [
      'First decide: is angle A smaller or bigger than a right angle (90°)?',
      'Put the protractor\'s centre on the corner and its zero line along the bottom arm. The app does that when you tap the button.',
      'Find the 0 where the bottom arm is. Follow that same row of numbers round until you reach the other arm.'
    ]
  },

  // ---------------- Q13 ----------------
  {
    id: 'q13', num: '13', cat: 'addsub', marks: 1, methods: ['column', 'numline'],
    stem: `<p>The swimmers at Shark Swimming Club are collecting money for charity.</p>
      <p>Their target is to collect £125.</p><p>So far they have collected £32.86</p>
      <p>How <b>much more</b> money do they need to reach their target?</p>`,
    tasks: [{
      id: 'a', kind: 'num', label: '', prefix: '£', answer: 92.14,
      mistakes: [
        [157.86, 'How much more means find the difference, so subtract.', 'added instead of subtracting'],
        [93.14, 'Check your exchanging. £125.00 has zeros in the pence, so you need to exchange from the pounds.', 'exchange error'],
        [92.24, 'Check the tenths column after exchanging.', 'exchange error'],
        [113.86, 'In each column you took the smaller digit from the bigger one. Always take the bottom from the top, and exchange.', 'smaller from bigger'],
        [107.86, 'In each column you took the smaller digit from the bigger one. Always take the bottom from the top, and exchange.', 'smaller from bigger']
      ],
      generic: 'Write £125 as £125.00 and use column subtraction, or count on with a number line.',
      mini: `<p>Example: £50 − £12.35. Count on with a number line:</p><p>£12.35 → £13 is 65p. £13 → £50 is £37.</p><p>Total: £37 + 65p = <b>£37.65</b>.</p>`
    }],
    hints: [
      'How much more means find the difference. You can subtract or count on.',
      'If you use columns, write £125 as £125.00 so the decimal points line up.',
      'Or count on with a number line: from £32.86 up to £33, then up to £100, then up to £125. Add up the jumps.'
    ]
  },

  // ---------------- Q14 ----------------
  {
    id: 'q14', num: '14', cat: 'multdiv', marks: 1, methods: ['tables'],
    stem: `<p>Find two <b>square numbers</b> that total 34.</p><p class="big">{{x}} + {{y}} = 34</p>`,
    tasks: [
      {
        id: 'x', kind: 'num', inline: true, check: n => isSquare(n) && n < 34,
        diagnose: v => (!isSquare(v.n) ? [`${v.n} isn't a square number. A square number is a number times itself, like 3 × 3 = 9.`, 'not a square number'] : null),
        generic: 'Pick a square number less than 34.',
        mini: `<p>Square numbers: 1 × 1 = 1, 2 × 2 = 4, 3 × 3 = 9, 4 × 4 = 16 ...</p>`
      },
      {
        id: 'y', kind: 'num', inline: true, check: (n, all) => isSquare(n) && all.x != null && all.x + n === 34,
        diagnose: (v, all) => {
          if (!isSquare(v.n)) return [`${v.n} isn't a square number. A square number is a number times itself.`, 'not a square number'];
          if (all.x + v.n !== 34) return [`${all.x} + ${v.n} = ${all.x + v.n}, not 34. Try 34 take away your first number. Is that a square?`, 'total not 34'];
          return null;
        },
        generic: 'Both numbers must be square and total 34.',
        mini: `<p>Example: two square numbers that total 20.</p><p>20 − 16 = 4, and 4 = 2 × 2. So <b>16 + 4</b>.</p>`
      }
    ],
    hints: [
      'A square number is a number multiplied by itself: 1 × 1, 2 × 2, 3 × 3 ...',
      'List the square numbers up to 34: 1, 4, 9, 16 ... keep going.',
      'Take each square away from 34 and check if what\'s left is also a square. 34 − 1 = 33. Is 33 a square? No. Try the next one.'
    ]
  },

  // ---------------- Q15 ----------------
  {
    id: 'q15', num: '15', cat: 'multdiv', marks: 2, methods: ['barmodel', 'column', 'shortdiv'],
    stem: `<p>There are 2,199 newspapers in a box.</p><p>Meg takes 324 newspapers out of the box.</p>
      <p>Jamal, Zoe and Jakub share the rest of the newspapers equally.</p><p>How many newspapers does Zoe get?</p>`,
    tasks: [
      {
        id: 's1', kind: 'num', label: 'Step 1: Newspapers left: 2,199 − 324 =', answer: 1875,
        mistakes: [
          [2523, 'Meg takes newspapers OUT of the box, so subtract.', 'added instead of subtracting'],
          [1975, 'Check the hundreds column: 1 − 3 needs an exchange.', 'no exchange'],
          [2875, 'Check the hundreds column: 1 − 3 won\'t go, so exchange 1 thousand for 10 hundreds.', 'no exchange']
        ],
        generic: 'Use column subtraction: 2,199 − 324. Line up the ones.',
        mini: `<p>Example: 1,250 − 430 in columns.</p><p>Ones 0 − 0 = 0. Tens 5 − 3 = 2. Hundreds 2 − 4 won't go: exchange 1 thousand, 12 − 4 = 8. Thousands 0.</p><p>Answer <b>820</b>.</p>`
      },
      {
        id: 's2', kind: 'num', label: 'Step 2: Share between 3: 1,875 ÷ 3 =', after: 'newspapers', answer: 625,
        mistakes: [
          [5625, 'Shared equally means divide, not multiply.', 'multiplied instead of dividing'],
          [468.75, 'Meg has already had hers. Only 3 people share: Jamal, Zoe and Jakub.', 'divided by 4'],
          [615, 'Check short division: 3 into 18 is 6, 3 into 7 is 2 r 1, then 3 into 15 is 5.', 'short division slip'],
          [652, 'Check the order of your digits in short division.', 'short division slip']
        ],
        generic: 'Use short division: 1,875 ÷ 3.',
        mini: `<p>Example: 384 ÷ 4 with short division.</p><p>4 into 3 won't go. 4 into 38 is 9 remainder 2. Carry the 2: 4 into 24 is 6.</p><p>Answer <b>96</b>.</p>`
      }
    ],
    hints: [
      'Two steps: first take away Meg\'s newspapers, then share what\'s left equally.',
      `Bar model: the whole is 2,199. Meg's part is 324. The rest is split into 3 equal parts.${bar('2,199', [{ label: 'Meg 324', shade: true }, { label: 'Jamal' }, { label: 'Zoe' }, { label: 'Jakub' }])}`,
      'Step 1: column subtraction 2,199 − 324. Start with the ones: 9 − 4.'
    ]
  },

  // ---------------- Q16 ----------------
  {
    id: 'q16', num: '16', cat: 'measure', marks: 2, methods: ['barmodel', 'shortdiv'],
    stem: `<p>4 cups of tea cost the same as 5 oat biscuits.</p>
      <div class="pics">${teacups(4)}${biscuits(5)}</div>
      <p>One cup of tea costs £0.50</p><p>How much does one oat biscuit cost?</p>`,
    tasks: [
      {
        id: 's1', kind: 'num', label: 'Step 1: 4 cups of tea cost: 4 × £0.50 =', prefix: '£', answer: 2,
        mistakes: [
          [200, 'That\'s 200p. The box is in pounds, so write £2.00.', 'pence vs pounds'],
          [0.2, '4 lots of 50p is 200p, which is £2.00.', 'decimal place'],
          [4.5, 'Multiply, don\'t add: 4 lots of £0.50.', 'added']
        ],
        generic: 'Count in 50p four times.',
        mini: `<p>Example: 3 pens at £0.40 each.</p><p>3 × 40p = 120p = <b>£1.20</b>.</p>`
      },
      {
        id: 's2', kind: 'num', label: 'Step 2: 1 biscuit: £2.00 ÷ 5 =', prefix: '£', answer: 0.4,
        mistakes: [
          [40, 'That\'s 40p. The box is in pounds, so write £0.40.', 'pence vs pounds'],
          [0.1, 'You divided one cup\'s price. The 5 biscuits cost the same as all 4 cups, £2.00.', 'divided one cup'],
          [10, 'Shared between 5 biscuits means divide, not multiply.', 'multiplied'],
          [0.04, '£2.00 is 200p. 200 ÷ 5 = 40p, which is £0.40.', 'decimal place']
        ],
        generic: 'Change £2.00 into pence (200p) and divide by 5.',
        mini: `<p>Example: 6 rubbers cost £1.20 in total.</p><p>120p ÷ 6 = 20p = <b>£0.20</b> each.</p>`
      }
    ],
    hints: [
      'Two steps. The 4 cups and the 5 biscuits cost the same total amount.',
      `Bar model: one bar for 4 cups, and a bar the same length split into 5 biscuits.${bar('same total', [{ label: 'cup' }, { label: 'cup' }, { label: 'cup' }, { label: 'cup' }])}${bar('same total', [{ label: 'biscuit' }, { label: 'biscuit' }, { label: 'biscuit' }, { label: 'biscuit' }, { label: 'biscuit' }])}`,
      'Step 1: find the cost of 4 cups at 50p each. Count in 50s: 50, 100, 150, 200.'
    ]
  },

  // ---------------- Q17 ----------------
  {
    id: 'q17', num: '17', cat: 'measure', marks: 2, methods: ['pvgrid'],
    stem: `<p>One gram of saffron, a special spice, costs £4.20</p>
      <p>What is the cost of <b>half a kilogram</b> of saffron?</p>`,
    tasks: [
      {
        id: 's1', kind: 'num', label: 'Step 1: Half a kilogram =', after: 'grams', answer: 500,
        mistakes: [
          [50, '1 kg = 1,000 g. Half of 1,000 is 500.', 'kg to g conversion'],
          [0.5, 'That\'s half a kilogram in kilograms. Change it into grams: 1 kg = 1,000 g.', 'did not convert'],
          [1000, 'That\'s a whole kilogram. We need half of it.', 'forgot half']
        ],
        generic: '1 kilogram = 1,000 grams. What is half of that?',
        mini: `<p>Example: a quarter of a kilogram.</p><p>1 kg = 1,000 g. 1,000 ÷ 4 = <b>250 g</b>.</p>`
      },
      {
        id: 's2', kind: 'num', label: 'Step 2: 500 × £4.20 =', prefix: '£', answer: 2100,
        mistakes: [
          [210, 'That\'s 50 × £4.20. Check how many places the digits move when you multiply by 100.', 'place value slip'],
          [21000, 'Too big by 10. Do £4.20 × 100 first, then × 5.', 'place value slip'],
          [2.1, 'Multiplying by 500 makes the price much bigger, not smaller.', 'divided'],
          [504.2, 'Multiply, don\'t add.', 'added']
        ],
        generic: 'Do × 100 first (digits move 2 places left), then × 5.',
        mini: `<p>Example: 300 × £1.50</p><p>£1.50 × 100 = £150 (digits move 2 places left).</p><p>£150 × 3 = <b>£450</b>.</p>`
      }
    ],
    hints: [
      'Change half a kilogram into grams first, because the price is per gram.',
      '1 kg = 1,000 g, so half a kilogram is half of 1,000 grams.',
      'For 500 × £4.20: first do £4.20 × 100 using a place value grid (digits move 2 places left). Then multiply that by 5.'
    ]
  },

  // ---------------- Q18 ----------------
  {
    id: 'q18', num: '18', cat: 'measure', marks: 2, methods: ['pvgrid', 'tables'],
    stem: `<p>A bottle of water contains <b>1.2 litres</b>.</p>${hamster()}
      <p>The hamster drinks <b>50ml</b> of water from the same bottle each day.</p>
      <p>How many days does the bottle of water last?</p>`,
    tasks: [
      {
        id: 's1', kind: 'num', label: 'Step 1: 1.2 litres =', after: 'ml', answer: 1200,
        mistakes: [
          [120, '1 litre = 1,000 ml, so multiply by 1,000: the digits move 3 places, not 2.', 'multiplied by 100'],
          [12, '1 litre = 1,000 ml, so multiply by 1,000: the digits move 3 places.', 'multiplied by 10'],
          [1020, '1.2 litres is 1 litre and 2 tenths of a litre. 2 tenths of 1,000 ml is 200 ml.', 'decimal place value']
        ],
        generic: '1 litre = 1,000 ml. Multiply 1.2 by 1,000.',
        mini: `<p>Example: 2.5 litres in ml.</p><p>2.5 × 1,000: digits move 3 places left = <b>2,500 ml</b>.</p>`
      },
      {
        id: 's2', kind: 'num', label: 'Step 2: 1,200 ÷ 50 =', after: 'days', answer: 24,
        mistakes: [
          [2.4, 'Check your answer: 2.4 × 50 = 120, not 1,200.', 'place value slip'],
          [240, 'Check your answer: 240 × 50 = 12,000, which is too big.', 'place value slip'],
          [60000, 'How many 50s fit into 1,200? That means divide.', 'multiplied']
        ],
        generic: 'How many 50s are in 100? Then how many hundreds in 1,200?',
        mini: `<p>Example: 600 ÷ 50</p><p>There are 2 fifties in every 100. 600 has 6 hundreds, so 6 × 2 = <b>12</b>.</p>`
      }
    ],
    hints: [
      'Make the units the same first. Change litres into millilitres.',
      '1 litre = 1,000 ml. To multiply by 1,000, move the digits 3 places to the left.',
      'Then for 1,200 ÷ 50: there are two 50s in every 100. How many hundreds are in 1,200?'
    ]
  },

  // ---------------- Q19 ----------------
  {
    id: 'q19', num: '19', cat: 'frac', marks: 1, methods: ['equivfr'],
    stem: `<p>Write these fractions in <b>ascending</b> order.</p>
      <p class="note">Tap the fractions in order, smallest first. Tap a box to clear it.</p>{{a}}`,
    tasks: [{
      id: 'a', kind: 'order',
      items: [frac(2, 3), frac(1, 4), frac(5, 12), frac(1, 2)],
      correctOrder: [1, 2, 3, 0],
      judge: ord => {
        if (ord.join() === '0,3,2,1') return ['That\'s largest first. Ascending means smallest first.', 'descending order'];
        if (ord.join() === '3,0,1,2' || ord.join() === '0,1,3,2' || ord.join() === '3,1,0,2') return ['A bigger denominator doesn\'t mean a bigger fraction. Change them all into twelfths to compare.', 'ordered by denominator'];
        return null;
      },
      generic: 'Change them all into twelfths, then compare the numerators.',
      mini: `<p>Example: order 1/2, 3/8, 3/4</p><p>In eighths: 4/8, 3/8, 6/8.</p><p>Smallest first: <b>3/8, 1/2, 3/4</b>.</p>`
    }],
    hints: [
      'Ascending means smallest first.',
      'Use equivalent fractions. Change them all into twelfths so they have the same denominator.',
      '2/3 = 8/12 (multiply the top and the bottom by 4). Now change 1/4 and 1/2 into twelfths.'
    ]
  },

  // ---------------- Q20 ----------------
  {
    id: 'q20', num: '20', cat: 'addsub', marks: 2, methods: ['barmodel', 'column'],
    stem: `<p>At a rugby match there are three different stands for spectators. The number of spectators in the South and West stands is written below.</p>
      <p>The number of spectators in the East stand is missing.</p>
      <table class="datatable"><tr><th>East Stand</th><th>South Stand</th><th>West Stand</th><th>Total</th></tr>
      <tr><td class="shaded"></td><td>1,800</td><td>2,320</td><td>7,626</td></tr></table>
      <p>Using the information in the table, calculate the number of spectators in the East stand.</p>`,
    tasks: [
      {
        id: 's1', kind: 'num', label: 'Step 1: South + West: 1,800 + 2,320 =', answer: 4120,
        mistakes: [
          [4020, 'Check the hundreds column: 8 + 3 = 11. Write 1 and carry 1.', 'forgot the carry'],
          [3120, 'Check the thousands: 1 + 2 + 1 carried = 4.', 'forgot the carry'],
          [520, 'Add the two stands together, don\'t take away.', 'subtracted']
        ],
        generic: 'Add the two stands you know with column addition.',
        mini: `<p>Example: 1,600 + 2,700</p><p>Hundreds: 6 + 7 = 13, write 3 carry 1. Thousands: 1 + 2 + 1 = 4.</p><p>Answer <b>4,300</b>.</p>`
      },
      {
        id: 's2', kind: 'num', label: 'Step 2: Total take away: 7,626 − 4,120 =', answer: 3506,
        mistakes: [
          [11746, 'The total includes all three stands. To find the missing one, take away.', 'added instead of subtracting'],
          [3516, 'Check the tens column: 2 − 2 = 0.', 'column slip'],
          [3606, 'Check the hundreds column: 6 − 1 = 5.', 'column slip']
        ],
        generic: 'Whole take away the parts you know gives the missing part.',
        mini: `<p>Example: total 5,000, known stands add up to 3,200.</p><p>5,000 − 3,200 = <b>1,800</b>.</p>`
      }
    ],
    hints: [
      'The total is all three stands added together. You need to find a missing part.',
      `Bar model: the whole bar is 7,626. Two parts are 1,800 and 2,320.${bar('7,626', [{ label: 'East ?', shade: true, w: 1.6 }, { label: '1,800' }, { label: '2,320', w: 1.2 }])}`,
      'Step 1: add the two stands you know using column addition, starting with the ones.'
    ]
  },

  // ---------------- Q21 ----------------
  {
    id: 'q21', num: '21', cat: 'frac', marks: 1, methods: ['equivfr', 'pvgrid'],
    stem: `<p>Jamal says,</p>${kidSpeaking(`${frac(2, 5)} is the same as 0.4`)}
      <p><b>Explain</b> why he is correct. Build the explanation step by step.</p>`,
    tasks: [
      {
        id: 's1', kind: 'frac', den: 10, answer: [4, 10], label: `Step 1: Change fifths into tenths: ${frac(2, 5)} =`,
        mistakes: [
          [[2, 10], 'You changed the bottom but not the top. 5 × 2 = 10, so do 2 × 2 on the top too.', 'only changed denominator'],
          [[7, 10], 'You added 5 to the top. With equivalent fractions you multiply the top and bottom by the same number.', 'added instead of multiplied']
        ],
        generic: 'What do you multiply 5 by to get 10? Do the same to the top.',
        mini: `<p>Example: 3/5 in tenths.</p><p>5 × 2 = 10, so 3 × 2 = 6. <b>3/5 = 6/10</b>.</p>`
      },
      {
        id: 's2', kind: 'num', label: 'Step 2: 4 tenths as a decimal =', answer: 0.4,
        mistakes: [
          [4, '4 tenths is less than 1 whole. Tenths go in the first place after the decimal point.', 'place value of tenths'],
          [0.04, '0.04 is 4 hundredths. Tenths go in the first place after the decimal point.', 'place value of tenths']
        ],
        generic: 'Tenths are the first place after the decimal point.',
        mini: `<p>Example: 6 tenths = <b>0.6</b>.</p>`
      },
      {
        id: 's3', kind: 'choice', pick: 1, layout: 'col', label: 'Step 3: Which explanation is best?',
        options: [
          '2/5 is the same as 4/10, and 4 tenths is 0.4',
          '2 and 5 make 0.4 if you put them together',
          '0.4 is smaller than 1, and so is 2/5'
        ],
        correct: [0],
        wrong: {
          1: ['That doesn\'t explain it. Use what you found in steps 1 and 2.', 'weak explanation'],
          2: ['Lots of numbers are smaller than 1. Use the equivalent fraction from step 1.', 'weak explanation']
        },
        generic: 'Pick the one that uses equivalent fractions and tenths.',
        mini: `<p>A good explanation shows each step: change the fraction into tenths, then write the tenths as a decimal.</p>`
      }
    ],
    hints: [
      'Use equivalent fractions. Change the fifths into tenths.',
      'To get from 5 to 10 you multiply by 2. Do the same to the numerator.',
      'Then remember: tenths are the first place after the decimal point.'
    ]
  },

  // ---------------- Q22a ----------------
  {
    id: 'q22a', num: '22a', cat: 'frac', marks: 2, methods: ['barmodel', 'shortdiv'],
    stem: `${viking()}<p><b>a)</b> Year 5 went on a school trip to the Jorvik Viking Centre in York.</p>
      <p>${frac(1, 4)} of the 120 people on the trip were adults. How many were children?</p>`,
    tasks: [
      {
        id: 's1', kind: 'num', label: 'Step 1: Adults: ¼ of 120 = 120 ÷ 4 =', answer: 30,
        mistakes: [
          [480, 'To find a quarter, divide by 4, don\'t multiply.', 'multiplied'],
          [60, 'That\'s a half. A quarter means 4 equal parts.', 'found a half'],
          [40, 'That\'s a third. A quarter means 4 equal parts.', 'found a third']
        ],
        generic: 'A quarter means split into 4 equal parts. 120 ÷ 4.',
        mini: `<p>Example: ¼ of 80</p><p>80 ÷ 4 = <b>20</b>.</p>`
      },
      {
        id: 's2', kind: 'num', label: 'Step 2: Children: 120 − 30 =', after: 'children', answer: 90,
        mistakes: [
          [30, '30 is the adults. The question asks for the children.', 'gave the adults'],
          [150, 'The children are the rest of the 120, so take away.', 'added']
        ],
        generic: 'The children are everyone who isn\'t an adult.',
        mini: `<p>Example: 80 people, 20 adults.</p><p>80 − 20 = <b>60</b> children.</p>`
      }
    ],
    hints: [
      'Find the adults first, then work out the rest.',
      `Bar model: 120 split into 4 equal parts. 1 part is adults.${bar('120', [{ label: 'adults', shade: true }, { label: 'children', w: 3 }])}`,
      'Step 1: one quarter of 120 is 120 ÷ 4.'
    ]
  },

  // ---------------- Q22b ----------------
  {
    id: 'q22b', num: '22b', cat: 'measure', marks: 1, methods: ['shortdiv', 'tables'],
    stem: `${viking()}<p>The 120 people on the Year 5 trip visited the Jorvik Viking Centre.</p>
      <p><b>b)</b> Visitors travel around part of the museum in cars. Each car can hold 7 people.</p>
      <p>How many cars would be needed for the Year 5 visit?</p>`,
    tasks: [{
      id: 'a', kind: 'num', label: '', after: 'cars', answer: 18,
      mistakes: [
        [17, '17 cars hold 17 × 7 = 119 people. One person would be left behind! Round up.', 'did not round up remainder'],
        [17.1, 'You can\'t have part of a car. 17 cars leave 1 person behind, so round up.', 'decimal answer to remainder'],
        [840, 'Divide to find how many 7s fit into 120, don\'t multiply.', 'multiplied']
      ],
      diagnose: v => (v.n > 17 && v.n < 18 ? ['You can\'t have part of a car. 17 cars leave someone behind, so round up.', 'decimal answer to remainder'] : null),
      generic: 'Use short division: 120 ÷ 7. Then think about any remainder.',
      mini: `<p>Example: 30 people, 8 in each car.</p><p>30 ÷ 8 = 3 remainder 6. 3 cars leave 6 people behind, so you need <b>4 cars</b>.</p>`
    }],
    hints: [
      'Divide the people into groups of 7. Use short division: 120 ÷ 7.',
      '7 into 12 is 1 remainder 5. Carry the 5. 7 into 50 is ...',
      'You\'ll get a remainder. Think: can those people be left behind? What do you do with them?'
    ]
  }
];

export const byId = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));
