import { create } from 'zustand';

const useStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('userInfo')) || null,
  login: (userInfo) => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    set({ user: userInfo });
  },
  logout: () => {
    localStorage.removeItem('userInfo');
    set({ user: null });
  },
  
  shopSettings: null,
  setShopSettings: (settings) => set({ shopSettings: settings }),
}));

export default useStore;
