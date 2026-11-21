"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    /*
     * Helper for creating a source.
     *
     * parentId is resolved after the initial records are created.
     * This makes the seed much easier to read than hard-coding IDs.
     */

    const makeSubtitle = (theory) => {
      if (typeof theory !== "string" || !theory.trim()) {
        return null;
      }

      const cleanTheory = theory.replace(/\s+/g, " ").trim();
      const firstSentence = cleanTheory.match(/^.*?[.!?](?=\s|$)/);

      return (firstSentence ? firstSentence[0] : cleanTheory).trim();
    };
    const source = (
      titleEn,
      titleTm,
      titleRu,
      theoryEn = null,
      theoryTm = null,
      theoryRu = null,
      parentKey = null,
    ) => ({
      key: parentKey
        ? `${parentKey}:${titleEn.toLowerCase().replace(/\s+/g, "-")}`
        : titleEn.toLowerCase().replace(/\s+/g, "-"),

      titleEn,
      titleTm,
      titleRu,

      theoryEn,
      theoryTm,
      theoryRu,

      parentKey,

      subTitleEn: makeSubtitle(theoryEn),
      subTitleTm: makeSubtitle(theoryTm),
      subTitleRu: makeSubtitle(theoryRu),

      createdAt: now,
      updatedAt: now,
    });

    const programming = source(
      "Programming",
      "Programmirleme",
      "Программирование",
      `
        Programming is the process of designing algorithms and expressing
        them in a programming language so that a computer can execute them.
        Fundamental programming concepts include data types, variables,
        expressions, conditions, loops, functions and data structures.
      `,
      `
        Programmirleme — algoritmleri taýýarlamak we olary kompýuteriň
        ýerine ýetirip bilmegi üçin programmirleme dilinde beýan etmek
        prosesidir. Esasy düşünjelere maglumat görnüşleri, üýtgeýänler,
        aňlatmalar, şertler, sikller, funksiýalar we maglumat gurluşlary degişlidir.
      `,
      `
        Программирование — это процесс разработки алгоритмов и их записи
        на языке программирования для выполнения компьютером. Основные
        понятия включают типы данных, переменные, выражения, условия,
        циклы, функции и структуры данных.
      `,
    );

    const programmingKey = programming.key;

    const programmingChildren = [
      source(
        "Data Types",
        "Maglumat görnüşleri",
        "Типы данных",
        `
          A data type determines what kind of value a variable can store
          and what operations can be performed on that value. Common types
          include integers, floating-point numbers, characters, strings
          and boolean values.
        `,
        `
          Maglumat görnüşi üýtgeýjiniň nähili bahany saklap bilýändigini
          we şol baha bilen nähili amallaryň ýerine ýetirilýändigini kesgitleýär.
          Esasy görnüşlere bitin sanlar, hakyky sanlar, simwollar,
          setirler we boolean bahalar degişlidir.
        `,
        `
          Тип данных определяет вид значения, которое может хранить
          переменная, и допустимые операции над ним. Основные типы:
          целые числа, вещественные числа, символы, строки и логические значения.
        `,
        programmingKey,
      ),

      source(
        "Variables and Constants",
        "Üýtgeýänler we hemişelikler",
        "Переменные и константы",
        `
          A variable represents a named storage location whose value can
          change during program execution. A constant represents a value
          that should not change after it has been defined.
        `,
        `
          Üýtgeýän — programmanyň ýerine ýetirilişinde bahasy üýtgäp bilýän
          atlandyrylan maglumat ýeridir. Hemişelik bolsa kesgitlenenden soň
          üýtgemeýän bahany aňladýar.
        `,
        `
          Переменная представляет именованную область памяти, значение
          которой может изменяться во время выполнения программы.
          Константа хранит значение, которое не должно изменяться.
        `,
        programmingKey,
      ),

      source(
        "Expressions and Operators",
        "Aňlatmalar we operatorlar",
        "Выражения и операторы",
        `
          Expressions combine values, variables and operators to produce
          another value. Arithmetic, comparison and logical operators are
          fundamental tools for constructing program logic.
        `,
        `
          Aňlatmalar bahalary, üýtgeýänleri we operatorlary birleşdirip,
          täze baha döredýär. Arifmetiki, deňeşdirme we logiki operatorlar
          programmirleme logikasynyň esasy bölekleridir.
        `,
        `
          Выражения объединяют значения, переменные и операторы для
          получения нового значения. Основными являются арифметические,
          операции сравнения и логические операции.
        `,
        programmingKey,
      ),

      source(
        "If / Else",
        "If / Else şertleri",
        "Условия If / Else",
        `
          Conditional statements allow a program to choose different
          execution paths depending on whether a condition is true or false.
          The most common forms are if, if-else and multiple conditional branches.
        `,
        `
          Şert operatorlary şertiniň dogry ýa-da nädogry bolmagyna baglylykda
          programmanyň dürli ugurlar boýunça işlemegine mümkinçilik berýär.
          Iň köp ulanylýan görnüşleri if, if-else we birnäçe şertli şahalanmalardyr.
        `,
        `
          Условные операторы позволяют программе выбирать разные пути
          выполнения в зависимости от истинности условия. Основные формы:
          if, if-else и несколько последовательных условий.
        `,
        programmingKey,
      ),

      source(
        "For Loop",
        "For sikli",
        "Цикл For",
        `
          A for loop is commonly used when the number or sequence of
          iterations is known in advance. It is useful for processing
          arrays, ranges and other ordered collections.
        `,
        `
          For sikli gaýtalanmalaryň sany ýa-da aralygy öňünden belli bolanda
          amatlydyr. Ol massiwleri, san aralyklaryny we beýleki yzygiderli
          maglumatlary işlemekde giňden ulanylýar.
        `,
        `
          Цикл for применяется, когда количество или последовательность
          итераций известны заранее. Он особенно удобен для обработки
          массивов, диапазонов и упорядоченных коллекций.
        `,
        programmingKey,
      ),

      source(
        "While Loop",
        "While sikli",
        "Цикл While",
        `
          A while loop repeatedly executes a block of code while its
          condition remains true. It is useful when the number of iterations
          cannot be determined before execution.
        `,
        `
          While sikli şert dogry bolýança kod bölegini gaýtalap ýerine ýetirýär.
          Gaýtalanmalaryň sany öňünden belli bolmadyk ýagdaýlarda has amatlydyr.
        `,
        `
          Цикл while повторяет выполнение блока кода, пока условие остается
          истинным. Он удобен, когда число итераций заранее неизвестно.
        `,
        programmingKey,
      ),

      source(
        "Functions",
        "Funksiýalar",
        "Функции",
        `
          A function is a reusable block of code that performs a particular
          operation. Functions improve program structure, readability and
          reduce repeated code.
        `,
        `
          Funksiýa belli bir işi ýerine ýetirýän we gaýtadan ulanyp bolýan
          kod bölegidir. Funksiýalar programmanyň gurluşyny we okalmagyny
          gowulandyrýar hem-de gaýtalanýan kody azaltmaga kömek edýär.
        `,
        `
          Функция — повторно используемый блок кода, выполняющий определённую
          задачу. Функции улучшают структуру программы и уменьшают дублирование.
        `,
        programmingKey,
      ),

      source(
        "Recursion",
        "Rekursiýa",
        "Рекурсия",
        `
          Recursion is a technique in which a function calls itself to solve
          a smaller instance of the same problem. A correct recursive solution
          must contain a base case that stops further calls.
        `,
        `
          Rekursiýa funksiýanyň şol bir meseläniň kiçeldilen görnüşini çözmek
          üçin özüni özi çagyrýan usulydyr. Dogry rekursiw algoritm hökmany
          ýagdaýda çagyryşlaryň dowam etmegini bes edýän başlangyç şerti özünde saklamalydyr.
        `,
        `
          Рекурсия — это метод, при котором функция вызывает саму себя для
          решения уменьшенной версии той же задачи. Рекурсивный алгоритм
          должен иметь базовый случай, останавливающий дальнейшие вызовы.
        `,
        programmingKey,
      ),
    ];

    /*
     * ---------------------------------------------------------
     * 2. ALGORITHMS
     * ---------------------------------------------------------
     */

    const algorithms = source(
      "Algorithms",
      "Algoritmler",
      "Алгоритмы",
      `
        An algorithm is a finite sequence of well-defined operations that
        solves a problem or performs a computation. Important algorithmic
        characteristics include correctness, termination and efficiency.
      `,
      `
        Algoritm meseläni çözmek ýa-da hasaplamany ýerine ýetirmek üçin
        kesgitli amallaryň soňlu-solsuz däl yzygiderliligidir. Algoritmiň
        dogrulygy, tamamlanmagy we netijeliligi möhüm häsiýetlerdir.
      `,
      `
        Алгоритм — конечная последовательность точно определённых действий,
        предназначенная для решения задачи. Важными характеристиками являются
        корректность, завершение и эффективность.
      `,
    );

    const algorithmsKey = algorithms.key;

    const algorithmChildren = [
      source(
        "Algorithm Complexity",
        "Algoritmiň çylşyrymlylygy",
        "Сложность алгоритма",
        `
          Algorithm complexity describes how the required resources change
          as the input size grows. Time complexity and space complexity are
          commonly expressed using asymptotic notation such as O(n), O(log n)
          and O(n²).
        `,
        `
          Algoritmiň çylşyrymlylygy giriş maglumatlarynyň göwrümi ulaldygyça
          gerek bolan resurslaryň nähili üýtgeýändigini görkezýär. Wagtyň we
          ýadyň çylşyrymlylygy köplenç O(n), O(log n), O(n²) ýaly bellikler
          bilen aňladylýar.
        `,
        `
          Сложность алгоритма показывает, как изменяются необходимые ресурсы
          при увеличении размера входных данных. Обычно используются оценки
          времени и памяти, например O(n), O(log n) и O(n²).
        `,
        algorithmsKey,
      ),

      source(
        "Linear Search",
        "Çyzykly gözleg",
        "Линейный поиск",
        `
          Linear search examines elements one by one until the requested
          value is found or the collection is exhausted. Its worst-case
          time complexity is O(n).
        `,
        `
          Çyzykly gözleg elementleri biri-birden barlaýar we gözlenýän baha
          tapylýança ýa-da ähli elementler gutarýança dowam edýär. Iň erbet
          ýagdaýdaky wagt çylşyrymlylygy O(n)-dir.
        `,
        `
          Линейный поиск последовательно проверяет элементы до нахождения
          нужного значения или окончания коллекции. В худшем случае его
          временная сложность составляет O(n).
        `,
        algorithmsKey,
      ),

      source(
        "Binary Search",
        "Ikilik gözleg",
        "Двоичный поиск",
        `
          Binary search works on a sorted collection. At each step it compares
          the target with the middle element and eliminates approximately half
          of the remaining search interval. Its complexity is O(log n).
        `,
        `
          Ikilik gözleg tertiplenen maglumat toplumynda ulanylýar. Her ädimde
          gözlenýän baha orta element bilen deňeşdirilýär we gözleg aralygynyň
          takmynan ýarysy aýrylýar. Çylşyrymlylygy O(log n)-dir.
        `,
        `
          Двоичный поиск работает с отсортированной последовательностью.
          На каждом шаге сравнивается средний элемент, после чего половина
          диапазона отбрасывается. Сложность составляет O(log n).
        `,
        algorithmsKey,
      ),

      source(
        "Sorting Algorithms",
        "Tertipleýiş algoritmleri",
        "Алгоритмы сортировки",
        `
          Sorting algorithms arrange elements according to a chosen ordering.
          Classical algorithms include bubble sort, selection sort, insertion
          sort, merge sort and quicksort.
        `,
        `
          Tertipleýiş algoritmleri elementleri belli bir tertibe ýerleşdirýär.
          Esasy nusgawy algoritmlere köpürjikli sort, saýlama sorty,
          goşma sort, birleşdirme sorty we çalt sort degişlidir.
        `,
        `
          Алгоритмы сортировки располагают элементы в заданном порядке.
          Классические методы включают пузырьковую сортировку, сортировку
          выбором, вставками, слиянием и быструю сортировку.
        `,
        algorithmsKey,
      ),

      source(
        "Greedy Algorithms",
        "Açgöz algoritmler",
        "Жадные алгоритмы",
        `
          A greedy algorithm constructs a solution by repeatedly choosing
          the locally best available option. Greedy methods are correct only
          for problems where the local choices lead to a globally optimal solution.
        `,
        `
          Açgöz algoritm her ädimde şol pursat üçin iň amatly saýlawy edip,
          çözgüdi tapgyrlaýyn gurýar. Bu çemeleşme diňe ýerli iň gowy saýlawlaryň
          umumy optimal çözgüde getirýän meselelerinde dogry işleýär.
        `,
        `
          Жадный алгоритм строит решение, каждый раз выбирая локально наиболее
          выгодный вариант. Такой подход корректен не для всех задач, а только
          для задач с соответствующими свойствами оптимальности.
        `,
        algorithmsKey,
      ),
    ];

    /*
     * ---------------------------------------------------------
     * 3. GRAPH THEORY
     * ---------------------------------------------------------
     */

    const graphTheory = source(
      "Graph Theory",
      "Graf teoriýasy",
      "Теория графов",
      `
        Graph theory studies mathematical structures consisting of vertices
        and edges. Graphs are widely used to model networks, relationships,
        roads, dependencies and many other systems.
      `,
      `
        Graf teoriýasy depelerden we gapyrgalardan ybarat matematiki gurluşlary
        öwrenýär. Graflar torlary, gatnaşyklary, ýollary, baglylyklary we başga
        köp ulgamlary modelirlemek üçin ulanylýar.
      `,
      `
        Теория графов изучает математические структуры, состоящие из вершин
        и рёбер. Графы применяются для моделирования сетей, связей, дорог,
        зависимостей и других систем.
      `,
    );

    const graphKey = graphTheory.key;

    const graphChildren = [
      source(
        "Graph Representation",
        "Graflaryň görkezilişi",
        "Представление графов",
        `
          A graph can be represented using an adjacency matrix, adjacency
          list or an edge list. The choice depends on graph density and the
          operations required by the algorithm.
        `,
        `
          Graf goňşulyk matrisasy, goňşulyk sanawy ýa-da gapyrgalar sanawy
          görnüşinde görkezilip bilner. Görnüşi saýlamak grafa we ýerine
          ýetiriljek amallara baglydyr.
        `,
        `
          Граф можно представить матрицей смежности, списком смежности
          или списком рёбер. Выбор структуры зависит от плотности графа
          и требуемых операций.
        `,
        graphKey,
      ),

      source(
        "Breadth-First Search (BFS)",
        "Giňişleýin gözleg (BFS)",
        "Поиск в ширину (BFS)",
        `
          Breadth-first search explores a graph level by level. Starting
          from a selected vertex, it first visits nearby vertices and then
          continues to the next levels. A queue is commonly used to implement BFS.
        `,
        `
          Giňişleýin gözleg grafa derejeler boýunça seredýär. Saýlanan
          depeden başlanýar, ilki golaý depeler öwrenilýär, soňra indiki
          derejelere geçilýär. BFS üçin köplenç nobat (queue) ulanylýar.
        `,
        `
          Поиск в ширину исследует граф по уровням. Начиная с выбранной
          вершины, алгоритм сначала посещает ближайшие вершины, а затем
          переходит к следующим уровням. Обычно используется очередь.
        `,
        graphKey,
      ),

      source(
        "Depth-First Search (DFS)",
        "Çuňluk boýunça gözleg (DFS)",
        "Поиск в глубину (DFS)",
        `
          Depth-first search explores one path as deeply as possible before
          backtracking. DFS can be implemented recursively or with an explicit
          stack.
        `,
        `
          Çuňluk boýunça gözleg bir ugur boýunça mümkin boldugyça çuňlaşýar
          we soňra yza gaýdýar. DFS rekursiýa ýa-da aç-açan stack arkaly amala
          aşyrylyp bilner.
        `,
        `
          Поиск в глубину исследует один путь максимально глубоко, после чего
          выполняет возврат. DFS можно реализовать рекурсивно или с помощью стека.
        `,
        graphKey,
      ),

      source(
        "Shortest Path",
        "Iň gysga ýol",
        "Кратчайший путь",
        `
          Shortest-path algorithms find a minimum-cost path between vertices.
          Dijkstra's algorithm is suitable for graphs with non-negative edge
          weights, while other algorithms are used for different graph types.
        `,
        `
          Iň gysga ýol algoritmleri depeleriň arasynda iň az bahaly ýoly tapýar.
          Dijkstra algoritmi otrisatel däl gapyrga agramlary bolan graflarda
          ulanylýar.
        `,
        `
          Алгоритмы кратчайшего пути находят путь минимальной стоимости между
          вершинами. Алгоритм Дейкстры применяется в графах с неотрицательными
          весами рёбер.
        `,
        graphKey,
      ),

      source(
        "Topological Sorting",
        "Topologiki tertipleme",
        "Топологическая сортировка",
        `
          Topological sorting produces an ordering of vertices in a directed
          acyclic graph such that every directed edge goes from an earlier
          vertex to a later vertex. It is useful for dependency scheduling.
        `,
        `
          Topologiki tertipleme ugrukdyrylan siklsiz grafdaky depeleri şeýle
          tertipleýär welin, her bir ugrukdyrylan gapyrga öňki depeden soňky
          depä gidýär. Ol baglylyklary tertiplemekde peýdalydyr.
        `,
        `
          Топологическая сортировка строит порядок вершин ориентированного
          ациклического графа так, чтобы каждое ребро шло от более ранней
          вершины к более поздней. Используется для работы с зависимостями.
        `,
        graphKey,
      ),
    ];

    /*
     * ---------------------------------------------------------
     * 4. DYNAMIC PROGRAMMING
     * ---------------------------------------------------------
     */

    const dynamicProgramming = source(
      "Dynamic Programming",
      "Dinamik programmirleme",
      "Динамическое программирование",
      `
        Dynamic programming solves problems by dividing them into overlapping
        subproblems and storing already computed results. It is especially
        effective when a problem has optimal substructure and repeated subproblems.
      `,
      `
        Dinamik programmirleme meseläni biri-biriniň üstüni ýetirýän kiçi
        meseleler bilen çözüp, öň hasaplanan netijeleri saklaýar. Bu usul
        optimal gurluşly we gaýtalanýan kiçi meseleleri bolan ýagdaýlarda netijelidir.
      `,
      `
        Динамическое программирование решает задачи через подзадачи с
        пересекающимися вычислениями и сохраняет уже найденные результаты.
        Метод особенно эффективен при наличии оптимальной подструктуры.
      `,
    );

    const dpKey = dynamicProgramming.key;

    const dpChildren = [
      source(
        "Memoization",
        "Memozasiýa",
        "Мемоизация",
        `
          Memoization stores the result of a function for a particular input.
          When the same input appears again, the stored result is returned
          instead of recalculating it.
        `,
        `
          Memozasiýa funksiýanyň belli bir giriş üçin alan netijesini ýatda
          saklaýar. Şol giriş gaýtadan ýüze çykanda netije täzeden hasaplanman,
          saklanan bahadan alynýar.
        `,
        `
          Мемоизация сохраняет результат функции для определённого входа.
          При повторном появлении того же входа используется сохранённое значение.
        `,
        dpKey,
      ),

      source(
        "Tabulation",
        "Tabulýasiýa",
        "Табуляция",
        `
          Tabulation solves subproblems iteratively and stores their results
          in a table, usually starting from the smallest subproblems and
          building toward the final answer.
        `,
        `
          Tabulýasiýa kiçi meseleleri yzygiderli çözüp, olaryň netijelerini
          tablisa görnüşinde saklaýar we şol netijelerden esasy çözgüdi gurýar.
        `,
        `
          Табуляция решает подзадачи итеративно и сохраняет результаты в таблице,
          постепенно переходя от простых подзадач к итоговому решению.
        `,
        dpKey,
      ),

      source(
        "Fibonacci",
        "Fibonacci sanlary",
        "Числа Фибоначчи",
        `
          The Fibonacci sequence is a classical example used to demonstrate
          recursion and dynamic programming. Each value is related to the
          preceding values, making repeated subproblems easy to observe.
        `,
        `
          Fibonacci yzygiderliligi rekursiýany we dinamik programmirlemäni
          düşündirmek üçin nusgawy mysaldyr. Her bir baha öňki bahalar bilen
          bagly bolup, gaýtalanýan kiçi meseleleri görkezýär.
        `,
        `
          Последовательность Фибоначчи является классическим примером для
          изучения рекурсии и динамического программирования. Каждое число
          связано с предыдущими значениями.
        `,
        dpKey,
      ),

      source(
        "Knapsack Problem",
        "Çemodan meselesi",
        "Задача о рюкзаке",
        `
          The knapsack problem asks which items should be selected under a
          capacity constraint to maximize total value. Dynamic programming
          provides an important exact solution for the classical 0/1 version.
        `,
        `
          Çemodan meselesinde belli bir sygym çäginde haýsy zatlaryň saýlanmalydygy
          we umumy bahanyň mümkin boldugyça ulaldylmagy gözlenýär. 0/1 görnüşi
          üçin dinamik programmirleme möhüm çözgüt usulydyr.
        `,
        `
          В задаче о рюкзаке требуется выбрать предметы при ограничении
          вместимости так, чтобы максимизировать суммарную стоимость.
          Для классического варианта 0/1 применяется динамическое программирование.
        `,
        dpKey,
      ),

      source(
        "Longest Common Subsequence",
        "Iň uzyn umumy subsekwensiýa",
        "Наибольшая общая подпоследовательность",
        `
          The longest common subsequence problem asks for the longest sequence
          that appears in the same relative order in two sequences, although
          elements do not have to be adjacent.
        `,
        `
          Iň uzyn umumy subsekwensiýa iki yzygiderlilikde-de şol bir tertipde
          duş gelýän, ýöne hökmany suratda ýanaşyk bolmadyk elementleriň iň
          uzyn yzygiderliligini tapýar.
        `,
        `
          Задача о наибольшей общей подпоследовательности ищет самую длинную
          последовательность, которая встречается в двух последовательностях
          в одинаковом относительном порядке.
        `,
        dpKey,
      ),
    ];

    /*
     * ---------------------------------------------------------
     * 5. DATA STRUCTURES
     * ---------------------------------------------------------
     */

    const dataStructures = source(
      "Data Structures",
      "Maglumat gurluşlary",
      "Структуры данных",
      `
        Data structures organize information so that it can be stored,
        accessed and modified efficiently. Choosing an appropriate structure
        is an important part of algorithm design.
      `,
      `
        Maglumat gurluşlary maglumatlary netijeli saklamak, gözlemek we
        üýtgetmek üçin tertipleşdirýär. Dogry gurluşy saýlamak algoritm
        taýýarlamagyň möhüm bölegidir.
      `,
      `
        Структуры данных организуют информацию для эффективного хранения,
        доступа и изменения. Выбор подходящей структуры является важной
        частью разработки алгоритмов.
      `,
    );

    const dsKey = dataStructures.key;

    const dsChildren = [
      source(
        "Arrays",
        "Massiwler",
        "Массивы",
        `
          An array stores elements in an ordered collection. Elements are
          normally accessed by an index, which makes direct access efficient.
        `,
        `
          Massiw elementleri tertipli toplumda saklaýar. Elementlere indeks
          arkaly ýüzlenilýär we indeks boýunça göni giriş örän netijelidir.
        `,
        `
          Массив хранит элементы в упорядоченной коллекции. Доступ к элементу
          обычно выполняется по индексу, что обеспечивает быстрый прямой доступ.
        `,
        dsKey,
      ),

      source(
        "Stack",
        "Stek",
        "Стек",
        `
          A stack follows the LIFO principle: the last element inserted is
          the first element removed. Typical operations are push and pop.
        `,
        `
          Stek LIFO ýörelgesi boýunça işleýär: iň soňky goşulan element
          ilkinji çykarylýar. Esasy amallar push we pop-dur.
        `,
        `
          Стек работает по принципу LIFO: последний добавленный элемент
          извлекается первым. Основные операции — push и pop.
        `,
        dsKey,
      ),

      source(
        "Queue",
        "Nobat",
        "Очередь",
        `
          A queue follows the FIFO principle: the first element inserted is
          the first element removed. Queues are commonly used in BFS and
          scheduling algorithms.
        `,
        `
          Nobat FIFO ýörelgesi boýunça işleýär: ilkinji goşulan element
          ilkinji çykarylýar. Nobatlar BFS we meýilnamalaşdyrma algoritmlerinde
          giňden ulanylýar.
        `,
        `
          Очередь работает по принципу FIFO: первый добавленный элемент
          извлекается первым. Очереди широко применяются в BFS и планировании.
        `,
        dsKey,
      ),

      source(
        "Linked List",
        "Baglanyşykly sanaw",
        "Связный список",
        `
          A linked list consists of nodes where each node stores data and a
          reference to another node. It allows flexible insertion and removal
          without requiring contiguous memory.
        `,
        `
          Baglanyşykly sanaw maglumat saklaýan düwünlerden we indiki düwne
          görkeziji baglanyşykdan ybaratdyr. Ol elementleri goşmagy we aýyrmagy
          çeýe görnüşde ýerine ýetirmäge mümkinçilik berýär.
        `,
        `
          Связный список состоит из узлов, содержащих данные и ссылку на другой
          узел. Он позволяет удобно выполнять вставку и удаление элементов.
        `,
        dsKey,
      ),

      source(
        "Hash Table",
        "Haş tablisa",
        "Хеш-таблица",
        `
          A hash table stores key-value pairs and uses a hash function to
          determine where values should be stored. With a good hash function,
          average lookup can be close to O(1).
        `,
        `
          Haş tablisa açar-baha jübütlerini saklaýar we haş funksiýasy arkaly
          maglumatlaryň ýerleşýän ýerini kesgitleýär. Gowy haş funksiýasy bilen
          ortaça gözleg O(1)-e ýakyn bolup biler.
        `,
        `
          Хеш-таблица хранит пары ключ-значение и использует хеш-функцию
          для определения места хранения. При хорошем хешировании среднее
          время поиска может быть близко к O(1).
        `,
        dsKey,
      ),
    ];

    /*
     * ---------------------------------------------------------
     * 6. MATHEMATICAL FOUNDATIONS
     * ---------------------------------------------------------
     */

    const mathematics = source(
      "Mathematical Foundations",
      "Matematiki esaslar",
      "Математические основы",
      `
        Mathematics provides important concepts for computer science,
        including logic, sets, combinatorics, number theory and probability.
        These concepts are frequently used in algorithm design.
      `,
      `
        Matematika informatika üçin logika, köplükler, kombinatorika,
        sanlar teoriýasy we ähtimallyk ýaly möhüm düşünjeleri berýär.
        Bu düşünjeler algoritmleri taýýarlamakda giňden ulanylýar.
      `,
      `
        Математика предоставляет информатике важные понятия: логику,
        множества, комбинаторику, теорию чисел и вероятность. Эти знания
        широко применяются при разработке алгоритмов.
      `,
    );

    const mathKey = mathematics.key;

    const mathChildren = [
      source(
        "Logic",
        "Logika",
        "Логика",
        `
          Mathematical logic studies statements and their relationships.
          Logical operations such as AND, OR and NOT are fundamental to
          programming conditions and digital systems.
        `,
        `
          Matematiki logika pikirleriň we olaryň arasyndaky gatnaşyklary
          öwrenýär. AND, OR, NOT ýaly logiki amallar programmirlemedäki
          şertleriň we sanly ulgamlaryň esasyny düzýär.
        `,
        `
          Математическая логика изучает высказывания и отношения между ними.
          Операции AND, OR и NOT являются основой условий в программировании
          и цифровых системах.
        `,
        mathKey,
      ),

      source(
        "Sets",
        "Köplükler",
        "Множества",
        `
          Set theory studies collections of distinct objects. Operations such
          as union, intersection and difference are useful for representing
          and manipulating groups of data.
        `,
        `
          Köplükler teoriýasy tapawutly obýektleriň toplumlaryny öwrenýär.
          Birleşme, kesişme we tapawut ýaly amallar maglumat toplumlaryny
          beýan etmekde peýdalydyr.
        `,
        `
          Теория множеств изучает совокупности различных объектов.
          Объединение, пересечение и разность используются для работы
          с группами данных.
        `,
        mathKey,
      ),

      source(
        "Combinatorics",
        "Kombinatorika",
        "Комбинаторика",
        `
          Combinatorics studies methods for counting and arranging objects.
          Permutations, combinations and variations are important tools for
          analyzing possible states and algorithmic solutions.
        `,
        `
          Kombinatorika obýektleri sanamagyň we ýerleşdirmegiň usullaryny
          öwrenýär. Permutasiýa, kombinasiýa we ýerleşdiriş düşünjeleri
          mümkin bolan ýagdaýlary seljermekde möhümdir.
        `,
        `
          Комбинаторика изучает способы подсчёта и упорядочивания объектов.
          Перестановки, сочетания и размещения применяются для анализа
          возможных состояний и алгоритмов.
        `,
        mathKey,
      ),

      source(
        "Number Theory",
        "Sanlar teoriýasy",
        "Теория чисел",
        `
          Number theory studies properties of integers. Divisibility, prime
          numbers, greatest common divisor and modular arithmetic have many
          applications in algorithms and cryptography.
        `,
        `
          Sanlar teoriýasy bitin sanlaryň häsiýetlerini öwrenýär. Bölünijilik,
          sada sanlar, iň uly umumy bölüji we modul arifmetikasy algoritmlerde
          we kriptografiýada giňden ulanylýar.
        `,
        `
          Теория чисел изучает свойства целых чисел. Делимость, простые числа,
          наибольший общий делитель и модульная арифметика применяются в
          алгоритмах и криптографии.
        `,
        mathKey,
      ),
    ];

    /*
     * ---------------------------------------------------------
     * INSERT ROOTS
     * ---------------------------------------------------------
     */

    const roots = [
      programming,
      algorithms,
      graphTheory,
      dynamicProgramming,
      dataStructures,
      mathematics,
    ];

    /*
     * The database table does not contain `key` or `parentKey`.
     * They are only temporary identifiers used by this seeder.
     */

    await queryInterface.bulkInsert(
      "tbl_sources",
      roots.map(({ key, parentKey, ...item }) => ({
        ...item,
        status: "active",
      })),
    );

    /*
     * ---------------------------------------------------------
     * INSERT CHILDREN
     * ---------------------------------------------------------
     *
     * We resolve parent IDs from the inserted root records.
     */

    const [rootRows] = await queryInterface.sequelize.query(`
      SELECT id, titleEn
      FROM tbl_sources
      WHERE titleEn IN (
        'Programming',
        'Algorithms',
        'Graph Theory',
        'Dynamic Programming',
        'Data Structures',
        'Mathematical Foundations'
      )
    `);

    const rootMap = {};

    for (const row of rootRows) {
      rootMap[row.titleEn] = row.id;
    }

    /*
     * Map our temporary parent keys to database IDs.
     */

    const parentIdByKey = {
      [programmingKey]: rootMap["Programming"],
      [algorithmsKey]: rootMap["Algorithms"],
      [graphKey]: rootMap["Graph Theory"],
      [dpKey]: rootMap["Dynamic Programming"],
      [dsKey]: rootMap["Data Structures"],
      [mathKey]: rootMap["Mathematical Foundations"],
    };

    const children = [
      ...programmingChildren,
      ...algorithmChildren,
      ...graphChildren,
      ...dpChildren,
      ...dsChildren,
      ...mathChildren,
    ];

    await queryInterface.bulkInsert(
      "tbl_sources",
      children.map(({ key, parentKey, ...item }) => ({
        ...item,
        parentId: parentIdByKey[parentKey],
        status: Math.random() < 0.7 ? "active" : "deactive",
      })),
    );
  },

  async down(queryInterface) {
    /*
     * Because this is seed/demo curriculum data, remove all sources
     * created by this seeder.
     *
     * The table is hierarchical, so deleting everything at once is
     * simpler and safer than trying to remove parents before children.
     */

    await queryInterface.bulkDelete("tbl_sources", null, {});
  },
};
