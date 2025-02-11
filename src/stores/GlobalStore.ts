import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface GlobalStore {
  user: any;
}

const globalStore = create(
  devtools(
    combine(
      immer<GlobalStore>((set) => ({
        user: null,
      })),
    ),
  ),
);

export default globalStore;
