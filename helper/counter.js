import moment from "moment";
import models from "@/models/index.js";

class Counter {
  #id;
  #identifier;
  #CounterModel;
  #isSave;

  /**
   * Create a new Counter instance.
   *
   * @constructor
   * @param {Object} params - Constructor parameters.
   * @param {string} params.counterId - Unique counter identifier (`_id`).
   * @param {boolean} [params.isSave=true] - Automatically persists the counter increment.
   *                                   When true, the value is saved immediately and calling counter.save() is not required..
   *
   * @throws {Error} If `counterId` is missing.
   */
  constructor({ counterId, req, isAdmin = false, isCommon = false, isSave = true }) {
    if (!counterId) throw new Error("Counter ID is required");

    this.#id = counterId;
    this.#identifier = moment().format("YYMMDD");
    this.#isSave = isSave;

    this.#CounterModel = models.Counter;
  }

  /**
   * Get current counter value (without increment)
   *
   * @async
   * @param {number} [defaultValue=0]
   * @returns {Promise<number>}
   */
  async init(defaultValue = 0) {
    const doc =
      (await this.#CounterModel.findOne({ _id: this.#id }).lean()) || (await this.#CounterModel.create({ _id: this.#id, value: defaultValue }));

    return Number(doc.value);
  }

  /**
   * Generate a unique ID string.
   *
   * Format:
   *   PREFIX + IDENTIFIER + PADDED_COUNTER
   *
   * @async
   *
   * @param {object} options
   * @param {string} options.prefix - Prefix for the ID (e.g., "INV").
   * @param {string} [options.identifier=this.#identifier] - Custom or date identifier.
   * @param {number} [options.pad=5] - Zero padding.
   *
   * @returns {Promise<string>} Generated unique ID.
   *
   * @example
   * // Auto-save mode (default): no need to call .save() manually
   * const counter = new Counter({ counterId: "invoice", req });
   * const id = await counter.uniqueId("INV");
   * // ID is already persisted — no manual save required
   * // Result: "INV25042000001"
   *
   * @example
   * // Manual save mode: set isSave to false
   * const counter = new Counter({ counterId: "invoice", req, isSave: false });
   * const id = await counter.uniqueId("INV");
   * await counter.save(); // Required to persist the generated ID
   * // Result: "INV25042000001"
   */
  async uniqueId({ prefix, identifier = this.#identifier, pad = 5 }) {
    if (!prefix) throw new Error("Prefix is required for uniqueId");

    let nextValue;

    if (this.#isSave) {
      let doc = await this.#CounterModel.findOneAndUpdate({ _id: this.#id }, { $inc: { value: 1 } }, { new: true, upsert: true });

      nextValue = Number(doc.value);
    } else {
      const currentValue = await this.init();
      nextValue = currentValue + 1;
    }

    const padded = nextValue.toString().padStart(pad, "0");
    return `${prefix}${identifier}${padded}`;
  }

  /**
   * Persist a single increment and return full updated document.
   *
   * @async
   * @returns {Promise<object>} Updated Mongoose document.
   */
  async save() {
    if (this.#isSave) return;
    return this.#CounterModel.findOneAndUpdate({ _id: this.#id }, { $inc: { value: 1 } }, { new: true, upsert: true });
  }

  /**
   * Batch-generate multiple unique IDs with one atomic DB update.
   *
   * @async
   *
   * @param {object} options
   * @param {string} options.prefix - Prefix for the ID (e.g., "INV").
   * @param {number} options.count - Number of IDs to generate.
   * @param {string} [options.identifier=this.#identifier] - Custom or date identifier.
   * @param {number} [options.pad=5] - Zero padding of numeric part.
   * @returns {Promise<string[]>} Array of generated unique IDs.
   *
   * @example
   * const ids = await counter.batchUniqueId("TRX", 3);
   * // [
   * //    "TRX25042000001",
   * //    "TRX25042000002",
   * //    "TRX25042000003"
   * // ]
   */
  async batchUniqueId({ prefix, count = 1, identifier = this.#identifier, pad = 5 }) {
    if (!prefix) throw new Error("Prefix is required for batchUniqueId");
    if (count < 1) throw new Error("Count must be >= 1");

    const updated = await this.#CounterModel.findOneAndUpdate({ _id: this.#id }, { $inc: { value: count } }, { new: true, upsert: true });

    const end = Number(updated.value);
    const start = end - count + 1;

    const ids = [];

    for (let i = 0; i < count; i++) {
      ids.push(`${prefix}${identifier}${(start + i).toString().padStart(pad, "0")}`);
    }

    return ids;
  }
}

export default Counter;
