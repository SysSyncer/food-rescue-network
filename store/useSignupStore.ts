import { create } from "zustand";

interface SignupState {
  step: number;
  name: string;
  email: string;
  password: string;
  role: "donor" | "volunteer" | "shelter" | "";
  profileImage: string | null;
  setStep: (step: number) => void;
  setFormData: (
    data: Partial<Omit<SignupState, "setStep" | "setFormData">>
  ) => void;
}

export const useSignupStore = create<SignupState>((set) => ({
  step: 1,
  name: "",
  email: "",
  password: "",
  role: "",
  profileImage: null,
  setStep: (step) => set({ step }),
  setFormData: (data) => set((state) => ({ ...state, ...data })),
}));
