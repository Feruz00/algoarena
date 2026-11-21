"use strict";

const { v4: uuid } = require("uuid");

const SUBTASK_COUNT = 5;
const TESTS_PER_SUBTASK = 40;
const SCORE_PER_SUBTASK = 20;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTestCase(slug, subtaskIndex, testIndex) {
  // Later subtasks use larger input values.
  const level = subtaskIndex + 1;
  const maxN = [10, 100, 1000, 10000, 100000][subtaskIndex];
  const rand = (min, max) => randomInt(min, max);

  const array = (n, min = -100, max = 100) =>
    Array.from({ length: n }, () => rand(min, max));

  let input;
  let output;

  switch (slug) {
    case "sum-two-numbers": {
      const a = rand(-maxN, maxN);
      const b = rand(-maxN, maxN);
      input = `${a} ${b}\n`;
      output = `${a + b}\n`;
      break;
    }

    case "maximum-of-two": {
      const a = rand(-maxN, maxN);
      const b = rand(-maxN, maxN);
      input = `${a} ${b}\n`;
      output = `${Math.max(a, b)}\n`;
      break;
    }

    case "minimum-of-three": {
      const a = rand(-maxN, maxN);
      const b = rand(-maxN, maxN);
      const c = rand(-maxN, maxN);
      input = `${a} ${b} ${c}\n`;
      output = `${Math.min(a, b, c)}\n`;
      break;
    }

    case "even-or-odd": {
      const n = rand(-maxN, maxN);
      input = `${n}\n`;
      output = `${n % 2 === 0 ? "Even" : "Odd"}\n`;
      break;
    }

    case "factorial": {
      const n = rand(0, Math.min(12, level * 3));
      let result = 1;
      for (let i = 2; i <= n; i++) result *= i;
      input = `${n}\n`;
      output = `${result}\n`;
      break;
    }

    case "sum-one-to-n": {
      const n = rand(1, maxN);
      input = `${n}\n`;
      output = `${(n * (n + 1)) / 2}\n`;
      break;
    }

    case "count-digits": {
      const n = rand(1, maxN) * (rand(0, 1) ? 1 : -1);
      input = `${n}\n`;
      output = `${String(Math.abs(n)).length}\n`;
      break;
    }

    case "reverse-digits": {
      const n = rand(0, maxN);
      input = `${n}\n`;
      output = `${Number(String(n).split("").reverse().join(""))}\n`;
      break;
    }

    case "palindrome-number": {
      const n = rand(0, maxN);
      const s = String(n);
      input = `${n}\n`;
      output = `${s === s.split("").reverse().join("") ? "YES" : "NO"}\n`;
      break;
    }

    case "gcd": {
      const a = rand(0, maxN);
      const b = rand(0, maxN);
      let x = a;
      let y = b;
      while (y !== 0) [x, y] = [y, x % y];
      input = `${a} ${b}\n`;
      output = `${x}\n`;
      break;
    }

    case "lcm": {
      const a = rand(1, Math.min(maxN, 10000));
      const b = rand(1, Math.min(maxN, 10000));
      let x = a;
      let y = b;
      while (y !== 0) [x, y] = [y, x % y];
      input = `${a} ${b}\n`;
      output = `${(a / x) * b}\n`;
      break;
    }

    case "is-prime": {
      const n = rand(1, Math.min(maxN, 100000));
      let prime = n >= 2;
      for (let i = 2; i * i <= n && prime; i++) {
        if (n % i === 0) prime = false;
      }
      input = `${n}\n`;
      output = `${prime ? "YES" : "NO"}\n`;
      break;
    }

    case "fibonacci-n": {
      const n = rand(0, Math.min(40, level * 8));
      let a = 0;
      let b = 1;
      for (let i = 0; i < n; i++) [a, b] = [b, a + b];
      input = `${n}\n`;
      output = `${a}\n`;
      break;
    }

    case "array-sum": {
      const n = rand(1, Math.min(maxN, 1000));
      const arr = array(n);
      input = `${n}\n${arr.join(" ")}\n`;
      output = `${arr.reduce((sum, value) => sum + value, 0)}\n`;
      break;
    }

    case "array-maximum": {
      const n = rand(1, Math.min(maxN, 1000));
      const arr = array(n);
      input = `${n}\n${arr.join(" ")}\n`;
      output = `${Math.max(...arr)}\n`;
      break;
    }

    case "count-positive": {
      const n = rand(1, Math.min(maxN, 1000));
      const arr = array(n);
      input = `${n}\n${arr.join(" ")}\n`;
      output = `${arr.filter((value) => value > 0).length}\n`;
      break;
    }

    case "linear-search": {
      const n = rand(1, Math.min(maxN, 1000));
      const arr = array(n);
      const x = testIndex % 2 === 0 ? arr[rand(0, n - 1)] : rand(-200, 200);
      input = `${n}\n${arr.join(" ")}\n${x}\n`;
      output = `${arr.indexOf(x)}\n`;
      break;
    }

    case "sort-array": {
      const n = rand(1, Math.min(maxN, 1000));
      const arr = array(n);
      input = `${n}\n${arr.join(" ")}\n`;
      output = `${arr.sort((a, b) => a - b).join(" ")}\n`;
      break;
    }

    case "string-length": {
      const chars = "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const length = rand(1, Math.min(100, level * 20));
      const s = Array.from(
        { length },
        () => chars[rand(0, chars.length - 1)],
      ).join("");
      input = `${s}\n`;
      output = `${s.length}\n`;
      break;
    }

    case "count-vowels": {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const length = rand(1, Math.min(100, level * 20));
      const s = Array.from(
        { length },
        () => chars[rand(0, chars.length - 1)],
      ).join("");
      input = `${s}\n`;
      output = `${(s.match(/[aeiou]/gi) || []).length}\n`;
      break;
    }

    default:
      throw new Error(`No test generator registered for problem: ${slug}`);
  }

  return { input, expectedOutput: output };
}

