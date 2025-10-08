// IndexedDB utility for menu data storage
export interface MenuItem {
  menu_id: number;
  dish_name: string;
  image_url: string;
  category: string;
  price: number;
  description?: string;
  stock_status: string;
  created_at?: string;
  updated_at?: string;
}

const DB_NAME = "CardiacDelightsMenu";
const DB_VERSION = 1;
const STORE_NAME = "menu";

class MenuDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "menu_id",
          });
          store.createIndex("category", "category", { unique: false });
          store.createIndex("updated_at", "updated_at", { unique: false });
        }
      };
    });
  }

  async saveMenu(menu: MenuItem[]): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing data
    await new Promise((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve(undefined);
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Add new data with timestamp
    const promises = menu.map((item) => {
      const itemWithTimestamp = {
        ...item,
        cached_at: Date.now(),
      };

      return new Promise((resolve, reject) => {
        const request = store.add(itemWithTimestamp);
        request.onsuccess = () => resolve(undefined);
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(promises);
    console.log(`✅ Saved ${menu.length} menu items to IndexedDB`);
  }

  async getMenu(category?: string): Promise<MenuItem[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);

      let request: IDBRequest;

      if (category) {
        const index = store.index("category");
        request = index.getAll(category);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        const items = request.result as MenuItem[];
        console.log(
          `📖 Retrieved ${items.length} items from IndexedDB${
            category ? ` for category: ${category}` : ""
          }`
        );
        resolve(items);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getCacheAge(): Promise<number | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result;
        if (items.length === 0) {
          resolve(null);
          return;
        }

        const oldestItem = items.reduce((oldest, item) => {
          return (item.cached_at || 0) < (oldest.cached_at || 0)
            ? item
            : oldest;
        });

        resolve(Date.now() - (oldestItem.cached_at || 0));
      };

      request.onerror = () => reject(request.error);
    });
  }

  async clearCache(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log("🗑️ Cleared IndexedDB cache");
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const menuDB = new MenuDatabase();
