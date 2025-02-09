import { createContext, useContext } from 'react';
export interface PageNode {
  children: React.ReactNode;
}

export const createStore = <T,>(data: T) => {
  const Context = createContext<T>({} as T);

  const StoreProvider: React.FC<PageNode> = ({ children }: PageNode) => {
    return (
      <Context.Provider value={data as unknown as T}>
        {children}
      </Context.Provider>
    );
  };

  const useStore = () => {
    const store = useContext(Context);
    if (!store) {
      throw new Error('外层没有包裹对应的Provider');
    }
    return store;
  };

  return { useStore, StoreProvider };
};