const problems = [
  {
    slug: "sum-two-numbers",
    title: ["Iki sany goşmak", "Sum of Two Numbers", "Сумма двух чисел"],
    description: [
      "<p>Iki sany bitin <code>a</code> we <code>b</code> berilýär. Olaryň jemini tapyň.</p>",
      "<p>Given two integers <code>a</code> and <code>b</code>, print their sum.</p>",
      "<p>Даны два целых числа <code>a</code> и <code>b</code>. Выведите их сумму.</p>",
    ],
    difficulty: "beginner",
    tests: [
      "3 4\n",
      "7\n",
      "-5 12\n",
      "7\n",
      "100 250\n",
      "350\n",
      "-9 -8\n",
      "-17\n",
    ],
  },
  {
    slug: "maximum-of-two",
    title: ["Iki sanynyň ulusy", "Maximum of Two", "Максимум двух чисел"],
    description: [
      "<p>Iki sany bitin sanyň ulusyny tapyň.</p>",
      "<p>Find the larger of two integers.</p>",
      "<p>Найдите большее из двух целых чисел.</p>",
    ],
    difficulty: "beginner",
    tests: [
      "8 3\n",
      "8\n",
      "-4 -11\n",
      "-4\n",
      "7 7\n",
      "7\n",
      "100 250\n",
      "250\n",
    ],
  },
  {
    slug: "minimum-of-three",
    title: ["Üç sanynyň kiçisi", "Minimum of Three", "Минимум трёх чисел"],
    description: [
      "<p>Üç sany bitin sanyň iň kiçisini tapyň.</p>",
      "<p>Find the minimum of three integers.</p>",
      "<p>Найдите минимальное из трёх целых чисел.</p>",
    ],
    difficulty: "beginner",
    tests: [
      "3 9 2\n",
      "2\n",
      "-1 -8 4\n",
      "-8\n",
      "7 7 7\n",
      "7\n",
      "100 0 50\n",
      "0\n",
    ],
  },
  {
    slug: "even-or-odd",
    title: ["Jübüt ýa-da täk", "Even or Odd", "Чётное или нечётное"],
    description: [
      "<p>Berlen <code>n</code> sany jübüt bolsa <code>Even</code>, bolmasa <code>Odd</code> çap ediň.</p>",
      "<p>Print <code>Even</code> if <code>n</code> is even; otherwise print <code>Odd</code>.</p>",
      "<p>Выведите <code>Even</code>, если <code>n</code> чётное, иначе выведите <code>Odd</code>.</p>",
    ],
    difficulty: "beginner",
    tests: [
      "6\n",
      "Even\n",
      "-3\n",
      "Odd\n",
      "0\n",
      "Even\n",
      "101\n",
      "Odd\n",
    ],
  },
  {
    slug: "factorial",
    title: ["Faktorial", "Factorial", "Факториал"],
    description: [
      "<p><code>n!</code> faktorialyny hasaplaň. <code>0! = 1</code>.</p>",
      "<p>Calculate <code>n!</code>. Remember that <code>0! = 1</code>.</p>",
      "<p>Вычислите <code>n!</code>. Помните, что <code>0! = 1</code>.</p>",
    ],
    difficulty: "easy",
    tests: ["5\n", "120\n", "0\n", "1\n", "7\n", "5040\n", "1\n", "1\n"],
  },
  {
    slug: "sum-one-to-n",
    title: ["1-den n-e çenli jem", "Sum from 1 to N", "Сумма от 1 до N"],
    description: [
      "<p><code>1 + 2 + ... + n</code> jemini tapyň.</p>",
      "<p>Find the sum <code>1 + 2 + ... + n</code>.</p>",
      "<p>Найдите сумму <code>1 + 2 + ... + n</code>.</p>",
    ],
    difficulty: "beginner",
    tests: ["5\n", "15\n", "1\n", "1\n", "10\n", "55\n", "100\n", "5050\n"],
  },
  {
    slug: "count-digits",
    title: ["San belgileriniň sany", "Count Digits", "Количество цифр"],
    description: [
      "<p>Noldan uly ýa-da deň däl bitin sanyň onluk ýazgysyndaky belgileriň sanyny tapyň. San otrisatel bolup biler.</p>",
      "<p>Count the decimal digits of a nonzero integer. The integer may be negative.</p>",
      "<p>Посчитайте количество цифр в десятичной записи ненулевого целого числа. Число может быть отрицательным.</p>",
    ],
    difficulty: "beginner",
    tests: ["12345\n", "5\n", "-70\n", "2\n", "9\n", "1\n", "100000\n", "6\n"],
  },
  {
    slug: "reverse-digits",
    title: [
      "Sanyň belgilerini tersine öwürmek",
      "Reverse Digits",
      "Переворот числа",
    ],
    description: [
      "<p>Otrisatel däl bitin sanyň belgilerini ters tertipde çap ediň. Başdaky nollar görkezilmeýär.</p>",
      "<p>Reverse the digits of a non-negative integer. Do not print leading zeroes.</p>",
      "<p>Выведите цифры неотрицательного целого числа в обратном порядке. Ведущие нули не выводите.</p>",
    ],
    difficulty: "easy",
    tests: [
      "1234\n",
      "4321\n",
      "1200\n",
      "21\n",
      "7\n",
      "7\n",
      "10005\n",
      "50001\n",
    ],
  },
  {
    slug: "palindrome-number",
    title: ["Palindrom san", "Palindrome Number", "Число-палиндром"],
    description: [
      "<p>San çepden saga we sagdan çepe birmeňzeş okalsa <code>YES</code>, bolmasa <code>NO</code> çap ediň.</p>",
      "<p>Print <code>YES</code> if the number reads the same forward and backward; otherwise print <code>NO</code>.</p>",
      "<p>Выведите <code>YES</code>, если число читается одинаково слева направо и справа налево, иначе <code>NO</code>.</p>",
    ],
    difficulty: "easy",
    tests: [
      "121\n",
      "YES\n",
      "123\n",
      "NO\n",
      "7\n",
      "YES\n",
      "1001\n",
      "YES\n",
    ],
  },
  {
    slug: "gcd",
    title: [
      "Iň uly umumy bölüji",
      "Greatest Common Divisor",
      "Наибольший общий делитель",
    ],
    description: [
      "<p>Iki sany otrisatel däl sanyň iň uly umumy bölüjisini tapyň.</p>",
      "<p>Find the greatest common divisor of two non-negative integers.</p>",
      "<p>Найдите наибольший общий делитель двух неотрицательных целых чисел.</p>",
    ],
    difficulty: "easy",
    tests: [
      "12 18\n",
      "6\n",
      "7 0\n",
      "7\n",
      "100 35\n",
      "5\n",
      "17 19\n",
      "1\n",
    ],
  },
  {
    slug: "lcm",
    title: [
      "Iň kiçi umumy kratny",
      "Least Common Multiple",
      "Наименьшее общее кратное",
    ],
    description: [
      "<p>Iki sany položitel bitin sanyň iň kiçi umumy kratnysyny tapyň.</p>",
      "<p>Find the least common multiple of two positive integers.</p>",
      "<p>Найдите наименьшее общее кратное двух положительных целых чисел.</p>",
    ],
    difficulty: "easy",
    tests: [
      "4 6\n",
      "12\n",
      "5 7\n",
      "35\n",
      "12 18\n",
      "36\n",
      "9 9\n",
      "9\n",
    ],
  },
  {
    slug: "is-prime",
    title: ["Ýönekeý san", "Prime Number", "Простое число"],
    description: [
      "<p><code>n</code> ýönekeý san bolsa <code>YES</code>, bolmasa <code>NO</code> çap ediň.</p>",
      "<p>Print <code>YES</code> if <code>n</code> is prime; otherwise print <code>NO</code>.</p>",
      "<p>Выведите <code>YES</code>, если <code>n</code> простое, иначе <code>NO</code>.</p>",
    ],
    difficulty: "easy",
    tests: ["7\n", "YES\n", "12\n", "NO\n", "2\n", "YES\n", "1\n", "NO\n"],
  },
  {
    slug: "fibonacci-n",
    title: [
      "Fibonacciniň n-nji agzasy",
      "Nth Fibonacci Number",
      "Число Фибоначчи",
    ],
    description: [
      "<p><code>F0=0</code>, <code>F1=1</code>. Berlen <code>n</code> üçin <code>Fn</code> tapyň.</p>",
      "<p>Given <code>F0=0</code>, <code>F1=1</code>, find <code>Fn</code>.</p>",
      "<p>Дано <code>F0=0</code>, <code>F1=1</code>. Найдите <code>Fn</code>.</p>",
    ],
    difficulty: "easy",
    tests: ["6\n", "8\n", "0\n", "0\n", "10\n", "55\n", "1\n", "1\n"],
  },
  {
    slug: "array-sum",
    title: ["Massiwiň jemi", "Array Sum", "Сумма массива"],
    description: [
      "<p>Ilki <code>n</code>, soňra <code>n</code> sany bitin san berilýär. Olaryň jemini tapyň.</p>",
      "<p>Given <code>n</code> followed by <code>n</code> integers, print their sum.</p>",
      "<p>Дано число <code>n</code>, затем <code>n</code> целых чисел. Выведите их сумму.</p>",
    ],
    difficulty: "beginner",
    tests: [
      "4\n1 2 3 4\n",
      "10\n",
      "3\n-1 5 2\n",
      "6\n",
      "1\n99\n",
      "99\n",
      "5\n10 0 -10 20 1\n",
      "21\n",
    ],
  },
  {
    slug: "array-maximum",
    title: ["Massiwiň maksimumy", "Array Maximum", "Максимум массива"],
    description: [
      "<p><code>n</code> sany bitin san berilýär. Iň ulusyny tapyň.</p>",
      "<p>Given <code>n</code> integers, find the maximum.</p>",
      "<p>Даны <code>n</code> целых чисел. Найдите максимальное.</p>",
    ],
    difficulty: "beginner",
    tests: [
      "4\n1 8 3 2\n",
      "8\n",
      "3\n-7 -2 -9\n",
      "-2\n",
      "1\n42\n",
      "42\n",
      "5\n0 100 99 2 1\n",
      "100\n",
    ],
  },
  {
    slug: "count-positive",
    title: [
      "Položitel sanlaryň sany",
      "Count Positive Numbers",
      "Количество положительных чисел",
    ],
    description: [
      "<p><code>n</code> sany bitin san berilýär. Olaryň içindäki položitel sanlaryň sanyny tapyň.</p>",
      "<p>Given <code>n</code> integers, count how many are positive.</p>",
      "<p>Даны <code>n</code> целых чисел. Посчитайте количество положительных.</p>",
    ],
    difficulty: "beginner",
    tests: [
      "5\n-1 2 0 3 -4\n",
      "2\n",
      "3\n1 2 3\n",
      "3\n",
      "4\n0 -1 0 -2\n",
      "0\n",
      "1\n10\n",
      "1\n",
    ],
  },
  {
    slug: "linear-search",
    title: ["Çyzykly gözleg", "Linear Search", "Линейный поиск"],
    description: [
      "<p>Ilki <code>n</code> we <code>n</code> sany san, soňra <code>x</code> berilýär. <code>x</code>-iň 0-dan başlanýan ilkinji indeksini çap ediň; tapylmasa <code>-1</code>.</p>",
      "<p>Given <code>n</code>, an array of <code>n</code> integers, and then <code>x</code>, print the zero-based index of its first occurrence, or <code>-1</code> if absent.</p>",
      "<p>Даны <code>n</code>, массив из <code>n</code> чисел и число <code>x</code>. Выведите индекс первого вхождения с нуля или <code>-1</code>, если числа нет.</p>",
    ],
    difficulty: "easy",
    tests: [
      "5\n4 8 2 8 1\n8\n",
      "1\n",
      "3\n1 2 3\n9\n",
      "-1\n",
      "1\n5\n5\n",
      "0\n",
      "4\n7 7 7 7\n7\n",
      "0\n",
    ],
  },
  {
    slug: "sort-array",
    title: ["Massiwi tertiplemek", "Sort an Array", "Сортировка массива"],
    description: [
      "<p><code>n</code> sany bitin sany artýan tertipde çap ediň.</p>",
      "<p>Print the given <code>n</code> integers in ascending order.</p>",
      "<p>Выведите данные <code>n</code> целых чисел в порядке возрастания.</p>",
    ],
    difficulty: "easy",
    tests: [
      "5\n4 1 3 2 5\n",
      "1 2 3 4 5\n",
      "3\n9 -1 0\n",
      "-1 0 9\n",
      "1\n7\n",
      "7\n",
      "4\n2 2 1 1\n",
      "1 1 2 2\n",
    ],
  },
  {
    slug: "string-length",
    title: ["Setiriň uzynlygy", "String Length", "Длина строки"],
    description: [
      "<p>Boş däl bir setir berilýär. Boşluklary hem hasaba alyp, onuň nyşanlarynyň sanyny çap ediň.</p>",
      "<p>Given a non-empty line, print its length including spaces.</p>",
      "<p>Дана непустая строка. Выведите её длину, включая пробелы.</p>",
    ],
    difficulty: "beginner",
    tests: [
      "hello\n",
      "5\n",
      "online judge\n",
      "12\n",
      "a\n",
      "1\n",
      "Hello World\n",
      "11\n",
    ],
  },
  {
    slug: "count-vowels",
    title: ["Sesli harplaryň sany", "Count Vowels", "Количество гласных"],
    description: [
      "<p>Latyn harplaryndan düzülen setirde <code>a, e, i, o, u</code> sesli harplarynyň sanyny tapyň. Uly harplar hem hasaba alynýar.</p>",
      "<p>Count the vowels <code>a, e, i, o, u</code> in a Latin-letter string. Uppercase vowels also count.</p>",
      "<p>Посчитайте гласные <code>a, e, i, o, u</code> в строке из латинских букв. Заглавные гласные тоже учитываются.</p>",
    ],
    difficulty: "beginner",
    tests: [
      "education\n",
      "5\n",
      "Sky\n",
      "0\n",
      "AEIOU\n",
      "5\n",
      "Programming\n",
      "3\n",
    ],
  },
];

