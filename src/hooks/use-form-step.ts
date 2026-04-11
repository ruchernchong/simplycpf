import { useAtomValue } from "jotai";
import { formStepAtom } from "@/atoms/form-step-atom";

const useFormStep = () => {
  return useAtomValue(formStepAtom);
};

export default useFormStep;
