import { useCpfStore } from "@/hooks/use-cpf-store";
import { selectFormStep } from "@/stores/selectors";

const useFormStep = () => {
  return useCpfStore(selectFormStep);
};

export default useFormStep;
