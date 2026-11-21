"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tags = [
      // Programming fundamentals
      {
        titleTm: "Programmirleme",
        titleEn: "Programming",
        titleRu: "Программирование",
      },
      { titleTm: "Algoritmler", titleEn: "Algorithms", titleRu: "Алгоритмы" },
      {
        titleTm: "Maglumatlar gurluşy",
        titleEn: "Data Structures",
        titleRu: "Структуры данных",
      },
      { titleTm: "Üýtgeýänler", titleEn: "Variables", titleRu: "Переменные" },
      {
        titleTm: "Maglumat görnüşleri",
        titleEn: "Data Types",
        titleRu: "Типы данных",
      },
      { titleTm: "Operatorlar", titleEn: "Operators", titleRu: "Операторы" },
      {
        titleTm: "Şertli operatorlar",
        titleEn: "Conditionals",
        titleRu: "Условные операторы",
      },
      { titleTm: "Gaýtalama operatorlary", titleEn: "Loops", titleRu: "Циклы" },
      { titleTm: "Funksiýalar", titleEn: "Functions", titleRu: "Функции" },
      { titleTm: "Gaýtalanma", titleEn: "Recursion", titleRu: "Рекурсия" },
      {
        titleTm: "Modullar we faýllar",
        titleEn: "Modules and Files",
        titleRu: "Модули и файлы",
      },
      {
        titleTm: "Bit amallary",
        titleEn: "Bit Manipulation",
        titleRu: "Битовые операции",
      },

      // Arrays and strings
      { titleTm: "Massiwler", titleEn: "Arrays", titleRu: "Массивы" },
      {
        titleTm: "Köp ölçegli massiwler",
        titleEn: "Multidimensional Arrays",
        titleRu: "Многомерные массивы",
      },
      { titleTm: "Setirler", titleEn: "Strings", titleRu: "Строки" },
      {
        titleTm: "Setirleri işlemek",
        titleEn: "String Processing",
        titleRu: "Обработка строк",
      },
      {
        titleTm: "Prefiks jemleri",
        titleEn: "Prefix Sums",
        titleRu: "Префиксные суммы",
      },
      {
        titleTm: "Süýşýän penjire",
        titleEn: "Sliding Window",
        titleRu: "Скользящее окно",
      },
      {
        titleTm: "Iki görkeziji",
        titleEn: "Two Pointers",
        titleRu: "Два указателя",
      },
      { titleTm: "Submassiwler", titleEn: "Subarrays", titleRu: "Подмассивы" },

      // Searching and sorting
      {
        titleTm: "Gözleg algoritmleri",
        titleEn: "Searching Algorithms",
        titleRu: "Алгоритмы поиска",
      },
      {
        titleTm: "Ikilik gözleg",
        titleEn: "Binary Search",
        titleRu: "Бинарный поиск",
      },
      { titleTm: "Sortlamak", titleEn: "Sorting", titleRu: "Сортировка" },
      {
        titleTm: "Köpürjikli sortlama",
        titleEn: "Bubble Sort",
        titleRu: "Сортировка пузырьком",
      },
      {
        titleTm: "Saýlap sortlamak",
        titleEn: "Selection Sort",
        titleRu: "Сортировка выбором",
      },
      {
        titleTm: "Goýup sortlamak",
        titleEn: "Insertion Sort",
        titleRu: "Сортировка вставками",
      },
      {
        titleTm: "Birleşdirip sortlamak",
        titleEn: "Merge Sort",
        titleRu: "Сортировка слиянием",
      },
      {
        titleTm: "Çalt sortlamak",
        titleEn: "Quick Sort",
        titleRu: "Быстрая сортировка",
      },
      {
        titleTm: "Hasaplap sortlamak",
        titleEn: "Counting Sort",
        titleRu: "Сортировка подсчётом",
      },

      // Mathematics
      { titleTm: "Matematika", titleEn: "Mathematics", titleRu: "Математика" },
      {
        titleTm: "San teoriýasy",
        titleEn: "Number Theory",
        titleRu: "Теория чисел",
      },
      {
        titleTm: "Ýönekeý sanlar",
        titleEn: "Prime Numbers",
        titleRu: "Простые числа",
      },
      {
        titleTm: "Iň uly umumy bölüji",
        titleEn: "Greatest Common Divisor",
        titleRu: "Наибольший общий делитель",
      },
      {
        titleTm: "Modul boýunça arifmetika",
        titleEn: "Modular Arithmetic",
        titleRu: "Модульная арифметика",
      },
      {
        titleTm: "Kombinatorika",
        titleEn: "Combinatorics",
        titleRu: "Комбинаторика",
      },
      {
        titleTm: "Ähtimallyk",
        titleEn: "Probability",
        titleRu: "Теория вероятностей",
      },
      { titleTm: "Geometriýa", titleEn: "Geometry", titleRu: "Геометрия" },
      {
        titleTm: "Koordinatalar geometriýasy",
        titleEn: "Coordinate Geometry",
        titleRu: "Координатная геометрия",
      },

      // Data structures
      {
        titleTm: "Baglanan sanaw",
        titleEn: "Linked List",
        titleRu: "Связный список",
      },
      { titleTm: "Stek", titleEn: "Stack", titleRu: "Стек" },
      { titleTm: "Nobat", titleEn: "Queue", titleRu: "Очередь" },
      { titleTm: "Dek", titleEn: "Deque", titleRu: "Дек" },
      {
        titleTm: "Hash tablisa",
        titleEn: "Hash Table",
        titleRu: "Хеш-таблица",
      },
      { titleTm: "Setir görnüşli sanaw", titleEn: "Set", titleRu: "Множество" },
      {
        titleTm: "Sözlük",
        titleEn: "Map and Dictionary",
        titleRu: "Словарь и отображение",
      },
      {
        titleTm: "Prioritet nobaty",
        titleEn: "Priority Queue",
        titleRu: "Очередь с приоритетом",
      },
      { titleTm: "Heap gurluşy", titleEn: "Heap", titleRu: "Куча" },
      { titleTm: "Trie agajy", titleEn: "Trie", titleRu: "Префиксное дерево" },

      // Trees and graphs
      { titleTm: "Agaçlar", titleEn: "Trees", titleRu: "Деревья" },
      {
        titleTm: "Ikilik agaçlar",
        titleEn: "Binary Trees",
        titleRu: "Бинарные деревья",
      },
      {
        titleTm: "Ikilik gözleg agajy",
        titleEn: "Binary Search Tree",
        titleRu: "Бинарное дерево поиска",
      },
      { titleTm: "Graflar", titleEn: "Graphs", titleRu: "Графы" },
      {
        titleTm: "Grafyň geçilişi",
        titleEn: "Graph Traversal",
        titleRu: "Обход графа",
      },
      {
        titleTm: "Giňlik boýunça gözleg",
        titleEn: "Breadth-First Search",
        titleRu: "Поиск в ширину",
      },
      {
        titleTm: "Çuňluk boýunça gözleg",
        titleEn: "Depth-First Search",
        titleRu: "Поиск в глубину",
      },
      {
        titleTm: "Iň gysga ýol",
        titleEn: "Shortest Path",
        titleRu: "Кратчайший путь",
      },
      {
        titleTm: "Dijkstra algoritmi",
        titleEn: "Dijkstra's Algorithm",
        titleRu: "Алгоритм Дейкстры",
      },
      {
        titleTm: "Topologik sortlama",
        titleEn: "Topological Sorting",
        titleRu: "Топологическая сортировка",
      },
      {
        titleTm: "Minimal ýaýylan agaç",
        titleEn: "Minimum Spanning Tree",
        titleRu: "Минимальное остовное дерево",
      },

      // Optimization and advanced algorithms
      {
        titleTm: "Dinamiki programmirleme",
        titleEn: "Dynamic Programming",
        titleRu: "Динамическое программирование",
      },
      {
        titleTm: "Greedy algoritmler",
        titleEn: "Greedy Algorithms",
        titleRu: "Жадные алгоритмы",
      },
      {
        titleTm: "Yza dolanma usuly",
        titleEn: "Backtracking",
        titleRu: "Поиск с возвратом",
      },
      {
        titleTm: "Böl we çöz",
        titleEn: "Divide and Conquer",
        titleRu: "Разделяй и властвуй",
      },
      {
        titleTm: "Amallaryň çylşyrymlylygy",
        titleEn: "Time Complexity",
        titleRu: "Временная сложность",
      },
      {
        titleTm: "Ýat çylşyrymlylygy",
        titleEn: "Space Complexity",
        titleRu: "Пространственная сложность",
      },
      {
        titleTm: "Bitmask DP",
        titleEn: "Bitmask Dynamic Programming",
        titleRu: "Динамика по битовым маскам",
      },
      {
        titleTm: "Disjoint Set Union",
        titleEn: "Disjoint Set Union",
        titleRu: "Система непересекающихся множеств",
      },
      {
        titleTm: "Fenwick agajy",
        titleEn: "Fenwick Tree",
        titleRu: "Дерево Фенвика",
      },
      {
        titleTm: "Segment agajy",
        titleEn: "Segment Tree",
        titleRu: "Дерево отрезков",
      },

      // Contest preparation
      {
        titleTm: "Bäsleşme meseleleri",
        titleEn: "Contest Problems",
        titleRu: "Задачи соревнований",
      },
      {
        titleTm: "Çalt girizme we çykaryş",
        titleEn: "Fast Input and Output",
        titleRu: "Быстрый ввод и вывод",
      },
      {
        titleTm: "Test ýagdaýlary",
        titleEn: "Test Cases",
        titleRu: "Тестовые случаи",
      },
      {
        titleTm: "Serhet ýagdaýlary",
        titleEn: "Edge Cases",
        titleRu: "Граничные случаи",
      },
      {
        titleTm: "Kod optimizasiýasy",
        titleEn: "Code Optimization",
        titleRu: "Оптимизация кода",
      },
      {
        titleTm: "Ýaryş strategiýasy",
        titleEn: "Contest Strategy",
        titleRu: "Стратегия соревнований",
      },
    ];

    const now = new Date();

    await queryInterface.bulkInsert(
      "tbl_tags",
      tags.map((tag) => ({
        ...tag,
        createdAt: now,
        updatedAt: now,
      })),
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tbl_tags", null, {});
  },
};
