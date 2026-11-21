"use strict";

const { randomInt } = require("crypto");

const MIN_SUBMISSIONS = 10;
const MAX_SUBMISSIONS = 15;
const DAYS_BACK = 30;

const randomItem = (items) => items[randomInt(items.length)];

const randomDate = () => {
  const now = Date.now();
  const past = now - DAYS_BACK * 24 * 60 * 60 * 1000;

  return new Date(randomInt(past, now + 1));
};

const verdicts = [
  "AC",
  "AC",
  "AC",
  "AC",
  "AC",
  "WA",
  "WA",
  "WA",
  "TLE",
  "RE",
  "CE",
  "MLE",
  "PE",
];

const languages = ["cpp", "python", "java", "pascal", "go"];

const sampleCodes = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    cout << n << '\\n';

    return 0;
}`,
  python: `n = int(input())
print(n)`,
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(n);
        sc.close();
    }
}`,
  pascal: `program Main;
var
  n: LongInt;
begin
  ReadLn(n);
  WriteLn(n);
end.`,
  go: `package main

import "fmt"

func main() {
    var n int
    fmt.Scan(&n)
    fmt.Println(n)
}`,
};

const randomExecutionTime = (verdict, timeLimitMs) => {
  if (verdict === "TLE") {
    return (
      timeLimitMs + randomInt(1, Math.max(2, Math.floor(timeLimitMs * 0.3)))
    );
  }

  if (verdict === "CE") {
    return null;
  }

  return randomInt(1, Math.max(2, Math.min(timeLimitMs, 1000)));
};

const randomMemory = (verdict, memoryLimitMb) => {
  if (verdict === "MLE") {
    return memoryLimitMb * 1024 + randomInt(1, 1025);
  }

  if (verdict === "CE") {
    return null;
  }

  return randomInt(1024, Math.max(1025, Math.min(memoryLimitMb * 1024, 65536)));
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize;
    const transaction = await sequelize.transaction();

    try {
      const problems = await sequelize.query(
        `SELECT id, contestId, timeLimitMs, memoryLimitMb
         FROM tbl_problems
         ORDER BY id ASC`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      const users = await sequelize.query(
        `SELECT id FROM tbl_users ORDER BY id ASC`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      if (problems.length === 0) {
        console.log("No problems found. Nothing to seed.");
        await transaction.commit();
        return;
      }

      if (users.length === 0) {
        throw new Error(
          "No users found in tbl_users. Create users before running this seeder.",
        );
      }

      const existingCounts = await sequelize.query(
        `SELECT problemId, COUNT(*) AS total
         FROM tbl_submissions
         GROUP BY problemId`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      const countByProblem = new Map(
        existingCounts.map((row) => [Number(row.problemId), Number(row.total)]),
      );

      const submissions = [];
      const now = new Date();

      for (const problem of problems) {
        const existing = countByProblem.get(Number(problem.id)) || 0;

        // Preserve existing submissions and fill each problem
        // to a randomly selected total between 10 and 15.
        const target = randomInt(MIN_SUBMISSIONS, MAX_SUBMISSIONS + 1);

        const missing = Math.max(0, target - existing);

        for (let i = 0; i < missing; i++) {
          const user = randomItem(users);
          const verdict = randomItem(verdicts);
          const lang = randomItem(languages);
          const createdAt = randomDate();

          const timeMs = randomExecutionTime(
            verdict,
            problem.timeLimitMs || 1000,
          );

          const memoryKb = randomMemory(verdict, problem.memoryLimitMb || 256);

          submissions.push({
            userId: user.id,
            problemId: problem.id,
            contestId: problem.contestId || null,
            verdict,
            status: "finished",
            lang,
            code: sampleCodes[lang],
            timeMs,
            memoryKb,
            log: verdict === "AC" ? null : `Demo submission result: ${verdict}`,
            duringContest: Boolean(problem.contestId),
            score: verdict === "AC" ? 100 : 0,
            createdAt,
            updatedAt: createdAt,
          });
        }
      }

      if (submissions.length > 0) {
        await queryInterface.bulkInsert("tbl_submissions", submissions, {
          transaction,
        });
      }

      await transaction.commit();

      console.log(
        `Created ${submissions.length} demo submissions for ${problems.length} problems.`,
      );
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down() {
    // Intentionally do not delete submissions because this seeder
    // fills existing problems and may leave their existing records intact.
  },
};
