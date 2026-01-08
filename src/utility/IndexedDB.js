import { openDB } from "idb";
import { decodeAndEncode } from "./functions";
import moment from "moment";
import { APP_NAME } from "constants/app.constant";
import Cookies from "js-cookie";
import { secPrefix } from "utils/setToken";
import { disconnectSocket } from "socketManager";

class IndexedDB {
  constructor() {
    this.DB_NAME = String(APP_NAME).trim().replace(/\s+/g, "_").toLowerCase();
    this.STORE_NAME = "crm_store";

    this.dbPromise = openDB(this.DB_NAME, 1, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      },
    });
  }

  // Store Token
  /**
   * @param {"jwt" | "info"} option
   */
  async storeToken(data = null, option) {
    try {
      if (!data) throw new Error("Please provide a data");
      let name = option == "jwt" ? "jwt" : "info";
      const db = await this.dbPromise;
      data = option === "jwt" ? await decodeAndEncode(data) : data;
      await db.put(this.STORE_NAME, data, name);
      return "stored successfully";
    } catch (error) {
      console.error("Error storing:", error);
      return error;
    }
  }

  // Retrieve Token
  /**
   * @param {"jwt" | "info"} option
   */
  async getToken(option) {
    try {
      const db = await this.dbPromise;
      let name = option == "jwt" ? "jwt" : "info";
      const data = await db.get(this.STORE_NAME, name);
      let decodeData = await decodeAndEncode(data, false);

      if (option === "jwt" && decodeData) {
        const requestAt = moment()
          .add(3, "minute")
          .format("YYYY-MM-DD HH:mm:ss");
        let requestToken = await decodeAndEncode({
          token: decodeData,
          requestAt,
        });

        return requestToken;
      }

      if (option === "info" && decodeData) {
        return decodeData;
      }

      return null;
    } catch (error) {
      console.error("Error retrieving token:", error);
      return error;
    }
  }

  // Remove Token
  /**
   * @param {"jwt" | "info" | "all"} option
   */
  async removeToken(option) {
    try {
      const db = await this.dbPromise;

      switch (option) {
        case "all":
          [...secPrefix, "_SEC_token_set", "refresh", "sToken", "_s_time"].map(
            (name) => {
              Cookies.remove(name);
            },
          );

          disconnectSocket();

          await db.delete(this.STORE_NAME, "jwt");
          await db.delete(this.STORE_NAME, "info");
          break;
        case "jwt":
          await db.delete(this.STORE_NAME, "jwt");
          break;
        case "info":
          await db.delete(this.STORE_NAME, "info");
          break;
        default:
          throw new Error(
            "Invalid option. Please provide 'jwt', 'info', or 'all'",
          );
      }
      return "Removed successfully";
    } catch (error) {
      console.error("Error removing token:", error);
      return error;
    }
  }
}

export default new IndexedDB();
