"use strict";

const instanceId = Number(process.env.NODE_APP_INSTANCE ?? 0);
const boxesPerInstance = Number(process.env.BOXES_PER_INSTANCE ?? 4);
const baseId = Number(process.env.ISOLATE_BOX_BASE ?? 0);

if (
  !Number.isInteger(instanceId) ||
  !Number.isInteger(boxesPerInstance) ||
  !Number.isInteger(baseId) ||
  instanceId < 0 ||
  boxesPerInstance < 1 ||
  baseId < 0
) {
  throw new Error("Invalid Isolate box pool configuration");
}

const firstBoxId = baseId + instanceId * boxesPerInstance;

class BoxPool {
  constructor() {
    this.available = Array.from(
      { length: boxesPerInstance },
      (_, i) => firstBoxId + i,
    );

    this.waiting = [];
    this.used = new Set();
  }

  async acquire() {
    let boxId;

    if (this.available.length > 0) {
      // Immediately acquire an available box.
      boxId = this.available.shift();
    } else {
      // Wait until another submission releases a box.
      boxId = await new Promise((resolve) => {
        this.waiting.push(resolve);
      });
    }

    if (this.used.has(boxId)) {
      throw new Error(`[BoxPool] Box ${boxId} is already allocated`);
    }

    this.used.add(boxId);

    return boxId;
  }

  release(boxId) {
    if (!this.used.has(boxId)) {
      throw new Error(`[BoxPool] Cannot release unallocated box ${boxId}`);
    }

    this.used.delete(boxId);

    // FIFO: give the released box to the oldest waiting submission.
    const next = this.waiting.shift();

    if (next) {
      // Do not add to used here.
      // acquire() will add it after receiving the box.
      next(boxId);
    } else {
      this.available.push(boxId);
    }
  }

  get stats() {
    return {
      instanceId,
      total: boxesPerInstance,
      available: this.available.length,
      running: this.used.size,
      waiting: this.waiting.length,
    };
  }
}

const pool = new BoxPool();

console.log("[BoxPool] Initialized", {
  instanceId,
  firstBoxId,
  lastBoxId: firstBoxId + boxesPerInstance - 1,
  boxesPerInstance,
});

module.exports = pool;