const names = ["Mesele", "Problem", "Задача "];

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const createProblem = async (p) => {
      await queryInterface.bulkInsert("tbl_problems", [
        {
          slug: p.slug,
          priority: p.priority,
          titleTm: p.title[0],
          titleEn: p.title[1],
          titleRu: p.title[2],
          descriptionTm: p.description[0],
          descriptionEn: p.description[1],
          descriptionRu: p.description[2],
          inputDescriptionTm:
            "Giriş maglumatlary mesele şertinde görkezilen tertipde berilýär.",
          inputDescriptionEn:
            "Input is provided in the order described in the statement.",
          inputDescriptionRu:
            "Входные данные задаются в порядке, указанном в условии.",
          outputDescriptionTm: "Jogaby bir setirde çap ediň.",
          outputDescriptionEn: "Print the answer on one line.",
          outputDescriptionRu: "Выведите ответ в одной строке.",

          noteTm: "Jogaby bir setirde çap ediň.",
          noteEn: "Print the answer on one line.",
          noteRu: "Выведите ответ в одной строке.",

          timeLimitMs: 1000,
          memoryLimitMb: 256,
          difficulty: p.difficulty,
          status: p.status,

          type: p.type,
          contestId: p.contestId ?? null,
          sourceId: p.sourceId ?? null,

          order: p.order ?? 1,
          checkerType:
            p.checkerType ??
            (p.problemSlug === "sum-two-numbers" ? "exact" : "tokens"),

          createdAt: now,
          updatedAt: now,
        },
      ]);
      const problemRows = await queryInterface.sequelize.query(
        "SELECT id FROM tbl_problems WHERE slug = :slug",
        { replacements: { slug: p.slug }, type: Sequelize.QueryTypes.SELECT },
      );
      const problemId = problemRows[0].id;
      const groups = [];

      for (let i = 0; i < SUBTASK_COUNT; i++) {
        groups.push({
          problemId,
          name: `Subtask ${i + 1}`,
          order: i + 1,
          dependsOn: JSON.stringify([]),
          score: SCORE_PER_SUBTASK,
          createdAt: now,
          updatedAt: now,
        });
      }

      await queryInterface.bulkInsert("tbl_test_groups", groups);

      const groupRows = await queryInterface.sequelize.query(
        `SELECT id, name, \`order\`
   FROM tbl_test_groups
   WHERE problemId = :problemId
   ORDER BY \`order\` ASC`,
        {
          replacements: { problemId },
          type: Sequelize.QueryTypes.SELECT,
        },
      );

      const cases = [];

      for (let subtaskIndex = 0; subtaskIndex < SUBTASK_COUNT; subtaskIndex++) {
        const group = groupRows[subtaskIndex];

        for (let testIndex = 0; testIndex < TESTS_PER_SUBTASK; testIndex++) {
          let test;

          // Keep the original first example as a sample when available.
          if (subtaskIndex === 0 && testIndex === 0 && p.tests?.length >= 2) {
            test = {
              input: p.tests[0],
              expectedOutput: p.tests[1],
            };
          } else {
            test = generateTestCase(p.problemSlug, subtaskIndex, testIndex);
          }

          cases.push({
            groupId: group.id,
            input: test.input,
            expectedOutput: test.expectedOutput,
            order: testIndex + 1,
            isSample: subtaskIndex === 0 && testIndex === 0,
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      await queryInterface.bulkInsert("tbl_test_cases", cases);
    };

    const contestProblems = [];
    let t = 0;
    let pr = 1;
    for (let contestId = 1; contestId <= 25; contestId++) {
      const lenProblem = problems.length;
      let k = 3;
      if (contestId > 18) k = 5;
      let num = 1;
      while (k--) {
        const template = problems[Math.floor(Math.random() * lenProblem)];
        const p = {
          ...template,
          problemSlug: template.slug,
          slug: uuid(),
        };
        p.priority = pr;
        pr++;
        p.status =
          contestId % 3 === 0 || [23, 24, 25].includes(contestId)
            ? "deactive"
            : "active";
        ++t;
        let knames = names.map((row) => `${row} ${t}`);
        p.title = knames;
        p.type = contestId <= 18 ? "hidden" : "contest";
        p.contestId = contestId;
        p.order = num;
        num++;
        await createProblem(p);
      }
    }

    for (let sourceId = 7; sourceId <= 38; sourceId++) {
      const lenProblem = problems.length;
      let k = 3;
      let num = 3;
      while (k--) {
        const template = problems[Math.floor(Math.random() * lenProblem)];
        const p = {
          ...template,
          problemSlug: template.slug,
          slug: uuid(),
        };

        p.priority = pr;
        pr++;
        p.status = "active";
        p.type = "source";
        p.order = num;
        num++;
        p.sourceId = sourceId;
        await createProblem(p);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("tbl_problems", {});
  },
};
