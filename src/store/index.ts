import { create } from 'zustand';
import { useMindmapSlice } from './mindmap';

const useStore = create<any, any>((...a) => ({
  ...useMindmapSlice(...a),
}));

export default useStore;
