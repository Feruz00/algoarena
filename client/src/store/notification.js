import { create } from "zustand";
import { persist } from "zustand/middleware";

const useNotification = create(
  persist(
    (set) => ({
      notification: false,

      setNotification: (notification) => set({ notification }),

      clearNotification: () => set({ notification: false }),
    }),
    {
      name: "notification",
    },
  ),
);

export default useNotification;
