// One place to add / change languages.
//   src        file name the source code is saved as
//   compile    shell command (null = nothing to compile)
//   run(mem)   command that runs the program (mem = problem memory limit in MB)
//   extraMemMb extra memory given to the sandbox on top of the problem limit
//              (JVM / Go runtimes need overhead)
//   pids       max processes/threads
//   env        extra environment variables
const JAVA = (v) => `/usr/lib/jvm/java-${v}-openjdk-amd64/bin`; // amd64 paths; change for arm64

const cpp = (std) => ({
  name: `C++${std}`,
  src: 'main.cpp',
  compile: `g++ -std=c++${std} -O2 -pipe -static -DONLINE_JUDGE -o main main.cpp`,
  run: () => './main',
  extraMemMb: 0,
  pids: 32,
  env: {},
});

const java = (v) => ({
  name: `Java ${v}`,
  src: 'Main.java', // the public class must be called Main
  compile: `${JAVA(v)}/javac -encoding UTF-8 Main.java`,
  run: (mem) =>
    `${JAVA(v)}/java -Xmx${mem}m -Xss64m -XX:+UseSerialGC -XX:ActiveProcessorCount=1 -Dfile.encoding=UTF-8 Main`,
  extraMemMb: 384,
  pids: 64,
  env: {},
});

const LANGS = {
  cpp14: cpp(14),
  cpp17: cpp(17),
  cpp20: cpp(20),
  cpp23: cpp(23), // there is no C++21; the standards are 14, 17, 20, 23
  python3: {
    name: 'Python 3',
    src: 'main.py',
    compile: 'python3 -m py_compile main.py', // syntax errors become CE
    run: () => 'python3 main.py',
    extraMemMb: 0,
    pids: 32,
    env: { PYTHONIOENCODING: 'utf-8' },
  },
  pascal: {
    name: 'Free Pascal',
    src: 'main.pas',
    compile: 'fpc -O2 -Xs -omain main.pas',
    run: () => './main',
    extraMemMb: 0,
    pids: 32,
    env: {},
  },
  go: {
    name: 'Go',
    src: 'main.go',
    compile: 'go build -o main main.go',
    run: () => './main',
    extraMemMb: 64,
    pids: 64,
    env: { HOME: '/tmp', GOCACHE: '/tmp/gocache', GOPATH: '/tmp/go' },
  },
  java11: java(11),
  java17: java(17),
  java21: java(21),
};

// names the backend may send -> key in LANGS
const ALIASES = {
  'c++14': 'cpp14', 'c++17': 'cpp17', 'c++20': 'cpp20', 'c++23': 'cpp23',
  cpp: 'cpp17', 'c++': 'cpp17',
  python: 'python3', py: 'python3', python3: 'python3',
  pas: 'pascal', fpc: 'pascal', golang: 'go',
  java: 'java17',
};

function getLang(name) {
  const key = String(name || '').toLowerCase();
  return LANGS[key] || LANGS[ALIASES[key]] || null;
}

module.exports = { LANGS, getLang };
